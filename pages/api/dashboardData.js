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
}).get((req, res) => {
  auth(req, true)
    .then((user) => {
      const { from, to } = req.query;
      const filters = {
        ...(from &&
          to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
      };
      const week = {
        start: `${moment({
          time: new Date().setDate(
            new Date().getDate() - new Date().getDay() - 1
          ),
          format: "YYYY-MM-DD",
        })} 00:00`,
        end: `${moment({
          time: new Date().setDate(
            new Date().getDate() - (new Date().getDay() + 1) + 6
          ),
          format: "YYYY-MM-DD",
        })} 00:00`,
      };
      console.log(week);
      Promise.all([
        Bill.aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: null,
              wage: {
                $sum: { $multiply: ["$products.qnt", "$products.wage"] },
              },
              production: {
                $sum: { $multiply: ["$products.qnt", "$products.cost"] },
              },
            },
          },
          {
            $set: {
              production: { $subtract: ["$production", "$wage"] },
            },
          },
        ]).then((data) => data[0]),
        Payment.aggregate([
          {
            $group: {
              _id: null,
              wage: { $sum: "$amount" },
              production: { $sum: { $sum: "$payments.amount" } },
            },
          },
        ]).then((data) => data[0]),
        EmpWork.aggregate([
          {
            $group: {
              _id: null,
              paid: { $sum: "$paid" },
              products: {
                $push: "$products",
              },
            },
          },
          { $unwind: "$products" },
          { $unwind: "$products" },
          {
            $group: {
              _id: null,
              paid: { $first: "$paid" },
              production: {
                $sum: {
                  $multiply: [
                    "$products.qnt",
                    {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$products.group", "L"] }, then: 36 },
                          { case: { $eq: ["$products.group", "S"] }, then: 24 },
                          { case: { $eq: ["$products.group", 1] }, then: 20 },
                          { case: { $eq: ["$products.group", "F"] }, then: 43 },
                        ],
                        default: 0,
                      },
                    },
                  ],
                },
              },
            },
          },
        ]).then((data) => data[0]),
      ]).then(([bills, payments, emp]) => {
        // console.log(emp);
        res.json({
          code: "ok",
          summery: {
            emp,
            bill: bills.production,
            wage: bills.wage + +process.env.PREVIOUS_WAGE - payments.wage,
            production:
              payments.production + +process.env.PREVIOUS - bills.production,
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({ message: "forbidden" });
    });
});
