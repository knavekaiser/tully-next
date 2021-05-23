import nextConnect from "next-connect";
import { getMonths } from "../../utils/db";
import { auth } from "./auth";

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
        const { fy, from, to, payment } = req.query;
        const filters = {
          ...(fy !== "all" && { fy }),
          ...(from &&
            to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
        };
        if (payment === "wages") {
          Promise.all([
            Bill.aggregate([
              {
                $match: { ...filters },
              },
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$ref",
                  date: { $first: "$date" },
                  qnt: { $sum: "$products.qnt" },
                  wage: {
                    $sum: { $multiply: ["$products.qnt", "$products.wage"] },
                  },
                },
              },
              {
                $project: {
                  date: "$date",
                  ref: "$_id",
                  qnt: "$qnt",
                  wage: { $sum: "$wage" },
                },
              },
              { $sort: { ref: 1 } },
            ]),
            Bill.aggregate([
              {
                $match: from
                  ? { date: { $lt: new Date(from) } }
                  : { fy: { $lt: fy.substr(0, 4) } },
              },
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$ref",
                  wage: {
                    $sum: { $multiply: ["$products.qnt", "$products.wage"] },
                  },
                },
              },
              {
                $project: {
                  total: { $sum: "$wage" },
                },
              },
              {
                $group: {
                  _id: "total",
                  total: { $sum: "$total" },
                },
              },
            ]).then((data) => data[0]?.total || 0),
            WagePayment.find(filters).sort({ date: 1 }),
            WagePayment.aggregate([
              {
                $match: from
                  ? { date: { $lt: new Date(from) } }
                  : { fy: { $lt: fy.substr(0, 4) } },
              },
              {
                $group: {
                  _id: "total",
                  wage: {
                    $sum: "$amount",
                  },
                },
              },
            ]).then((data) => data[0]?.wage || 0),
            getMonths(WagePayment, fy),
          ]).then(
            ([bills, previousWage, payments, previousWagePayments, months]) => {
              res.json({
                code: "ok",
                months,
                bills,
                payments,
                summery: {
                  totalWage: bills.reduce((p, c) => p + c.wage, 0),
                  previousWage:
                    previousWage +
                    +process.env.PREVIOUS_WAGE -
                    previousWagePayments,
                },
              });
            }
          );
        } else {
          Promise.all([
            Bill.aggregate([
              {
                $match: { ...filters },
              },
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$ref",
                  date: { $first: "$date" },
                  qnt: { $sum: "$products.qnt" },
                  product: {
                    $sum: { $multiply: ["$products.qnt", "$products.cost"] },
                  },
                  wage: {
                    $sum: { $multiply: ["$products.qnt", "$products.wage"] },
                  },
                },
              },
              {
                $project: {
                  date: "$date",
                  ref: "$_id",
                  qnt: "$qnt",
                  total: { $subtract: ["$product", "$wage"] },
                },
              },
              { $sort: { ref: 1 } },
            ]),
            Bill.aggregate([
              {
                $match: from
                  ? { date: { $lt: new Date(from) } }
                  : { fy: { $lt: fy.substr(0, 4) } },
              },
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$ref",
                  product: {
                    $sum: { $multiply: ["$products.qnt", "$products.cost"] },
                  },
                  wage: {
                    $sum: { $multiply: ["$products.qnt", "$products.wage"] },
                  },
                },
              },
              {
                $project: {
                  total: { $subtract: ["$product", "$wage"] },
                },
              },
              {
                $group: {
                  _id: "total",
                  total: { $sum: "$total" },
                },
              },
            ]).then((data) => data[0]?.total || 0),
            MaterialPayment.find(filters).sort({ date: 1 }),
            MaterialPayment.aggregate([
              {
                $match: from
                  ? { date: { $lt: new Date(from) } }
                  : { fy: { $lt: fy.substr(0, 4) } },
              },
              {
                $group: {
                  _id: "total",
                  total: { $sum: { $sum: "$payments.amount" } },
                },
              },
            ]).then((data) => data[0]?.total || 0),
            getMonths(MaterialPayment, fy),
          ]).then(
            ([
              bills,
              previousProduction,
              payments,
              previouslyReceivedPayment,
              months,
            ]) => {
              const totalProduction = bills.reduce((p, c) => p + c.total, 0);
              const totalPaymentReceived = payments.reduce(
                (p, c) => p + c.payments.reduce((pp, cu) => pp + cu.amount, 0),
                0
              );
              const totalPaymentDeu = totalProduction - totalPaymentReceived;
              const previous =
                +process.env.PREVIOUS +
                previouslyReceivedPayment -
                previousProduction;
              const todate =
                +process.env.PREVIOUS +
                previouslyReceivedPayment -
                previousProduction +
                totalPaymentReceived -
                totalProduction;
              res.json({
                bills,
                payments,
                months,
                summery: {
                  totalPaymentDeu,
                  previous,
                  totalPaymentReceived,
                  totalProduction,
                  todate,
                },
              });
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { date, fy, payments, amount } = req.body;
        const pay = amount
          ? new WagePayment({
              fy,
              date,
              amount,
            })
          : new MaterialPayment({
              fy,
              date,
              payments,
            });
        pay
          .save()
          .then((newPayment) => {
            res.json({ code: "ok", content: newPayment });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "invalid data" });
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
        const { _id, date, fy, payments, amount } = req.body;
        const pay = amount ? WagePayment : MaterialPayment;
        pay
          .findByIdAndUpdate(_id, {
            date,
            fy,
            payments,
            amount,
          })
          .then(() => Payment.findById(_id))
          .then((updated) => {
            res.json({ code: "ok", content: updated });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({ message: "something exists" });
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
      Payment.findByIdAndDelete(req.body._id)
        .then(() => res.json({ code: "ok" }))
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });
