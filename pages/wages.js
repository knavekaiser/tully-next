import { useState, useContext, useEffect, useRef, Component } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import Table, { Tr, LoadingTr } from "../components/Table";
import { AddWagePayment } from "../components/Forms";
import { Modal } from "../components/Modals";
import s from "../components/SCSS/Table.module.scss";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoLockClosedOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const months = [
  "জানুয়ারী",
  "ফেব্রুয়ারী",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
class Production_Print extends Component {
  render() {
    const { bills, payments, summery } = this.props;
    const wages = {};
    // bills.length = 10;
    const _bill = (
      <>
        <div className={s.head}>
          <h3>
            মজুরীর হিসাব | {months[new Date(bills[0].date).getMonth()]}{" "}
            {new Date(bills[0].date).getFullYear().toString().bn()}
          </h3>
        </div>
        <table className={s.content} cellSpacing={0} cellPadding={0}>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>পরিমাণ</th>
            </tr>
          </thead>
          <tbody className={s.products}>
            {bills.map((bill, i) => (
              <tr key={i}>
                <td className={s.date}>
                  {displayDate(bill.date).bn()}{" "}
                  <small>({bill.ref.toString().bn()})</small>
                </td>
                <td className={s.total}>
                  {bill.wage.toLocaleString("en-IN").bn()}
                </td>
              </tr>
            ))}
            <tr className={s.hr} />
            <tr>
              <td>মোট</td>
              <td>{summery.totalWage.toLocaleString("en-IN").bn()}</td>
            </tr>
            <tr className={s.grandTotalReceived}>
              <td>সাবেক</td>
              <td className={s.amount}>
                + {summery.previousWage.toLocaleString("en-IN").bn()}
              </td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td>মোট</td>
              <td className={s.amount}>
                {(summery.totalWage + summery.previousWage)
                  .toLocaleString("en-IN")
                  .bn()}
              </td>
            </tr>
            <tr>
              <td>এই মাস</td>
              <td className={s.amount}>
                {payments
                  .reduce((p, c) => p + c.amount, 0)
                  .toLocaleString("en-IN")
                  .bn()}
              </td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td>বর্তমান</td>
              <td>
                {(
                  summery.totalWage +
                  summery.previousWage -
                  payments.reduce((p, c) => p + c.amount, 0)
                )
                  .toLocaleString("en-IN")
                  .bn()}
              </td>
            </tr>
          </tbody>
        </table>
        <table className={s.content} cellSpacing={0} cellPadding={0}>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>পরিমাণ</th>
            </tr>
          </thead>
          <tbody className={s.summery}>
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
                <td className={s.date}>{displayDate(payment.date).bn()}</td>
                <td>{payment.amount.toLocaleString("en-IN").bn()}</td>
              </Tr>
            ))}
          </tbody>
          <tr className={s.hr} />
          <tr>
            <td>মোট</td>
            <td className={s.amount}>
              {payments
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")
                .bn()}
            </td>
          </tr>
        </table>
      </>
    );
    return (
      <div className={`${s.monthlyReportPaper} ${s.portrait}`}>
        <div className={`${s.monthlyReport}`}>{_bill}</div>
      </div>
    );
  }
}

export default function Productions() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } = useContext(
    SiteContext
  );
  const [payments, setPayments] = useState(null);
  const [bills, setBills] = useState(null);
  const [summery, setSummery] = useState(null);
  const { error, data } = useSWR(
    `/api/payments?payment=wages&fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [showForm, setShowForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(false);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const handlePrint = useReactToPrint({ content: () => componentRef.current });
  const componentRef = useRef();
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
    if (data?.payments) {
      setPayments(data.payments);
      setMonths(data.months);
      setBills(data.bills);
      setSummery(data.summery);
    }
    setTimeout(() => {
      Array.from(document.querySelectorAll("tbody")).forEach((el) => {
        el.scrollBy(0, 100000);
      });
    }, 50);
  }, [data]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Wages");
    }
  }, []);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <IoLockClosedOutline />
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
            <LoadingTr number={2} />
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
            <LoadingTr number={2} />
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
          {bills?.map((bill, i) => (
            <Link key={i} href={`/bills/${bill.ref}`}>
              <tr>
                <td className={s.date}>
                  <span className={s.ref}>{bill.ref}</span>
                  {displayDate(bill.date)}
                </td>
                <td className={s.total}>
                  <span className={s.qnt}>{bill.qnt}</span>
                  {bill.wage.toLocaleString("en-IN")}
                </td>
              </tr>
            </Link>
          ))}
          {router.query.from && router.query.to ? (
            <>
              <tr className={`${s.totalRecieved} ${s.total}`}>
                <td>Total Production</td>
                <td className={s.amount}>
                  {summery.totalWage.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className={s.total}>
                <td>Previous</td>
                <td className={s.amount}>
                  + {summery.previousWage.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className={s.hr} />
              <tr className={s.total}>
                <td>Total</td>
                <td className={s.amount}>
                  {(summery.totalWage + summery.previousWage).toLocaleString(
                    "en-IN"
                  )}
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
                    summery.totalWage +
                    summery.previousWage -
                    payments.reduce((p, c) => p + c.amount, 0)
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr className={s.total}>
                <td>Current</td>
                <td className={s.amount}>
                  + {summery.previousWage.toLocaleString("en-IN")}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td>
              <button onClick={() => setShowPrint(true)}>Print</button>
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
                summery.totalWage - payments.reduce((p, c) => p + c.amount, 0)
              ).toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        {fy !== "all" && (
          <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
        )}
      </div>
      <Modal open={showPrint} setOpen={setShowPrint} className={s.container}>
        <Production_Print
          bills={bills}
          payments={payments}
          summery={summery}
          ref={componentRef}
        />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
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
