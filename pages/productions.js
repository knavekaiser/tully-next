import { useState, useContext, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr } from "../components/Table";
import { AddMaterialPayment } from "../components/Forms";
import { Modal } from "../components/Modals";
import s from "../components/SCSS/Table.module.scss";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";

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
      bills,
      previousProduction,
      payments,
      previouslyReceivedPayment,
      months,
      more,
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
            product: {
              $sum: { $multiply: ["$products.qnt", "$products.cost"] },
            },
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
            total: { $subtract: ["$product", "$wage"] },
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
            product: {
              $sum: { $multiply: ["$products.qnt", "$products.cost"] },
            },
            wage: {
              $sum: { $multiply: ["$products.qnt", "$products.wage"] },
            },
          },
        },
        {
          $project: {
            total: { $subtract: ["$product", "$wage"] },
          },
        },
        {
          $group: {
            _id: "total",
            total: { $sum: "$total" },
          },
        },
      ]).then((data) => data[0]?.total || 0),
      MaterialPayment.find(filters),
      MaterialPayment.aggregate([
        {
          $match: from
            ? { date: { $lt: new Date(from) } }
            : { fy: { $lt: fy.substr(0, 4) } },
        },
        {
          $group: {
            _id: "total",
            total: { $sum: { $sum: "$payments.amount" } },
          },
        },
      ]).then((data) => data[0]?.total || 0),
      getMonths(MaterialPayment, fy),
      MaterialPayment.aggregate([
        {
          $match: { date: { $gte: new Date(from), $lte: new Date(to) } },
        },
        // {
        //   $project: {
        //     _id: 0,
        //     payments: 1,
        //     new: {
        //       $reduce: {
        //         input: "$payments",
        //         initialValue: { sum: 0 },
        //         in: {
        //           sum: { $add: ["$$value.sum", "$$this.amount"] },
        //         },
        //       },
        //     },
        //   },
        // },
        {
          $group: {
            _id: "allPayments",
            x: { $sum: { $sum: "$payments.amount" } },
          },
        },
      ]),
    ]);
    const totalProduction = bills.reduce((p, c) => p + c.total, 0);
    const totalPaymentReceived = payments.reduce(
      (p, c) => p + c.payments.reduce((pp, cu) => pp + cu.amount, 0),
      0
    );
    const totalPaymentDeu = totalProduction - totalPaymentReceived;
    const previous =
      +process.env.PREVIOUS + previouslyReceivedPayment - previousProduction;
    const todate =
      +process.env.PREVIOUS +
      previouslyReceivedPayment -
      previousProduction +
      totalPaymentReceived -
      totalProduction;
    return {
      props: {
        ssrUser: json(user),
        ssrData: json({
          bills,
          payments,
          summery: {
            totalPaymentDeu,
            previous,
            totalPaymentReceived,
            totalProduction,
            todate,
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
  const [showForm, setShowForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(false);
  const [payments, setPayments] = useState(ssrData.payments);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
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
  const firstRedner = useRef(true);
  useEffect(() => {
    setUser(ssrUser);
  }, []);
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
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => {
    !showForm && setPaymentToEdit(null);
  }, [showForm]);
  useEffect(() => {
    setPayments(ssrData.payments);
  }, [ssrData]);
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
          {ssrData.bills.map((bill, i) => (
            <tr key={i}>
              <td className={s.date}>
                <span className={s.ref}>{bill.ref}</span>
                {displayDate(bill.date)}
              </td>
              <td className={s.total}>
                <span className={s.qnt}>{bill.qnt}</span>
                {bill.total.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
          <tr className={s.grandTotal}>
            <td>Total Production</td>
            <td className={s.amount}>
              {ssrData.summery.totalProduction.toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        <Table
          className={s.payment}
          columns={[
            {
              label: "Date",
            },
            {
              label: (
                <>
                  <span className={s.for}>Remark</span>
                  Taka
                </>
              ),
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
              {payment.payments.map((item, i) => {
                return (
                  <td className={s.amount} key={i}>
                    <span className={s.remark}>{item.remark}</span>
                    {item.amount?.toLocaleString("en-IN")}
                  </td>
                );
              })}
            </Tr>
          ))}
          <tr className={s.grandTotalReceived}>
            <td>Recieved</td>
            <td className={s.amount}>
              {ssrData.summery.totalPaymentReceived.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.grandTotalDeu}>
            <td>Deu</td>
            <td className={s.amount}>
              {ssrData.summery.totalPaymentDeu.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} /> <tr className={s.hr} />
          <tr className={s.hr} />
          <tr className={s.past}>
            <td>Previous</td>
            <td className={s.amount}>
              {ssrData.summery.previous.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr>
            <td>Recieved</td>
            <td className={s.amount}>
              + {ssrData.summery.totalPaymentReceived.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr>
            <td>Total</td>
            <td className={s.amount}>
              {(
                ssrData.summery.previous + ssrData.summery.totalPaymentReceived
              ).toLocaleString("en-IN")}
            </td>
          </tr>
          <tr>
            <td>Total production</td>
            <td className={s.amount}>
              - {ssrData.summery.totalProduction.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr>
            <td>Todate</td>
            <td className={s.amount}>
              {ssrData.summery.todate.toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        {fy !== "all" && (
          <AddBtn translate={addBtnStyle} onClick={setShowForm} />
        )}
      </div>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddMaterialPayment
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
