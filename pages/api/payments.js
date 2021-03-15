import nextConnect from "next-connect";
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
  .post((req, res) => {
    auth(req, true)
      .then((user) => {
        const { date, fy, payments, amount } = req.body;
        const pay = amount
          ? new WagePayment({
              fy,
              date,
              amount,
            })
          : new MaterialPayment({
              fy,
              date,
              payments,
            });
        pay
          .save()
          .then((newPayment) => {
            res.json({ code: "ok", content: newPayment });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "invalid data" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .patch((req, res) => {
    auth(req, true)
      .then((user) => {
        const { _id, date, fy, payments, amount } = req.body;
        const pay = amount ? WagePayment : MaterialPayment;
        pay
          .findByIdAndUpdate(_id, {
            date,
            fy,
            payments,
            amount,
          })
          .then(() => Payment.findById(_id))
          .then((updated) => {
            res.json({ code: "ok", content: updated });
          })
          .catch((err) => {
            if (err.code === 11000) {
              res.status(400).json({ message: "something exists" });
            } else {
              console.log(err);
              res.status(500).json({ message: "something went wrong" });
            }
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ message: "forbidden" });
      });
  })
  .delete((req, res) => {
    auth(req, true).then((user) => {
      Payment.findByIdAndDelete(req.body._id)
        .then(() => res.json({ code: "ok" }))
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    });
  });
