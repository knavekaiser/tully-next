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
        const { dealer, date, fy, name, qnt, price, img, usage } = req.body;
        const img_url = await UploadImg(img);
        const newFabric = new Fabric({
          dealer,
          date,
          fy,
          name,
          qnt,
          price,
          img: img_url,
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
        const img_str = await ReplaceImg(img.old, img.new);
        Fabric.findByIdAndUpdate(_id, {
          dealer,
          date,
          fy,
          name,
          qnt,
          price,
          img: img_str || img.new,
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
