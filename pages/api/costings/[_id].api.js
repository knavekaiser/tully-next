import nextConnect from "next-connect";
import { DeleteImg } from "utils/cloudinary.js";
import { auth } from "../auth.api.js";

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
    Costing.findByIdAndDelete(req.query._id)
      .then((data) => {
        res.json({ code: "ok" });
        return DeleteImg(data.img);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
