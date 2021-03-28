import { useEffect, useState, useContext, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr, LoadingTr } from "../../components/Table";
import { displayDate, AddBtn, SS } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { BillForm } from "../../components/Forms";
import useSWR from "swr";
import s from "../../components/SCSS/Table.module.scss";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Bills() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths } = useContext(SiteContext);
  let { error, data } = useSWR(
    `/api/bills?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [bills, setBills] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [billToEdit, setBillToEdit] = useState(null);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const dltBill = (_id) => {
    if (confirm("you want to delete this bill?")) {
      fetch("/api/bills", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setBills((prev) => prev.filter((item) => item._id !== _id));
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
  const firstRender = useRef(true);
  useEffect(() => {
    if (data) {
      setMonths(data.months);
      setBills(data.bills);
    }
  }, [data]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
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
  useEffect(() => !showForm && setBillToEdit(null), [showForm]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
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
  return (
    <App key="bills">
      <Table
        columns={[
          { label: "date", className: s.date },
          { label: "ref", className: s.ref },
          { label: "dress", className: s.dress },
          { label: "Pcs" },
          { label: "Total" },
        ]}
        className={s.bills}
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {bills?.map((bill) => (
          <Tr
            key={bill.ref}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setBillToEdit(bill);
                  setShowForm(true);
                },
              },
              {
                label: "Delete",
                fun: () => dltBill(bill._id),
              },
            ]}
            onClick={() => {
              router.push(`/bills/${bill.ref}`);
              SS.set("singleBillData", JSON.stringify(bill));
            }}
          >
            <td className={s.date}>{displayDate(bill.date)}</td>
            <td className={s.ref}>{bill.ref}</td>
            <td className={s.dress}>
              {bill.products.length <= 1
                ? bill.products[0]?.dress
                : "Multiple items"}
            </td>
            <td>
              {bill.products
                .reduce((p, c) => p + c.qnt, 0)
                .toLocaleString("en-IN")}
            </td>
            <td>
              {bill.products
                .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
                .toLocaleString("en-IN")}
            </td>
          </Tr>
        ))}
        {!bills && <LoadingTr number={5} />}
      </Table>
      {fy !== "all" && <AddBtn translate={addBtnStyle} onClick={setShowForm} />}
      <Modal open={showForm} setOpen={setShowForm}>
        <BillForm
          fy={fy}
          billToEdit={billToEdit}
          onSuccess={(newBill) => {
            setBills((prev) => {
              const newBills = prev.filter((item) => item._id !== newBill._id);
              newBills.push(newBill);
              return newBills;
            });
            setShowForm(false);
          }}
        />
      </Modal>
    </App>
  );
}
