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
    .then(async (user) => {
      const { from, to, season } = req.query;
      const filters = {
        ...(from &&
          to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
      };
      const week = {
        start: moment({
          time: new Date().setDate(
            new Date().getDate() - new Date().getDay() - 1
          ),
          format: "YYYY-MM-DD",
        }),
        end: moment({
          time: new Date().setDate(
            new Date().getDate() - (new Date().getDay() + 1) + 7
          ),
          format: "YYYY-MM-DD",
        }),
      };
      const lastDate = await EmpWork.aggregate([
        {
          $group: {
            _id: "$date",
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: 1,
        },
      ]).then((data) => data[0]?._id);
      if (req.query.pastWeek === "true") {
        Promise.all([
          EmpWork.aggregate([
            {
              $match: {
                date: req.query.week
                  ? new Date(req.query.week)
                  : new Date(lastDate),
              },
            },
            {
              $unwind: { path: "$products", preserveNullAndEmptyArrays: true },
            },
            {
              $unwind: { path: "$products", preserveNullAndEmptyArrays: true },
            },
            {
              $facet: {
                total: [
                  {
                    $group: {
                      _id: null,
                      paid: { $sum: "$paid" },
                      production: { $sum: "$products.qnt" },
                    },
                  },
                ],
                groups: [
                  {
                    $group: {
                      _id: "$products.group",
                      total: { $sum: "$products.qnt" },
                    },
                  },
                ],
              },
            },
            { $set: { total: { $first: "$total" } } },
          ]).then((data) => data[0]),
          Lot.aggregate([
            {
              $match: {
                date: req.query.week
                  ? new Date(req.query.week)
                  : new Date(lastDate),
              },
            },
            { $unwind: { path: "$products" } },
            { $unwind: { path: "$products" } },
            {
              $facet: {
                total: [
                  {
                    $group: {
                      _id: null,
                      paid: { $first: "$paid" },
                      production: { $sum: "$products.qnt" },
                    },
                  },
                ],
                groups: [
                  {
                    $group: {
                      _id: "$products.group",
                      total: { $sum: "$products.qnt" },
                    },
                  },
                ],
              },
            },
            { $set: { total: { $first: "$total" } } },
          ]).then((data) => data[0]),
          EmpWork.aggregate([
            { $group: { _id: "$date" } },
            { $sort: { _id: 1 } },
          ]).then((data) => data.map((item) => item?._id)),
        ]).then(([pastWeek, lot, dates]) => {
          res.json({
            code: "ok",
            pastWeek: {
              total: {
                paid: pastWeek.total?.paid || 0,
                production: pastWeek.total?.production || 0,
              },
              groups: pastWeek.groups,
            },
            lot: {
              total: {
                paid: lot.total?.paid || 0,
                production: lot.total?.production || 0,
              },
              groups: lot.groups,
            },
            date: lastDate,
            dates,
          });
        });
        return;
      }
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
        Employee.aggregate([
          { $match: { season } },
          {
            $lookup: {
              from: "empworks",
              localField: "work",
              foreignField: "_id",
              as: "work",
            },
          },
          { $unwind: { path: "$work" } },
          {
            $set: {
              _id: "$work._id",
              paid: "$work.paid",
              date: "$work.date",
              products: "$work.products",
            },
          },
          { $unset: ["name", "pass", "__v", "season"] },
          {
            $group: {
              _id: null,
              paid: { $sum: "$paid" },
              products: { $push: "$products" },
            },
          },
          { $unwind: { path: "$products" } },
          { $unwind: { path: "$products" } },
          {
            $group: {
              _id: null,
              paid: { $first: "$paid" },
              production: {
                $sum: { $multiply: ["$products.qnt", "$products.group"] },
              },
            },
          },
        ]).then((data) => data[0]),
        Employee.aggregate([
          { $match: { season } },
          {
            $lookup: {
              from: "empworks",
              localField: "work",
              foreignField: "_id",
              as: "work",
            },
          },
          { $unwind: { path: "$work" } },
          {
            $set: {
              _id: "$work._id",
              paid: "$work.paid",
              date: "$work.date",
              products: "$work.products",
            },
          },
          { $unset: ["name", "pass", "__v", "season"] },
          {
            $group: {
              _id: null,
              paid: { $sum: "$paid" },
              products: { $push: "$products" },
            },
          },
          { $unwind: { path: "$products" } },
          { $unwind: { path: "$products" } },
          {
            $facet: {
              total: [
                {
                  $group: {
                    _id: null,
                    paid: { $first: "$paid" },
                    qty: { $sum: "$products.qnt" },
                    production: {
                      $sum: { $multiply: ["$products.qnt", "$products.group"] },
                    },
                  },
                },
              ],
              groups: [
                {
                  $group: {
                    _id: "$products.group",
                    total: { $sum: "$products.qnt" },
                  },
                },
              ],
            },
          },
          { $set: { total: { $first: "$total" } } },
        ]).then((data) => data[0]),
        Fabric.aggregate([
          {
            $set: {
              usage: {
                $reduce: {
                  input: "$usage",
                  initialValue: 0,
                  in: {
                    $sum: ["$$value", "$$this.qnt.amount"],
                  },
                },
              },
            },
          },
          {
            $set: {
              remaining: {
                $multiply: [
                  "$price",
                  {
                    $subtract: ["$qnt.amount", "$usage"],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$remaining",
              },
            },
          },
        ]).then((data) => data[0]),
      ]).then(([bills, payments, emp, pastYear, fabric]) => {
        console.log(fabric);
        res.json({
          code: "ok",
          summery: {
            emp,
            bill: bills.production,
            wage: bills.wage + +process.env.PREVIOUS_WAGE - payments.wage,
            fabric: fabric.total,
            production:
              payments.production + +process.env.PREVIOUS - bills.production,
            pastYear: {
              total: {
                paid: pastYear.total?.paid || 0,
                qty: pastYear.total?.qty || 0,
                production: pastYear.total?.production || 0,
              },
              groups: pastYear.groups,
            },
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({ message: "forbidden" });
    });
});
