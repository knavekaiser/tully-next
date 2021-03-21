import nextConnect from "next-connect";
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
      .then((user) => {
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
        Fabric.findByIdAndUpdate(_id, {
          dealer,
          date,
          fy,
          name,
          qnt,
          price,
          img,
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
        .then(() => res.json({ code: "ok" }))
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });
