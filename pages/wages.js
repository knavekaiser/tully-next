import { useState, useContext, useEffect } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr } from "../components/Table";
import { AddWagePayment } from "../components/Forms";
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
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [user, bills, payments, months] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Bill.find(filters),
      WagePayment.find(filters),
      getMonths(WagePayment, fy),
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
  useEffect(() => {
    setUser(ssrUser);
  }, []);
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
  useEffect(() => {
    !showForm && setPaymentToEdit(null);
  }, [showForm]);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
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
          <tr>
            <td>total</td>
            <td>
              {payments
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")}
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
