import { useState, useContext, useEffect, useRef, Component } from "react";
import { SiteContext } from "SiteContext";
import { App } from "../index.page";
import Table, { Tr, LoadingTr } from "components/Table";
import { AddMaterialPayment } from "./comp/form";
import { Modal } from "components/Modals";
import s from "./comp/style.module.scss";
import { displayDate, AddBtn } from "components/FormElements";
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
    const _bill = (
      <>
        <div className={s.head}>
          <h3>
            কাজের হিসাব | {months[new Date(bills[0].date).getMonth()]}{" "}
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
                  {bill.total.toLocaleString("en-IN").bn()}
                </td>
              </tr>
            ))}
            <tr className={s.hr} />
            <tr>
              <td>মোট</td>
              <td>{summery.totalProduction.toLocaleString("en-IN").bn()}</td>
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
                <td>
                  <p>
                    <small>
                      {payment.payments.reduce(
                        (p, c) =>
                          c?.remark?.toLowerCase() === "cash"
                            ? p
                            : p + c.remark,
                        ""
                      )}
                    </small>
                  </p>
                  {payment.payments
                    .reduce((a, c) => a + c.amount, 0)
                    .toLocaleString("en-IN")
                    .bn()}
                </td>
              </Tr>
            ))}
            <tr className={s.hr} />
            <tr className={s.grandTotalReceived}>
              <td>জমা</td>
              <td className={s.amount}>
                {summery.totalPaymentReceived.toLocaleString("en-IN").bn()}
              </td>
            </tr>
            <tr>
              <td>সাবেক</td>
              <td>{summery.previous.toLocaleString("en-IN").bn()}</td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td>মোট</td>
              <td className={s.amount}>
                {(summery.previous + summery.totalPaymentReceived)
                  .toLocaleString("en-IN")
                  .bn()}
              </td>
            </tr>
            <tr>
              <td>মাল</td>
              <td className={s.amount}>
                - {summery.totalProduction.toLocaleString("en-IN").bn()}
              </td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td>বর্তমান</td>
              <td>{summery.todate.toLocaleString("en-IN").bn()}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
    return (
      <div className={`${s.paper} ${s.monthlyReportPaper} ${s.portrait}`}>
        <div className={`${s.monthlyReport}`}>{_bill}</div>
      </div>
    );
  }
}

export default function Productions() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } =
    useContext(SiteContext);
  const [showForm, setShowForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(false);
  const [payments, setPayments] = useState(null);
  const [bills, setBills] = useState(null);
  const [summery, setSummery] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const { error, data } = useSWR(
    `/api/payments?payment=production&fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const handlePrint = useReactToPrint({ content: () => componentRef.current });
  const componentRef = useRef();
  const dltPayment = (_id) => {
    if (confirm("you want to delete this payments?")) {
      fetch(`/api/payments/${_id}`, { method: "DELETE" })
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
    if (data?.payments) {
      setBills(data.bills);
      setPayments(data.payments);
      setSummery(data.summery);
      setMonths(data.months);
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
      setNameTag("Productions");
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
          <tr className={s.totalRecieved}>
            <td>Total</td>
            <td className={s.amount}>
              {summery.totalProduction.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr>
            <td>
              <button onClick={() => setShowPrint(true)}>Print</button>
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
          {router.query.from && router.query.to ? (
            <>
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
                  {(
                    summery.previous + summery.totalPaymentReceived
                  ).toLocaleString("en-IN")}
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
            </>
          ) : (
            <>
              <tr className={s.past}>
                <td>Current</td>
                <td className={s.amount}>
                  {summery.previous.toLocaleString("en-IN")}
                </td>
              </tr>
            </>
          )}
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
