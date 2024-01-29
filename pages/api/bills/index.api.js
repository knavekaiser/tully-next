import nextConnect from "next-connect";
import { auth } from "../auth.api";
import { monthAggregate } from "utils/db";

export default nextConnect({
  onError(err, req, res) {
    console.log(err);
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
})
  .use((req, res, next) => {
    auth(req, true)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        res.status(401).json({ code: 401, message: "Unauthorized" });
      });
  })
  .get((req, res) => {
    const { from, to, ref } = req.query;
    if (ref) {
      Bill.findOne({ ref }).then((bill) => {
        if (bill) {
          res.json({ code: "ok", bill });
        } else {
          res.json({ code: 400 });
        }
      });
      return;
    }
    const filters = {
      ...(from && to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
    };
    Bill.aggregate([
      {
        $facet: {
          bills: [{ $match: filters }, { $sort: { ref: 1 } }],
          months: monthAggregate(),
        },
      },
    ]).then((data) => {
      const { bills, months } = data[0];
      res.json({ bills, months });
    });
  })
  .post((req, res) => {
    const { date, ref, products } = req.body;
    new Bill({ date, ref, products })
      .save()
      .then((newBill) => {
        res.json({ code: "ok", content: newBill });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({ message: "ref exists" });
        } else {
          console.log(err);
          res.status(400).json({ message: "invalid data" });
        }
      });
  })
  .patch((req, res) => {
    const { _id, date, ref, products } = req.body;
    Bill.findByIdAndUpdate(_id, { date, ref, products })
      .then(() => Bill.findById(_id))
      .then((updated) => {
        res.json({ code: "ok", content: updated });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({ message: "ref exists" });
        } else {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        }
      });
  });
