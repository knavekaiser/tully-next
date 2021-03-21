global.mongoose = require("mongoose");
global.Schema = mongoose.Schema;
global.bcrypt = require("bcryptjs");
global.jwt_decode = require("jwt-decode");
global.jwt = require("jsonwebtoken");
global.ObjectID = require("mongodb").ObjectID;
const {} = require("./models/worker.js");
const {} = require("./models/production.js");
const {} = require("./models/admin");

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

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getMonths = (Element, fy) => {
  return Element.aggregate([
    {
      $match: { fy },
    },
    {
      $project: {
        year: { $year: "$date" },
        month: { $month: "$date" },
      },
    },
    {
      $group: {
        _id: null,
        dates: { $addToSet: { year: "$year", month: "$month" } },
      },
    },
  ]).then(
    (dates) =>
      dates[0]?.dates
        .sort((a, b) => {
          return (
            new Date(`${a.year}-${a.month}-01`) -
            new Date(`${b.year}-${b.month}-01`)
          );
        })
        .map((date) => {
          return {
            label: `${months[date.month - 1]} ${date.year}`,
            value: `${date.year}-${
              date.month < 10 ? "0" + date.month : date.month
            }`,
          };
        }) || []
  );
};

export const json = (data) => JSON.parse(JSON.stringify(data));
