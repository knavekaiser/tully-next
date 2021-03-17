import nextConnect from "next-connect";
import { auth } from "./auth";
import { getMonths } from "../../utils/db";

const rate = {
  1: 20,
  S: 24,
  L: 36,
  F: 43,
  iS: 2.5,
  iL: 4,
};
function dateFilter(fun, date) {
  let run = false;
  const from = new Date(dateRange.from),
    to = new Date(dateRange.to),
    yearToShow = date.split(":")[1],
    dateToShow = new Date(date.split(":")[0] + ":00:00");
  to.setFullYear(dateToShow.getFullYear());
  from.setFullYear(dateToShow.getFullYear());
  if (dateToShow >= from && dateToShow <= to) {
    if (fy === "all") {
      run = true;
    } else if (fy === yearToShow) {
      run = true;
    }
  }
  run && fun && fun(date);
  return run;
}
function getProduction(work, rate, lastDay) {
  const cost = work.reduce(
    (p, c) => p + c?.products.reduce((a, c) => a + c.qnt * rate[c.group], 0),
    0
  );
  const paid = work.reduce((p, c) => p + c?.paid, 0);
  const qnt = work.reduce(
    (p, c) => p + c?.products.reduce((p, c) => p + c.qnt, 0),
    0
  );
  const lastWork = work.filter(
    (item) => item?.date.toString() === lastDay.toString()
  )[0];
  const lastWeek = {
    paid: lastWork?.paid || 0,
    qnt: lastWork?.products.reduce((p, c) => p + c.qnt, 0) || 0,
  };
  return {
    qnt: qnt || 0,
    cost: cost || 0,
    paid: paid || 0,
    deu: cost - paid || 0,
    lastDay: lastWeek,
  };
}

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
        const { fy, dateFilter } = JSON.parse(req.headers.filters);
        const query = {
          ...(fy !== "all" && { fy }),
          ...(dateFilter && {
            date: { $gte: dateFilter.from, $lte: dateFilter.to },
          }),
        };
        Promise.all([
          Employee.find({
            ...(user.role === "viwer" && { name: user.name }),
          }).populate({
            path: "work.work",
            match: query,
            select: "-_id products paid date",
          }),
          getMonths(EmpWork, fy),
          EmpWork.findOne({}, "-_id date").sort({ date: -1 }),
        ])
          .then(([emps, months, lastWeek]) => {
            const allEmps = emps.map((emp) => {
              const { qnt, cost, paid, deu, lastDay } = getProduction(
                emp.work.map((item) => item?.work).filter((item) => !!item),
                rate,
                lastWeek?.date
              );
              return {
                _id: emp._id,
                name: emp.name,
                pass: emp.pass,
                qnt,
                cost,
                paid,
                deu,
                lastDay,
              };
            });
            res.json({ code: "ok", content: { allEmps, months } });
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
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { name, pass } = req.body;
        const newEmp = new Employee({
          name,
          pass,
        })
          .save()
          .then((newEmp) => {
            res.json({ code: "ok", content: newEmp });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({
                code: "same exists",
                fields: Object.keys(err.keyValue),
              });
            }
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
        const { _id, name, pass } = req.body;
        Employee.findByIdAndUpdate(req.body._id, { name, pass })
          .then(() => Employee.findById(_id))
          .then((update) => {
            res.json({ code: "ok", content: update });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({
                code: "same exists",
                fields: Object.keys(err.keyValue),
              });
            } else {
              res.status(500).json("something went wrong");
            }
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true)
      .then((user) => {
        Employee.findByIdAndDelete(req.body._id)
          .then((response) => {
            res.json({ code: "ok" });
            EmpWork.deleteMany({ employee: req.body._id });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json("something went wrong");
          });
      })
      .catch((err) => {
        res.status(403).json({ message: "forbidden" });
      });
  });
