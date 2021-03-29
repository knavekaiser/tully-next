import nextConnect from "next-connect";
import { auth } from "./auth";
import { getMonths } from "../../utils/db";

export default nextConnect({
  onError(err, req, res) {
    console.log(err);
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
})
  .get((req, res) => {
    auth(req, true)
      .then(async (user) => {
        const { fy, from, to, ref } = req.query;
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
          ...(fy !== "all" && { fy }),
          ...(from && to && { date: { $gte: from, $lte: to } }),
        };
        const [bills, months] = await Promise.all([
          Bill.find(filters).sort({ ref: 1 }),
          getMonths(Bill, fy),
        ]);
        res.json({ bills, months });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { date, fy, ref, products } = req.body;
        new Bill({ date, fy, ref, products })
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
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, date, fy, ref, products } = req.body;
        Bill.findByIdAndUpdate(_id, { date, fy, ref, products })
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
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Bill.findByIdAndDelete(req.body._id)
        .then(() => res.json({ code: "ok" }))
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });
