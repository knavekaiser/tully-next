import nextConnect from "next-connect";
import { auth } from "../auth.api";
import { body } from "express-validator";
import { validateInput, getMonths } from "utils/db";

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
    const { dateFrom, dateTo, wallet, type } = req.query;
    Promise.all([
      Transaction.aggregate([
        {
          $match: {
            ...(wallet && { wallet }),
            ...(type && { type }),
            ...(dateFrom &&
              dateTo && {
                date: {
                  $gte: new Date(dateFrom),
                  $lt: new Date(dateTo),
                },
              }),
          },
        },
        { $sort: { date: 1, created: 1, type: 1, amount: 1, note: 1 } },
      ]),
      getMonths(Transaction),
    ])
      .then(([transactions, months]) => {
        res.json({ code: "ok", transactions, months });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  })
  .post(
    [
      body("wallet").notEmpty().withMessage("Please select a wallet."),
      body("type")
        .isIn(["income", "expense"])
        .withMessage("Please select a type."),
      body("amount")
        .isInt({ min: 1 })
        .withMessage("amount can not be less than 1."),
      body("note").notEmpty().withMessage("Note can not be empty."),
      body("date")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Please provide a valid date."),
    ],
    validateInput,
    (req, res) => {
      new Transaction({ ...req.body })
        .save()
        .then((transaction) => {
          res.json({ code: "ok", transaction });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    }
  )
  .patch(
    [
      body("_id").notEmpty().withMessage("Please provide an _id."),
      body("wallet")
        .optional()
        .notEmpty()
        .withMessage("Please select a wallet."),
      body("type")
        .optional()
        .isIn(["income", "expense"])
        .withMessage("Please select a type."),
      body("amount")
        .optional()
        .isInt({ min: 1 })
        .withMessage("amount can not be less than 1."),
      body("note").optional().notEmpty().withMessage("Note can not be empty."),
      body("date")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Please provide a valid date."),
    ],
    validateInput,
    (req, res) => {
      Transaction.findOneAndUpdate(
        { _id: req.body._id },
        { ...req.body },
        { new: true }
      )
        .then((transaction) => {
          res.json({ code: "ok", transaction });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    }
  );
