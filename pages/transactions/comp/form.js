import { useState } from "react";
import { Input, Submit, Combobox } from "components/FormElements";
import { moment } from "components/elements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

export function AddTransaction({ edit, wallet, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    moment({ time: edit?.date || new Date(), format: "YYYY-MM-DDThh:mm" })
  );
  // const [wallet, setWallet] = useState(edit?.wallet || "wages");
  const [type, setType] = useState(edit?.type || "expense");
  const [amount, setAmount] = useState(edit?.amount || "");
  const [note, setNote] = useState(edit?.note || "");
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/transactions", {
      method: edit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        wallet,
        type,
        amount,
        note,
        ...(edit && { _id: edit._id }),
      }),
    })
      .then((res) => res.json())
      .then(({ code, transaction }) => {
        setLoading(false);
        if (code === "ok") {
          onSuccess?.(transaction);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        alert("something went wrong");
      });
  };
  return (
    <form className={`${s.form} ${s.addGroup}`} onSubmit={submit}>
      <h2>Add Transaction - {wallet}</h2>
      <Input
        defaultValue={date}
        required={true}
        label="Date"
        type="datetime-local"
        onChange={(t) => {
          setDate(t.value);
        }}
      />
      <Combobox
        label="Type"
        defaultValue={type}
        options={[
          { label: "Income", value: "income" },
          { label: "Expense", value: "expense" },
        ]}
        required={true}
        onChange={(option) => {
          setType(option.value);
        }}
      />
      <Input
        defaultValue={amount}
        required={true}
        label="amount"
        type="number"
        onChange={(t) => {
          setAmount(t.value);
        }}
      />
      <Input
        defaultValue={note}
        required={true}
        label="Note"
        onChange={(t) => {
          setNote(t.value);
        }}
      />
      <Submit loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
