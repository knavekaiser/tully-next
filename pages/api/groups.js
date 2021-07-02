import nextConnect from "next-connect";
import { auth } from "./auth";
import { dbConnect } from "../../utils/db";

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
    dbConnect();
    Group.find()
      .then((dbRes) => {
        res.json({ code: "ok", groups: dbRes });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  })
  .post((req, res) => {
    auth(req, true).then((user) => {
      new Group({ ...req.body })
        .save()
        .then((dbRes) => {
          res.json({ code: "ok", group: dbRes });
        })
        .catch((err) => {
          if (err.code === 11000) {
            res.status(400).json({ code: err.code, message: "groups exists" });
          } else {
            res.status(500).json({ message: "something went wrong" });
          }
        });
    });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Group.findOneAndDelete({ _id: req.body._id })
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
      Group.findOneAndUpdate(
        { _id: req.body._id },
        { ...req.body },
        { new: true }
      )
        .then((dbRes) => {
          if (dbRes) {
            res.json({ code: "ok", group: dbRes });
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
