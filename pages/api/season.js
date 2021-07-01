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
    auth(req, true).then((user) => {
      new Season({ ...req.body })
        .save()
        .then((dbRes) => {
          res.json({ code: "ok", season: dbRes });
        })
        .catch((err) => {
          if (err.code === 11000) {
            res.status(400).json({ code: err.code, message: "season exists" });
          } else {
            res.status(500).json({ message: "something went wrong" });
          }
        });
    });
  })
  .get((req, res) => {
    Season.find()
      .then((dbRes) => {
        res.json({ code: "ok", seasons: dbRes });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Season.findOneAndDelete({ _id: req.body._id })
        .then((dbRes) => {
          if (dbRes) {
            res.json({ code: "ok", message: "successfully deleted" });
          } else {
            res.status(400).json({ message: "bad request" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  })
  .patch((req, res) => {
    auth(req, true).then((user) => {
      Season.updateMany({}, { running: false })
        .then(() =>
          Season.findOneAndUpdate(
            { _id: req.body._id },
            { running: true },
            { new: true }
          )
        )
        .then((dbRes) => {
          if (dbRes) {
            res.json({ code: "ok", season: dbRes });
          } else {
            res.status(400).json({ message: "bad request" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });
