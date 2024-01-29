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
  auth(req, true)
    .then((user) => {
      Lot.findOneAndDelete({ _id: req.query._id })
        .then(() => {
          res.json({ code: "ok" });
        })
        .catch((err) => {
          res.status(500).json("something went wrong");
        });
    })
    .catch((err) => {
      res.status(403).json({ message: "forbidden" });
    });
});
