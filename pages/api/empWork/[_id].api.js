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
  .delete((req, res) => {
    EmpWork.findOneAndDelete({ _id: req.query._id })
      .then((deleted) => {
        res.json({ code: "ok" });
        Employee.findOneAndUpdate(
          { _id: deleted.employee },
          { $pull: { work: req.body._id } }
        );
      })
      .catch((err) => {
        res.status(500).json("something went wrong");
      });
  });
