import nextConnect from "next-connect";
import { UploadImg, DeleteImg, ReplaceImg } from "../../utils/cloudinary.js";
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
  .post((req, res) => {
    auth(req, true)
      .then(async (user) => {
        const { lot, date, dress, lotSize, fy, materials, img } = req.body;
        const img_url = await UploadImg(img);
        new Costing({
          lot,
          date,
          dress,
          lotSize,
          img: img_url,
          fy,
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
        const { _id, lot, date, dress, img, lotSize, fy, materials } = req.body;
        const img_str = await ReplaceImg(img.old, img.new);
        Costing.findByIdAndUpdate(_id, {
          lot,
          date,
          dress,
          lotSize,
          img: img_str,
          fy,
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
