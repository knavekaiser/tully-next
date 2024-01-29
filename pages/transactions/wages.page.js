import { useState, useContext, useEffect, useRef, Component } from "react";
import { SiteContext } from "SiteContext";
import { App } from "../index.page";
import Table, { Tr, LoadingTr } from "components/Table";
import { AddTransaction } from "./comp/form";
import { Modal } from "components/Modals";
import s from "components/SCSS/Table.module.scss";
import { AddBtn } from "components/FormElements";
import { useRouter } from "next/router";
import { IoLockClosedOutline, IoSwapVerticalOutline } from "react-icons/io5";
import { Moment } from "components/elements";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Transactions() {
  const router = useRouter();
  const { user, dateFilter, setMonths, setNameTag } = useContext(SiteContext);
  const [transactions, setTransactions] = useState(null);
  const { error, data } = useSWR(
    `/api/transactions?${new URLSearchParams({
      wallet: "wages",
      ...(dateFilter && {
        dateFrom: dateFilter.from,
        dateTo: dateFilter.to,
      }),
    }).toString()}`,
    fetcher
  );
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const componentRef = useRef();
  const firstRedner = useRef(true);
  const dltTransaction = (_id) => {
    if (confirm("you want to delete this transactions?")) {
      fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setTransactions((prev) => prev.filter((item) => item._id !== _id));
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
    !showForm && setEdit(null);
  }, [showForm]);
  useEffect(() => {
    if (firstRedner.current) {
      firstRedner.current = false;
      return;
    }
    router.push({
      pathname: router.pathname,
      query: {
        ...(dateFilter && {
          from: dateFilter.from,
          to: dateFilter.to,
        }),
      },
    });
  }, [dateFilter]);
  useEffect(() => {
    if (data?.transactions) {
      setTransactions(data.transactions);
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
      setNameTag(
        <>
          <IoSwapVerticalOutline /> Wage
        </>
      );
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
  if (!transactions) {
    return (
      <App>
        <div className={`${s.productions} ${s.transactions}`}>
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
        </div>
      </App>
    );
  }
  return (
    <App>
      <div className={`${s.productions} ${s.transactions}`}>
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
          {transactions.map((transaction, i) => (
            <Tr
              options={[
                {
                  label: "Edit",
                  fun: () => {
                    setEdit(transaction);
                    setShowForm(true);
                  },
                },
                {
                  label: "Delete",
                  fun: () => dltTransaction(transaction._id),
                },
              ]}
              key={i}
              className={s[transaction.type]}
            >
              <td className={s.date}>
                <Moment format="MM-DD-YY hh:mma">{transaction.date}</Moment>
                <span className={s.note}>{transaction.note}</span>
              </td>
              <td className={s.amount} key={i}>
                {transaction.amount?.toLocaleString("en-IN")}
              </td>
            </Tr>
          ))}
          <tr className={s.totalRecieved}>
            <td>Recieved</td>
            <td className={s.amount}>
              {transactions
                .filter((t) => t.type === "income")
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.totalDeu}>
            <td>Expense</td>
            <td className={s.amount}>
              {transactions
                .filter((t) => t.type === "expense")
                .reduce((p, c) => p + c.amount, 0)
                .toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className={s.total}>
            <td>Total</td>
            <td className={s.amount}>
              {transactions
                .reduce(
                  (p, c) => (c.type === "income" ? p + c.amount : p - c.amount),
                  0
                )
                .toLocaleString("en-IN")}
            </td>
          </tr>
        </Table>
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      </div>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddTransaction
          edit={edit}
          wallet="wages"
          onSuccess={(newTransaction) => {
            setTransactions((prev) => {
              return prev.find((t) => t._id === newTransaction._id)
                ? prev.map((t) =>
                    t._id === newTransaction._id ? newTransaction : t
                  )
                : [...prev, newTransaction];
            });
            setEdit(null);
            setShowForm(false);
          }}
        />
      </Modal>
    </App>
  );
}
