import nextConnect from "next-connect";
const { dbConnect, json } = require("../../utils/db");
import cookie from "cookie";
import jwt from "jsonwebtoken";
const signToken = (_id, role) => {
  return jwt.sign(
    {
      iss: "tully",
      sub: _id,
      role: role,
    },
    process.env.JWT_SECRET
  );
};

export default nextConnect({
  onError(err, req, res) {
    console.log(err);
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
}).post((req, res) => {
  dbConnect();
  Employee.findOne({
    name: req.body.id,
    pass: req.body.pass,
    season: req.body.season,
  })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "invalid credentials" });
        return;
      } else {
        const token = signToken(user._id, "viwer");
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("access_token", token, {
            httpOnly: true,
            sameSite: "strict",
            path: "/",
          })
        );
        res.json({ code: "ok", isAuthenticated: true, user });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "something went wrong" });
    });
});
