import nextConnect from "next-connect";
import { DeleteImg, ReplaceImg } from "../../utils/cloudinary.js";
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
          ...(from &&
            to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
        };
        Costing.aggregate([
          {
            $facet: {
              costings: [{ $match: filters }, { $sort: { lot: 1 } }],
              months: monthAggregate(),
            },
          },
        ]).then((data) => {
          const { costings, months } = data[0];
          res.json({ code: "ok", costings, months });
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
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then(async (user) => {
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
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Costing.findByIdAndDelete(req.body._id)
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
