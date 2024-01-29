import nextConnect from "next-connect";
import { auth } from "../auth.api";
import { query } from "express-validator";
import { validateInput } from "utils/db";

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
  .delete(
    [query("_id").notEmpty().withMessage("Please provide an _id.")],
    validateInput,
    (req, res) => {
      Transaction.findOneAndDelete({ _id: req.query._id })
        .then((deleted) => {
          res.json({ code: "ok", message: "Transaction has been deleted." });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    }
  );
