import nextConnect from "next-connect";
import { auth } from "../auth.api";

export default nextConnect({
  onError(err, req, res) {
    console.log(err);
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
}).delete((req, res) => {
  auth(req, true).then((user) => {
    Group.findOneAndDelete({ _id: req.query._id })
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
});
