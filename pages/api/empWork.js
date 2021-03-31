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
    console.log("this was callled");
    auth(req, true)
      .then((user) => {
        const { fy, from, to, emp } = req.query;
        const query = {
          ...(fy !== "all" && { fy }),
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
            if (emp) {
              res.json({
                code: "ok",
                content: {
                  ...json(emp),
                  work: emp.work
                    .map((item) => item.work)
                    .filter((item) => !!item)
                    .sort((a, b) => a.date - b.date),
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
        const { employee, date, fy, products, paid } = req.body;
        try {
          const newWork = new EmpWork({ employee, date, fy, paid, products });
          newWork
            .save()
            .then((newWork) => {
              res.json({ code: "ok", content: newWork });
              Employee.updateWork(employee);
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json("something went wrong");
            });
        } catch (err) {
          res.status(400).json("provide correct data");
        }
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, date, fy, products, paid } = req.body;
        EmpWork.findByIdAndUpdate(_id, { date, fy, products, paid })
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
          .then(() => {
            res.json({ code: "ok" });
            Employee.updateWork(req.body._id);
          })
          .catch((err) => {
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
