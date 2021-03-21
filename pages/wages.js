import { useState, useContext, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr } from "../components/Table";
import { AddWagePayment } from "../components/Forms";
import { Modal } from "../components/Modals";
import s from "../components/SCSS/Table.module.scss";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";
import Link from "next/link";

export async function getServerSideProps(ctx) {
  const { dbConnect, json, getMonths } = require("../utils/db");
  dbConnect();
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
  };
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [
      user,
      wages,
      previousWage,
      payments,
      previousWagePayments,
      months,
    ] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Bill.aggregate([
        {
          $match: { ...filters },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$ref",
            date: { $first: "$date" },
            qnt: { $sum: "$products.qnt" },
            wage: {
              $sum: { $multiply: ["$products.qnt", "$products.wage"] },
            },
          },
        },
        {
          $project: {
            date: "$date",
            ref: "$_id",
            qnt: "$qnt",
            total: { $sum: "$wage" },
          },
        },
        { $sort: { ref: 1 } },
      ]),
      Bill.aggregate([
        {
          $match: from
            ? { date: { $lt: new Date(from) } }
            : { fy: { $lt: fy.substr(0, 4) } },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$ref",
            wage: {
              $sum: { $multiply: ["$products.qnt", "$products.wage"] },
            },
          },
        },
        {
          $project: {
            total: { $sum: "$wage" },
          },
        },
        {
          $group: {
            _id: "total",
            total: { $sum: "$total" },
          },
        },
      ]).then((data) => data[0]?.total || 0),
      WagePayment.find(filters),
      WagePayment.aggregate([
        {
          $match: from
            ? { date: { $lt: new Date(from) } }
            : { fy: { $lt: fy.substr(0, 4) } },
        },
        {
          $group: {
            _id: "total",
            wage: {
              $sum: "$amount",
            },
          },
        },
      ]).then((data) => data[0]?.wage || 0),
      getMonths(WagePayment, fy),
    ]);
    return {
      props: {
        ssrUser: json(user),
        ssrData: json({
          wages,
          payments,
          summery: {
            totalWage: wages.reduce((p, c) => p + c.total, 0),
            previousWage:
              previousWage + +process.env.PREVIOUS_WAGE - previousWagePayments,
          },
        }),
        ssrMonths: json(months),
      },
    };
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
}

export default function Productions({ ssrUser, ssrData, ssrMonths }) {
  const router = useRouter();
  const { fy, user, setUser, dateFilter, setMonths } = useContext(SiteContext);
  useEffect(() => {
    setUser(ssrUser);
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(false);
  const [payments, setPayments] = useState(ssrData.payments);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const firstRedner = useRef(true);
  const dltPayment = (_id) => {
    if (confirm("you want to delete this payments?")) {
      fetch("/api/payments", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setPayments((prev) => prev.filter((item) => item._id !== _id));
          } else {
            alert("something went wrong");
          }
        })
        .catch((err) => {
          console.log(err);
          alert("something went wrong");
        });
    }
  };
  useEffect(() => {
    !showForm && setPaymentToEdit(null);
  }, [showForm]);
  useEffect(() => {
    setPayments(ssrData.payments);
  }, [ssrData.payments]);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => {
    if (firstRedner.current) {
      firstRedner.current = false;
      return;
    }
    router.push({
      pathname: router.pathname,
      query: {
        fy,
        ...(dateFilter && {
          from: dateFilter.from,
          to: dateFilter.to,
        }),
      },
    });
  }, [fy, dateFilter]);
  return (
    <App>
      <div className={s.productions}>
        <Table
          className={s.production}
          columns={[
            {
              label: (
                <>
                  <span className={s.ref}>Ref</span>
                  Date
                </>
              ),
            },
            {
              label: (
                <>
                  <span className={s.Qnt}>Qnt</span>
                  Total
                </>
              ),
            },
          ]}
        >
          {ssrData.wages.map((bill, i) => (
            <Link key={i} href={`/bills/${bill.ref}`}>
              <tr>
                <td className={s.date}>
                  <span className={s.ref}>{bill.ref}</span>
                  {displayDate(bill.date)}
                </td>
                <td className={s.total}>
                  <span className={s.qnt}>{bill.qnt}</span>
                  {bill.total.toLocaleString("en-IN")}
                </td>
              </tr>
            </Link>
          ))}
          <tr className={`${s.totalRecieved} ${s.total}`}>
            <td>Total Production</td>
            <td className={s.amount}>
              {ssrData.summery.totalWage.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.total}>
            <td>Previous</td>
            <td className={s.amount}>
              + {ssrData.summery.previousWage.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr className={s.total}>
            <td>Total</td>
            <td className={s.amount}>
              {(
                ssrData.summery.totalWage + ssrData.summery.previousWage
              ).toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.total}>
            <td>This month</td>
            <td className={s.amount}>
              -{" "}
              {payments
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr className={`${s.totalRecieved} ${s.total}`}>
            <td>Current</td>
            <td className={s.amount}>
              {(
                ssrData.summery.totalWage +
                ssrData.summery.previousWage -
                payments.reduce((p, c) => p + c.amount, 0)
              ).toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        <Table
          className={s.wages}
          columns={[
            {
              label: "Date",
            },
            {
              label: "Taka",
            },
          ]}
          onScroll={(dir) => {
            if (dir === "down") {
              setAddBtnStyle(true);
            } else {
              setAddBtnStyle(false);
            }
          }}
        >
          {payments.map((payment, i) => (
            <Tr
              options={[
                {
                  label: "Edit",
                  fun: () => {
                    setPaymentToEdit(payment);
                    setShowForm(true);
                  },
                },
                {
                  label: "Delete",
                  fun: () => dltPayment(payment._id),
                },
              ]}
              key={i}
            >
              <td className={s.date}>{displayDate(payment.date)}</td>
              <td className={s.amount} key={i}>
                {payment.amount?.toLocaleString("en-IN")}
              </td>
            </Tr>
          ))}
          <tr className={s.totalRecieved}>
            <td>Recieved</td>
            <td className={s.amount}>
              {payments
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.totalDeu}>
            <td>Deu</td>
            <td className={s.amount}>
              {(
                ssrData.summery.totalWage -
                payments.reduce((p, c) => p + c.amount, 0)
              ).toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        {fy !== "all" && (
          <AddBtn translate={addBtnStyle} onClick={setShowForm} />
        )}
      </div>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddWagePayment
          paymentToEdit={paymentToEdit}
          fy={fy}
          onSuccess={(newPayment) => {
            setPayments((prev) => {
              const newPayments = prev.filter(
                (item) => item._id !== newPayment._id
              );
              newPayments.push(newPayment);
              return newPayments;
            });
            setShowForm(false);
          }}
        />
      </Modal>
    </App>
  );
}
