import nextConnect from "next-connect";
import { UploadImg, DeleteImg, ReplaceImg } from "../../utils/cloudinary.js";
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
      const { fy, from, to } = req.query;
      const filters = {
        ...(fy !== "all" && { fy }),
        ...(from &&
          to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
      };
      Promise.all([
        Bill.aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: null,
              wage: {
                $sum: { $multiply: ["$products.qnt", "$products.wage"] },
              },
            },
          },
        ]),
        WagePayment.aggregate([
          {
            $group: {
              _id: "total",
              wage: {
                $sum: "$amount",
              },
            },
          },
        ]),
      ]).then(([totalWage, totalWagePayment]) => {
        res.json({
          code: "ok",
          summery: {
            wage:
              totalWage[0].wage +
              +process.env.PREVIOUS_WAGE -
              totalWagePayment[0].wage,
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({ message: "forbidden" });
    });
});
