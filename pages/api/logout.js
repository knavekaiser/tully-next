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
    cookie.serialize("access_token", "old", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 12,
      path: "/",
    })
  );
  res.json({ user: null, success: true });
});
