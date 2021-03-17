import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr } from "../../components/Table";
import { displayDate, AddBtn } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { BillForm } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json, getMonths } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  let bills = [];
  let user = {};
  let months = [];
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    bills = await Bill.find(filters).sort({ ref: 1 });
    months = await getMonths(Bill, fy);
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(bills),
      ssrUser: json(user),
      ssrMonths: json(months),
    },
  };
}

export default function Bills({ ssrData, ssrUser, ssrMonths }) {
  const router = useRouter();
  const { fy, dateFilter, setUser, setMonths } = useContext(SiteContext);
  const [bills, setBills] = useState(ssrData);
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
  useEffect(() => setUser(ssrUser), []);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => setBills(ssrData), [ssrData]);
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
  useEffect(() => !showForm && setBillToEdit(null), [showForm]);
  return (
    <App>
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
        {bills.map((bill) => (
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
            onClick={() => router.push(`/bills/${bill.ref}`)}
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
