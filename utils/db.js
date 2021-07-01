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
  console.log("initiating mongodb connection");
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

export const getMonths = (Element) => {
  return Element.aggregate([
    {
      $group: {
        _id: {
          $concat: [
            { $toString: { $year: "$date" } },
            "-",
            { $toString: { $month: "$date" } },
          ],
        },
        originalDate: { $first: "$date" },
      },
    },
    {
      $sort: {
        originalDate: 1,
      },
    },
    { $unset: "originalDate" },
  ]).then((dates) => {
    return (
      dates.map((date) => {
        const [year, month] = date._id.split("-");
        return {
          label: `${months[month - 1]} ${year}`,
          value: `${year}-${month < 10 ? "0" + month : month}`,
        };
      }) || []
    );
  });
};

export const monthAggregate = () => [
  {
    $group: {
      _id: {
        $concat: [
          { $toString: { $year: "$date" } },
          "-",
          { $toString: { $month: "$date" } },
        ],
      },
      originalDate: { $first: "$date" },
    },
  },
  {
    $group: {
      _id: null,
      months: {
        $addToSet: {
          month: "$_id",
          date: "$originalDate",
        },
      },
    },
  },
  { $unset: "_id" },
  { $unwind: "$months" },
  {
    $sort: {
      "months.date": 1,
    },
  },
  {
    $project: {
      value: "$months.month",
      label: {
        $concat: [
          {
            $arrayElemAt: [
              [
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
              ],
              { $subtract: [{ $month: "$months.date" }, 1] },
            ],
          },
          " ",
          { $toString: { $year: "$months.date" } },
        ],
      },
    },
  },
];

export const json = (data) => JSON.parse(JSON.stringify(data));
