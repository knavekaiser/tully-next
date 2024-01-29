import { useState } from "react";
import {
  Input,
  Submit,
  MultipleInput,
  GetGroupData,
  formatDate,
  $,
} from "@/components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

const billProduction = [
  [
    { id: "lot", type: "number", label: "Lot" },
    { id: "dress", type: "text", label: "Dress", clone: true },
    { id: "qnt", type: "number", label: "Pcs" },
    { id: "cost", type: "number", label: "Cost" },
    { id: "wage", type: "number", label: "Wage" },
  ],
];

export function BillForm({ fy, defaultRef, billToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    billToEdit
      ? formatDate(billToEdit.date)
      : formatDate(new Date().toISOString())
  );
  const [ref, setRef] = useState(billToEdit?.ref || defaultRef || "");
  const [refExists, setRefExists] = useState(false);
  const [preFill, setPreFill] = useState(() => {
    if (billToEdit) {
      let products = [];
      if (billToEdit.products.length > 0) {
        billToEdit.products.forEach((item) => {
          products.push([
            {
              ...billProduction[0][0],
              value: item.lot,
            },
            {
              ...billProduction[0][1],
              value: item.dress,
            },
            {
              ...billProduction[0][2],
              value: item.qnt,
            },
            {
              ...billProduction[0][3],
              value: item.cost,
            },
            {
              ...billProduction[0][4],
              value: item.wage,
            },
          ]);
        });
      }
      products.push(...billProduction);
      return {
        ...billToEdit,
        products: [...products],
      };
    } else {
      return null;
    }
  });
  const submit = (e) => {
    e.preventDefault();
    const products = GetGroupData($(".modal #items"));
    if (products.length < 1) return;
    setLoading(true);
    fetch("/api/bills", {
      method: billToEdit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(preFill && { _id: billToEdit._id }),
        date,
        fy,
        ref,
        products,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.content);
        } else if (data.message === "ref exists") {
          setRefExists(true);
        } else {
          alert("something went wrong");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        alert("something went wrong");
      });
  };
  return (
    <form className={`${s.form} ${s.bill}`} onSubmit={submit}>
      <h2>Add Bill</h2>
      <Input
        required={true}
        defaultValue={date}
        type="date"
        label="Date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        required={true}
        defaultValue={ref}
        label="Ref"
        type="number"
        onChange={(t) => {
          setRef(t.value);
          refExists && setRefExists(false);
        }}
      >
        {refExists && <p className={s.fieldWarning}>choose new</p>}
      </Input>
      <div className={s.products}>
        <MultipleInput
          id="items"
          inputs={preFill?.products || billProduction}
          refInput={billProduction}
          className={s.multipleInput}
        />
      </div>
      <Submit disabled={refExists} loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
