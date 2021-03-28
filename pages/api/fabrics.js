import nextConnect from "next-connect";
import { DeleteImg, ReplaceImg } from "../../utils/cloudinary.js";
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
})
  .get((req, res) => {
    auth(req, true)
      .then((user) => {
        const { fy, from, to, _id } = req.query;
        if (_id) {
          Fabric.findOne({ _id }).then((fabric) =>
            res.json({ code: "ok", fabric })
          );
          return;
        }
        const filters = {
          ...(fy !== "all" && { fy }),
          ...(from &&
            to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
        };
        Promise.all([
          Fabric.aggregate([
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
                fy: { $first: "$fy" },
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
            { $sort: { date: 1 } },
          ]),
          getMonths(Fabric, fy),
        ]).then(([fabrics, months]) => {
          res.json({ code: "ok", fabrics, months });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .post((req, res) => {
    auth(req, true)
      .then(async (user) => {
        const { dealer, date, fy, name, qnt, price, img, usage } = req.body;
        const newFabric = new Fabric({
          dealer,
          date,
          fy,
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
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then(async (user) => {
        const {
          _id,
          dealer,
          date,
          fy,
          name,
          qnt,
          price,
          img,
          usage,
        } = req.body;
        await DeleteImg(img.old);
        Fabric.findByIdAndUpdate(_id, {
          dealer,
          date,
          fy,
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
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Fabric.findByIdAndDelete(req.body._id)
        .then((data) => {
          res.json({ code: "ok" });
          return DeleteImg(data.img);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
