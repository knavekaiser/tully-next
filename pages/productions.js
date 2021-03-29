import { useState, useContext, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr, LoadingTr } from "../components/Table";
import { AddMaterialPayment } from "../components/Forms";
import { Modal } from "../components/Modals";
import s from "../components/SCSS/Table.module.scss";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Productions() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } = useContext(
    SiteContext
  );
  const [showForm, setShowForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(false);
  const [payments, setPayments] = useState(null);
  const [bills, setBills] = useState(null);
  const [summery, setSummery] = useState(null);
  const { error, data } = useSWR(
    `/api/payments?payment=production&fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
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
  useEffect(() => {
    !showForm && setPaymentToEdit(null);
  }, [showForm]);
  useEffect(() => {
    if (data) {
      setBills(data.bills);
      setPayments(data.payments);
      setSummery(data.summery);
      setMonths(data.months);
    }
  }, [data]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Productions");
    }
  }, []);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <ion-icon name="lock-closed-outline"></ion-icon>
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  if (!payments) {
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
            <LoadingTr number={4} />
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
            <LoadingTr number={4} />
          </Table>
        </div>
      </App>
    );
  }
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
          {bills.map((bill, i) => (
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
          <tr className={s.totalRecieved}>
            <td>Total</td>
            <td className={s.amount}>
              {summery.totalProduction.toLocaleString("en-IN")}
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
              {summery.totalPaymentReceived.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.grandTotalDeu}>
            <td>Deu</td>
            <td className={s.amount}>
              {summery.totalPaymentDeu.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} /> <tr className={s.hr} />
          <tr className={s.hr} />
          <tr className={s.past}>
            <td>Previous</td>
            <td className={s.amount}>
              {summery.previous.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr>
            <td>Recieved</td>
            <td className={s.amount}>
              + {summery.totalPaymentReceived.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr>
            <td>Total</td>
            <td className={s.amount}>
              {(summery.previous + summery.totalPaymentReceived).toLocaleString(
                "en-IN"
              )}
            </td>
          </tr>
          <tr>
            <td>Production</td>
            <td className={s.amount}>
              - {summery.totalProduction.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.hr} />
          <tr>
            <td>Todate</td>
            <td className={s.amount}>
              {summery.todate.toLocaleString("en-IN")}
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
