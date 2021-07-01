import nextConnect from "next-connect";
import { auth } from "./auth";
import { monthAggregate } from "../../utils/db";

function getProduction(work, lastDay) {
  const lastWork = work.filter(
    (item) => item?.date.toString() === lastDay.toString()
  )[0];
  const lastWeek = {
    paid: lastWork?.paid || 0,
    qnt: lastWork?.products.reduce((p, c) => p + c.qnt, 0) || 0,
  };
  return { lastDay: lastWeek };
}

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
    auth(req)
      .then((user) => {
        const { from, to, emp, season } = req.query;
        const query = {
          ...(season && { season }),
          ...(emp && { _id: ObjectID(emp) }),
        };
        const dateFilter = {
          ...(from &&
            to && {
              date: {
                $gte: new Date(from),
                $lte: new Date(to),
              },
            }),
        };
        Employee.aggregate([
          { $match: query },
          {
            $lookup: {
              from: "empworks",
              as: "work",
              pipeline: [{ $match: dateFilter }],
            },
          },
          {
            $set: {
              work: {
                $filter: {
                  input: "$work",
                  as: "work",
                  cond: {
                    $eq: ["$_id", "$$work.employee"],
                  },
                },
              },
            },
          },
          {
            $set: {
              work: {
                $map: {
                  input: "$work",
                  as: "work",
                  in: {
                    _id: "$$work._id",
                    employee: "$$work.employee",
                    paid: "$$work.paid",
                    date: "$$work.date",
                    products: {
                      $map: {
                        input: "$$work.products",
                        as: "product",
                        in: {
                          _id: "$$product._id",
                          dress: "$$product.dress",
                          qnt: "$$product.qnt",
                          group: "$$product.group",
                          production: {
                            $multiply: ["$$product.qnt", "$$product.group"],
                          },
                        },
                      },
                    },
                    production: {
                      $reduce: {
                        input: "$$work.products",
                        initialValue: 0,
                        in: {
                          $add: [
                            "$$value",
                            {
                              $multiply: ["$$this.group", "$$this.qnt"],
                            },
                          ],
                        },
                      },
                    },
                    qnt: {
                      $reduce: {
                        input: "$$work.products",
                        initialValue: 0,
                        in: {
                          $add: ["$$value", "$$this.qnt"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $set: {
              paid: { $sum: "$work.paid" },
              production: { $sum: "$work.production" },
              qnt: { $sum: "$work.qnt" },
              deu: {
                $subtract: [
                  { $sum: "$work.production" },
                  { $sum: "$work.paid" },
                ],
              },
            },
          },
          {
            $unwind: {
              path: "$work",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $set: { date: "$work.date" } },
          { $sort: { "work.date": -1 } },
          {
            $facet: {
              emps: [
                {
                  $group: {
                    _id: "$_id",
                    work: { $push: "$work" },
                    lastDay: {
                      $first: {
                        paid: "$work.paid",
                        qnt: {
                          $sum: {
                            $reduce: {
                              input: "$work.products",
                              initialValue: 0,
                              in: {
                                $add: ["$$value", "$$this.qnt"],
                              },
                            },
                          },
                        },
                      },
                    },
                    name: { $first: "$name" },
                    season: { $first: "$season" },
                    pass: { $first: "$pass" },
                    deu: { $first: "$deu" },
                    paid: { $first: "$paid" },
                    production: { $first: "$production" },
                    qnt: { $first: "$qnt" },
                  },
                },
                { $sort: { name: 1 } },
              ],
              months: monthAggregate(),
            },
          },
          {
            $set: { lastDate: { $first: "$lastDate.date" } },
          },
        ])
          .then((data_arr) => {
            const { months, emps, lastDate } = data_arr[0];
            res.json({
              code: "ok",
              content: { allEmps: emps, months, lastDate },
            });
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
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { name, pass, season } = req.body;
        const newEmp = new Employee({
          name,
          pass,
          season,
        })
          .save()
          .then((newEmp) => {
            res.json({ code: "ok", content: newEmp });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({
                code: "same exists",
                fields: Object.keys(err.keyValue),
              });
              return;
            }
            console.log(err);
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, name, pass } = req.body;
        Employee.findByIdAndUpdate(req.body._id, { name, pass })
          .then(() => Employee.findById(_id))
          .then((update) => {
            res.json({ code: "ok", content: update });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({
                code: "same exists",
                fields: Object.keys(err.keyValue),
              });
            } else {
              res.status(500).json("something went wrong");
            }
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true)
      .then((user) => {
        Employee.findByIdAndDelete(req.body._id)
          .then(() => EmpWork.deleteMany({ employee: req.body._id }))
          .then(() => {
            res.json({ code: "ok" });
          })
          .catch((err) => {
            console.log(err);
            res
              .status(500)
              .json({ code: 500, messaage: "something went wrong" });
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
