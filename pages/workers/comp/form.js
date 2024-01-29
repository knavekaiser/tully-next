import { useState } from "react";
import { Input, Submit, formatDate } from "./FormElements";
import s from "./SCSS/FormElements.module.scss";
import { IoAddOutline } from "react-icons/io5";

export function AddWorker({ edit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(edit?.name);
  const [salary, setSalary] = useState(edit?.salary);
  const [join, setJoin] = useState(edit && formatDate(edit?.join));
  const [sameName, setSameName] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/workers", {
      method: edit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        name,
        join,
        salary,
        ...(edit && { _id: edit._id }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.content);
        } else if (data.code === "same exists") {
          if (data.fields.includes("name")) {
            setSameName(true);
          }
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
    <form autoComplete="off" className={s.form} onSubmit={submit}>
      <h2>Add Worker</h2>
      <Input
        defaultValue={edit && formatDate(edit?.join)}
        required={true}
        label="Join"
        type="date"
        onChange={(t) => setJoin(t.value)}
      />
      <Input
        defaultValue={edit?.name}
        required={true}
        validationMessage="Enter worker's name"
        label="Name"
        onChange={(target) => {
          setName(target.value);
          setSameName(false);
        }}
      >
        {sameName && <p className={s.fieldWarning}>Name already exists</p>}
      </Input>
      <Input
        defaultValue={edit?.salary}
        required={true}
        label="Salary"
        type="number"
        onChange={(t) => setSalary(t.value)}
      />
      <Submit disabled={sameName} loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
export function WorkerForm({ edit, onSuccess }) {
  const [section, setSection] = useState("payment");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(formatDate(edit?.date));
  const [paid, setPaid] = useState(paid?.paid);
  const [abs, setAbs] = useState({ from: null, to: null });
  return (
    <form className={`${s.form} ${s.workerForm}`}>
      <h2>
        <span
          className={section === "payment" ? s.active : ""}
          onClick={() => setSection("payment")}
        >
          Payment
        </span>
        <span
          className={section === "abs" ? s.active : ""}
          onClick={() => setSection("abs")}
        >
          Absence
        </span>
      </h2>
      {section === "payment" ? (
        <>
          <Input
            defaultValue={formatDate(edit?.date)}
            required={true}
            label="Date"
            type="date"
            onChange={(t) => setDate(t.value)}
          />
          <Input
            defaultValue={paid?.paid}
            required={true}
            label="Amount"
            type="number"
            onChange={(t) => setPaid(t.value)}
          />
        </>
      ) : (
        <>
          <Input
            defaultValue={date.from}
            required={true}
            label="From"
            type="date"
            onChange={(t) => setAbs((prev) => ({ ...prev, from: t.value }))}
          />
          <Input
            required={true}
            label="To"
            type="date"
            value={date.to}
            onChange={(t) => setAbs((prev) => ({ ...prev, to: t.value }))}
          />
        </>
      )}
      <Submit loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
