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
  .get((req, res) => {
    const { from, to, emp } = req.query;
    const query = {
      ...(from &&
        to && {
          date: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        }),
    };
    Employee.findOne({ name: emp })
      .populate({
        path: "work.work",
        match: { ...query },
      })
      .then((emp) => {
        console.log(emp);
        if (emp) {
          res.json({
            code: "ok",
            content: { emp },
          });
        } else {
          res.status(400).json({ code: 400 });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  })
  .post((req, res) => {
    const { employee, date, products, paid } = req.body;
    new EmpWork({ employee, date, paid, products })
      .save()
      .then((newWork) => {
        res.json({ code: "ok", content: newWork });
        Employee.findOneAndUpdate(
          { _id: employee },
          { $addToSet: { work: newWork._id } },
          { new: true }
        ).then((dbRes) => {
          console.log(dbRes, newWork._id);
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json("something went wrong");
      });
  })
  .patch((req, res) => {
    const { _id, date, products, paid } = req.body;
    EmpWork.findByIdAndUpdate(_id, { date, products, paid })
      .then(() => EmpWork.findById(_id))
      .then((update) => {
        res.json({ code: "ok", content: update });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json("something went wrong");
      });
  });
