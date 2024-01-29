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
    const { from, to, _id } = req.query;
    if (_id) {
      Fabric.findOne({ _id }).then((fabric) =>
        res.json({ code: "ok", fabric })
      );
      return;
    }
    const filters = {
      ...(from && to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
    };
    Fabric.aggregate([
      {
        $facet: {
          fabrics: [
            { $match: filters },
            {
              $unwind: {
                path: "$usage",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "costings",
                localField: "usage.lot",
                foreignField: "lot",
                as: "lotFull",
              },
            },
            {
              $addFields: {
                lotFull: {
                  $map: {
                    input: "$lotFull",
                    in: {
                      dress: "$$this.dress",
                      lot: "$$this.lot",
                      lotSize: "$$this.lotSize",
                      img: "$$this.img",
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: "$_id",
                date: { $first: "$date" },
                name: { $first: "$name" },
                dealer: { $first: "$dealer" },
                qnt: { $first: "$qnt" },
                price: { $first: "$price" },
                img: { $first: "$img" },
                usage: {
                  $push: {
                    _id: "$usage._id",
                    lot: {
                      $cond: [
                        { $or: [{ $first: "$lotFull" }] },
                        { $first: "$lotFull" },
                        "$usage.lot",
                      ],
                    },
                    qnt: "$usage.qnt",
                  },
                },
              },
            },
            {
              $addFields: {
                usage: {
                  $filter: {
                    input: "$usage",
                    cond: { $or: ["$$this.lot"] },
                  },
                },
              },
            },
            { $sort: { date: 1, price: 1, name: 1 } },
          ],
          months: monthAggregate(),
        },
      },
    ]).then((data) => {
      const { fabrics, months } = data[0];
      res.json({ code: "ok", fabrics, months });
    });
  })
  .post((req, res) => {
    const { dealer, date, name, qnt, price, img, usage } = req.body;
    const newFabric = new Fabric({
      dealer,
      date,
      name,
      qnt,
      price,
      img,
      usage,
    })
      .save()
      .then((newFabric) => {
        res.json({ code: "ok", content: newFabric });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "invalid data" });
      });
  })
  .patch(async (req, res) => {
    const { _id, dealer, date, name, qnt, price, img, usage } = req.body;
    await DeleteImg(img.old);
    Fabric.findByIdAndUpdate(_id, {
      dealer,
      date,
      name,
      qnt,
      price,
      img: img.new,
      usage,
    })
      .then(() => Fabric.findById(_id))
      .then((updated) => {
        res.json({ code: "ok", content: updated });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
