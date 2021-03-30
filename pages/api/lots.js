import nextConnect from "next-connect";
import { auth } from "./auth";
import { monthAggregate } from "../../utils/db";

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
      .then((user) => {
        const { fy, from, to } = req.query;
        const filters = {
          ...(fy !== "all" && { fy }),
          ...(from &&
            to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
        };
        Lot.aggregate([
          {
            $facet: {
              lots: [{ $match: filters }, { $sort: { ref: 1 } }],
              months: monthAggregate(fy),
            },
          },
        ]).then((data) => {
          const { lots, months } = data[0];
          res.json({ code: "ok", lots, months });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { date, fy, products } = req.body;
        try {
          const newWork = new Lot({ date, fy, products });
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
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, date, fy, products, paid } = req.body;
        Lot.findByIdAndUpdate(_id, { date, fy, products })
          .then(() => Lot.findById(_id))
          .then((update) => {
            console.log(date, update.date);
            res.json({ code: "ok", content: update });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true)
      .then((user) => {
        EmpWork.findOneAndDelete({ _id: req.body._id })
          .then(() => {
            res.json({ code: "ok" });
            Employee.updateWork(req.body._id);
          })
          .catch((err) => {
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
