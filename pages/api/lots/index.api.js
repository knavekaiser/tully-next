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
    const { from, to, season } = req.query;
    const filters = {
      ...(from && to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
      ...(season && { season }),
    };
    Lot.aggregate([
      {
        $facet: {
          lots: [{ $match: filters }, { $sort: { ref: 1 } }],
          months: monthAggregate(),
        },
      },
    ]).then((data) => {
      const { lots, months } = data[0];
      res.json({ code: "ok", lots, months });
    });
  })
  .post((req, res) => {
    const { date, products, season } = req.body;
    try {
      const newWork = new Lot({ date, products, season });
      newWork
        .save()
        .then((newWork) => {
          res.json({ code: "ok", content: newWork });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json("something went wrong");
        });
    } catch (err) {
      res.status(400).json("provide correct data");
    }
  })
  .patch((req, res) => {
    const { _id, date } = req.body;
    Lot.findByIdAndUpdate(_id, { ...req.body }, { new: true })
      .then((update) => {
        console.log(date, update.date);
        res.json({ code: "ok", content: update });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json("something went wrong");
      });
  });
