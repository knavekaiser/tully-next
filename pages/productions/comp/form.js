import { useState } from "react";
import {
  Input,
  Submit,
  MultipleInput,
  GetGroupData,
  formatDate,
  $,
} from "components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

const matPayments = [
  [
    {
      id: "remark",
      type: "text",
      label: "Remark",
      clone: true,
    },
    {
      id: "amount",
      type: "number",
      label: "Amount",
    },
  ],
];

export function AddMaterialPayment({ fy, paymentToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    paymentToEdit && formatDate(paymentToEdit.date)
  );
  const [preFill, setPreFill] = useState(() => {
    if (paymentToEdit) {
      let payments = [];
      if (paymentToEdit.payments.length > 0) {
        paymentToEdit.payments.forEach((item) => {
          payments.push([
            {
              ...matPayments[0][0],
              value: item.remark,
            },
            {
              ...matPayments[0][1],
              value: item.amount,
            },
          ]);
        });
      }
      payments.push(...matPayments);
      return {
        ...paymentToEdit,
        payments: [...payments],
      };
    } else {
      return null;
    }
  });
  const submit = (e) => {
    e.preventDefault();
    const payments = GetGroupData($(".modal #remarks"));
    if (payments.length < 1) return;
    setLoading(true);
    fetch("/api/payments", {
      method: paymentToEdit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        date,
        fy,
        payments,
        ...(paymentToEdit && { _id: paymentToEdit._id }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.content);
        } else {
          alert("something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("something went wrong");
      });
  };
  return (
    <form
      autoComplete="off"
      className={`${s.form} ${s.materialPayment}`}
      onSubmit={submit}
    >
      <h2>Add Material Payment</h2>
      <Input
        defaultValue={paymentToEdit && formatDate(paymentToEdit.date)}
        required={true}
        label="Date"
        type="date"
        onChange={(t) => setDate(t.value)}
      />
      <div className={s.remarks}>
        <MultipleInput
          id="remarks"
          className={s.amounts}
          inputs={preFill?.payments || matPayments}
          refInput={matPayments}
        />
      </div>
      <Submit loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
