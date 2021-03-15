import nextConnect from "next-connect";
import cookie from "cookie";

export default nextConnect({
  onError(err, req, res) {
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
}).get((req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("access_token", "", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    })
  );
  res.json({ user: null, success: true });
});
