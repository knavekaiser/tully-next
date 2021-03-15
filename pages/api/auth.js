import nextConnect from "next-connect";
import cookie from "cookie";
export function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
}
export const verifyToken = (req) => {
  const secret = process.env.JWT_SECRET;
  const raw_token = cookie.parse(req.headers.cookie || "");
  return jwt.verify(raw_token.access_token || "", secret, (err, payload) => {
    if (err) {
      return false;
    } else {
      return payload;
    }
  });
};

export async function auth(req, strict) {
  return new Promise(async (resolve, reject) => {
    const cookies = parseCookies(req);
    if (!cookies.access_token) {
      return reject(401);
    }
    try {
      const token = jwt.verify(cookies.access_token, process.env.JWT_SECRET);
      if (strict && token.role === "viwer") {
        return reject(401);
      }
      let user =
        token.role === "admin"
          ? await Admin.findOne({ _id: token.sub }, "-pass")
          : await Employee.findOne({ _id: token.sub }, "-pass");
      if (user) {
        req.user = user;
        return resolve({
          ...JSON.parse(JSON.stringify(user)),
          role: token.role,
        });
      } else {
        return reject(401);
      }
    } catch (err) {
      return reject(401);
    }
  });
}
