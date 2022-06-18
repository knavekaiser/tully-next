import {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr, VirtualizedTable, LoadingTr } from "../../components/Table";
import { displayDate, AddBtn, SS } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { BillForm } from "../../components/Forms";
import useSWR from "swr";
import { IoLockClosedOutline } from "react-icons/io5";
import s from "../../components/SCSS/Table.module.scss";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import List from "react-virtualized/dist/commonjs/List";
import AutoTable from "react-virtualized/dist/commonjs/Table";
import { Column } from "react-virtualized";
// import Column from "react-virtualized/dist/commonjs/Column";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Bills() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } = useContext(
    SiteContext
  );
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
  const getRowHeight = useCallback((row) => {
    if (!row) {
      return 0;
    }
    if (row.products.length === 0) {
      return 0;
    } else if (row.products.length === 1) {
      return 52;
    } else if (row.products.length === 2) {
      return 88;
    } else if (row.products.length > 2) {
      return 36 * (row.products.length - 2) + 28 * 2 + 32;
    }
  }, []);
  useEffect(() => {
    if (data?.bills) {
      setMonths(data.months);
      setBills(data.bills);
    }
  }, [data]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
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
    !showForm && setBillToEdit(null);
  }, [showForm]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Bills");
    }
  }, []);
  useEffect(() => {
    setTimeout(() => {
      Array.from(document.querySelectorAll("tbody")).forEach((el) => {
        el.scrollBy(0, 100000);
      });
    }, 50);
  }, [data]);
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
  return (
    <App key="bills">
      <VirtualizedTable
        loading={!bills && 5}
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
        rows={bills || []}
        getRowHeight={getRowHeight}
        rowRenderer={(bill, style) => (
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
            trStyle={style}
          >
            <td className={s.date}>{displayDate(bill.date)}</td>
            <td className={s.ref}>{bill.ref}</td>
            <td className={s.products}>
              {bill.products.map((bill, i) => (
                <div key={i} className={s.product}>
                  <span className={s.dress}>{bill.dress}</span>
                  <span>{bill.qnt}</span>
                  <span>
                    {(
                      bill.cost * bill.qnt -
                      bill.wage * bill.qnt
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </td>
          </Tr>
        )}
      />
      {fy !== "all" && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
      <Modal open={showForm} setOpen={setShowForm}>
        <BillForm
          fy={fy}
          defaultRef={bills && bills[bills.length - 1].ref + 1}
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
