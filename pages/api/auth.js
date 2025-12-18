const { dbConnect } = require("../../utils/db");

export const verifyToken = (req) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(req.cookies?.access_token || "", secret, (err, payload) => {
    if (err) {
      return false;
    } else {
      return payload;
    }
  });
};

export async function auth(req, strict) {
  dbConnect();
  return new Promise(async (resolve, reject) => {
    if (!req.cookies?.access_token) {
      return reject(401);
    }
    try {
      const token = jwt.verify(
        req.cookies.access_token,
        process.env.JWT_SECRET
      );
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
