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
  .post((req, res) => {
    const { join, name, salary } = req.body;
    new Worker({ join, name, salary })
      .save()
      .then((worker) => {
        res.json({ code: "ok", content: worker });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({ message: "same exists" });
        } else {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        }
      });
  })
  .patch((req, res) => {
    const { _id, join, name, salary } = req.body;
    Worker.findByIdAndUpdate(_id, {
      join,
      name,
      salary,
    })
      .then(() => Worker.findById(_id))
      .then((updated) => {
        res.json({ code: "ok", content: updated });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({ message: "same exists" });
        } else {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        }
      });
  });
