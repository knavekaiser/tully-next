import { useState } from "react";
import { Input, Submit, formatDate } from "@/components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

export function AddWagePayment({ fy, paymentToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    paymentToEdit && formatDate(paymentToEdit.date)
  );
  const [amount, setAmount] = useState(paymentToEdit?.amount);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/payments", {
      method: paymentToEdit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        date,
        fy,
        amount,
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
      <h2>Add Wage Payment</h2>
      <Input
        defaultValue={paymentToEdit && formatDate(paymentToEdit.date)}
        required={true}
        label="Date"
        type="date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        defaultValue={paymentToEdit?.amount}
        required={true}
        label="Amount"
        type="number"
        onChange={(t) => setAmount(t.value)}
      />
      <Submit loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
