import { useState, useContext, useEffect } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr } from "../components/Table";
import { AddMaterialPayment } from "../components/Forms";
import { Modal } from "../components/Modals";
import s from "../components/SCSS/Table.module.scss";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../utils/db");
  dbConnect();
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [user, bills, payments, months] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Bill.find(filters),
      MaterialPayment.find(filters),
      MaterialPayment.aggregate([
        {
          $match: { fy },
        },
        {
          $sort: { date: 1 },
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
          dates[0]?.dates.map((date) => {
            return {
              label: `${date.month}-${date.year}`,
              value: `${date.year}-${
                date.month < 10 ? "0" + date.month : date.month
              }`,
            };
          }) || []
      ),
    ]);
    return {
      props: {
        ssrUser: json(user),
        ssrData: json({ bills, payments }),
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
    setUser(ssrUser);
  }, []);
  useEffect(() => {
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
                <span className={s.qnt}>
                  {bill.products.reduce((p, c) => p + c.qnt, 0)}
                </span>
                {bill.products
                  .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
                  .toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
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
        </Table>
        {fy !== "all" && <AddBtn onClick={setShowForm} />}
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
