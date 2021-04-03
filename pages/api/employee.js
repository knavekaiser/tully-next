import nextConnect from "next-connect";
import { auth } from "./auth";
import { monthAggregate } from "../../utils/db";

const rate = {
  1: 20,
  S: 24,
  L: 36,
  F: 43,
  iS: 2.5,
  iL: 4,
};
function getProduction(work, rate, lastDay) {
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
        const { fy, from, to, emp } = req.query;
        const query = {
          ...(emp && { employee: ObjectID(emp) }),
          ...(fy !== "all" && { fy }),
          ...(from &&
            to && {
              date: {
                $gte: new Date(from),
                $lte: new Date(to),
              },
            }),
        };
        EmpWork.aggregate([
          {
            $facet: {
              emps: [
                { $match: query },
                {
                  $set: {
                    products: {
                      $map: {
                        input: "$products",
                        in: {
                          _id: "$$this._id",
                          qnt: "$$this.qnt",
                          dress: "$$this.dress",
                          group: "$$this.group",
                          cost: {
                            $multiply: [
                              "$$this.qnt",
                              {
                                $switch: {
                                  branches: [
                                    {
                                      case: { $eq: ["$$this.group", "L"] },
                                      then: 36,
                                    },
                                    {
                                      case: { $eq: ["$$this.group", "S"] },
                                      then: 24,
                                    },
                                    {
                                      case: { $eq: ["$$this.group", "1"] },
                                      then: 20,
                                    },
                                    {
                                      case: { $eq: ["$$this.group", "F"] },
                                      then: 43,
                                    },
                                  ],
                                  default: 0,
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: "$employee",
                    paid: { $sum: "$paid" },
                    qnt: { $sum: { $sum: "$products.qnt" } },
                    production: { $sum: { $sum: "$products.cost" } },
                    work: {
                      $push: {
                        _id: "$_id",
                        paid: "$paid",
                        date: "$date",
                        cost: "$cost",
                        fy: "$fy",
                        products: "$products",
                      },
                    },
                  },
                },
                {
                  $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "emp",
                  },
                },
                {
                  $set: {
                    name: { $first: "$emp.name" },
                    pass: { $first: "$emp.pass" },
                  },
                },
                {
                  $sort: { name: 1 },
                },
                { $unset: "emp" },
              ],
              lastDate: [
                { $sort: { date: -1 } },
                { $limit: 1 },
                { $project: { date: "$date" } },
              ],
              months: [...monthAggregate(fy)],
            },
          },
          {
            $project: {
              lastDate: { $first: "$lastDate.date" },
              months: "$months",
              emps: "$emps",
            },
          },
        ])
          .then((data_arr) => {
            const { months, emps, lastDate } = data_arr[0];
            return [emps, months, lastDate];
          })
          .then(([emps, months, lastDate]) => {
            const allEmps = emps.map((emp) => {
              const { lastDay } = getProduction(emp.work, rate, lastDate);
              return {
                ...emp,
                deu: emp.production - emp.paid,
                lastDay,
              };
            });
            res.json({
              code: "ok",
              content: { allEmps, months, lastDate },
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
        const { name, pass } = req.body;
        const newEmp = new Employee({
          name,
          pass,
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
          .then((response) => {
            res.json({ code: "ok" });
            EmpWork.deleteMany({ employee: req.body._id });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
