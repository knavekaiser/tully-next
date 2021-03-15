global.mongoose = require("mongoose");
global.Schema = mongoose.Schema;
global.bcrypt = require("bcryptjs");
global.jwt_decode = require("jwt-decode");
global.jwt = require("jsonwebtoken");
global.ObjectID = require("mongodb").ObjectID;
const {} = require("./models/worker.js");
const {} = require("./models/production.js");
const {} = require("./models/admin");

console.log("MONGO_URI: ", process.env.MONGO_URI);
console.log("JWT_SECRET: ", process.env.JWT_SECRET);

global.genCode = (n) => {
  let code = "";
  while (code.length < n) {
    code += Math.ceil(Math.random() * 9);
  }
  return code;
};

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => console.log("connected to db"))
    .catch((err) => console.log("could not connect to db.", err));
}

export const json = (data) => JSON.parse(JSON.stringify(data));
