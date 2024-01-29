import nextConnect from "next-connect";
import { DeleteImg } from "utils/cloudinary.js";
import { auth } from "../auth.api.js";
import { monthAggregate } from "utils/db.js";

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
    const { from, to, lot } = req.query;
    if (lot) {
      Costing.findOne({ lot }).then((costing) => {
        if (costing) {
          res.json({ code: "ok", costing });
        } else {
          res.json({ code: 400, costing });
        }
      });
      return;
    }
    const filters = {
      ...(from && to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
    };
    Costing.aggregate([
      {
        $facet: {
          costings: [
            { $match: filters },
            { $sort: { lot: 1 } },
            {
              $lookup: {
                from: "bills",
                let: { lot: "$lot" },
                pipeline: [
                  { $unwind: "$products" },
                  { $replaceRoot: { newRoot: "$products" } },
                  { $match: { $expr: { $eq: ["$$lot", "$lot"] } } },
                  { $group: { _id: "$lot", qnt: { $sum: "$qnt" } } },
                  { $project: { qnt: 1 } },
                ],
                as: "delivered",
              },
            },
            {
              $unwind: {
                path: "$delivered",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $set: {
                delivered: { $subtract: ["$delivered.qnt", "$lotSize"] },
              },
            },
          ],
          months: monthAggregate(),
        },
      },
    ]).then((data) => {
      const { costings, months } = data[0];
      res.json({ code: "ok", costings, months });
    });
  })
  .post((req, res) => {
    const { lot, date, dress, lotSize, materials, img } = req.body;
    new Costing({
      lot,
      date,
      dress,
      lotSize,
      img,
      materials,
    })
      .save()
      .then((newCosting) => {
        res.json({ code: "ok", content: newCosting });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({ message: "something exists" });
        } else {
          console.log(err);
          res.status(400).json({ message: "invalid data" });
        }
      });
  })
  .patch(async (req, res) => {
    const { _id, lot, date, dress, img, lotSize, materials } = req.body;
    await DeleteImg(img.old);
    Costing.findByIdAndUpdate(_id, {
      lot,
      date,
      dress,
      lotSize,
      img: img.new,
      materials,
    })
      .then(() => Costing.findById(_id))
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
  });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
