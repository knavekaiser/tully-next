import nextConnect from "next-connect";
import { json } from "../../utils/db";
import { auth } from "./auth";

export default nextConnect({
  onError(err, req, res) {
    console.log(err);
    res.status(500).json({ message: "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `${req.method} Method is not allowed` });
  },
})
  .get((req, res) => {
    auth(req)
      .then((user) => {
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
                content: {
                  emp,
                  // ...json(emp),
                  // work: emp.work
                  //   .map((item) => item.work)
                  //   .filter((item) => !!item)
                  //   .sort((a, b) => a.date - b.date),
                },
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
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { employee, date, products, paid } = req.body;
        new EmpWork({ employee, date, paid: paid || 0, products })
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
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, date, products, paid } = req.body;
        EmpWork.findByIdAndUpdate(_id, { date, products, paid: paid || 0 })
          .then(() => EmpWork.findById(_id))
          .then((update) => {
            res.json({ code: "ok", content: update });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true)
      .then((user) => {
        EmpWork.findOneAndDelete({ _id: req.body._id })
          .then((deleted) => {
            res.json({ code: "ok" });
            Employee.findOneAndUpdate(
              { _id: deleted.employee },
              { $pull: { work: req.body._id } }
            );
          })
          .catch((err) => {
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
