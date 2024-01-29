import { useEffect, useState, useContext, useRef } from "react";
import { SiteContext } from "SiteContext";
import {
  Input,
  PasswordInput,
  Submit,
  MultipleInput,
  GetGroupData,
  formatDate,
  $,
} from "@/components/FormElements";
import s from "./style.module.scss";
// import s from "@/components/SCSS/FormElements.module.scss";
import { IoAddOutline } from "react-icons/io5";

export function AddEmp({ onSuccess }) {
  const { season } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [sameName, setSameName] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/employee", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ name, pass, season }),
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
      <h2>Add employee</h2>
      <Input
        required={true}
        validationMessage="Enter employee's name"
        label="Name"
        onChange={(target) => {
          setName(target.value);
          setSameName(false);
        }}
      >
        {sameName && (
          <p className={s.fieldWarning}>Name already exists in this season</p>
        )}
      </Input>
      <PasswordInput
        autoComplete="new-password"
        label="Password"
        value={pass}
        onChange={(target) => setPass(target.value)}
        validationMessage="More than 8 character"
      />
      <Submit disabled={sameName} loading={loading} label={<IoAddOutline />} />
    </form>
  );
}
export function UpdateEmp({ data, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(data.name);
  const [pass, setPass] = useState(data.pass);
  const [sameName, setSameName] = useState(false);
  const [noChange, setNoChange] = useState(true);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/employee", {
      method: "PATCH",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ _id: data._id, name, pass }),
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
  useEffect(() => {
    if (data.name !== name || data.pass !== pass) {
      setNoChange(false);
    } else {
      setNoChange(true);
    }
  }, [name, pass]);
  return (
    <form autoComplete="off" className={s.form} onSubmit={submit}>
      <h2>Update employee</h2>
      <Input
        defaultValue={data.name}
        required={true}
        validationMessage="Enter employee's name"
        label="Name"
        onChange={(target) => {
          setName(target.value);
          setSameName(false);
        }}
      >
        {sameName && <p className={s.fieldWarning}>Name already exists</p>}
      </Input>
      <PasswordInput
        defaultValue={data.pass}
        label="Password"
        onChange={(target) => setPass(target.value)}
        validationMessage="More than 8 character"
      />
      <Submit
        disabled={noChange || sameName}
        loading={loading}
        label="Update"
      />
    </form>
  );
}
export function AddEmpWork({ employee, workToEdit, onSuccess }) {
  const { groups, season } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [paid, setPaid] = useState(0);
  const empWork = useRef([
    [
      {
        id: "dress",
        type: "text",
        label: "Dress",
        clone: true,
      },
      {
        id: "qnt",
        type: "number",
        label: "Pcs",
      },
      {
        id: "group",
        type: "combobox",
        label: "Group",
        options: groups,
      },
    ],
    [
      {
        id: "dress",
        type: "text",
        label: "Dress",
        clone: true,
        value: "Linen",
      },
      {
        id: "qnt",
        type: "number",
        label: "Pcs",
      },
      {
        id: "group",
        type: "combobox",
        label: "Group",
        options: groups,
      },
    ],
    [
      {
        id: "dress",
        type: "text",
        label: "Dress",
        clone: true,
        value: "Cotton",
      },
      {
        id: "qnt",
        type: "number",
        label: "Pcs",
      },
      {
        id: "group",
        type: "combobox",
        label: "Group",
        options: groups,
      },
    ],
    [
      {
        id: "dress",
        type: "text",
        label: "Dress",
        clone: true,
        value: "Gorjet",
      },
      {
        id: "qnt",
        type: "number",
        label: "Pcs",
      },
      {
        id: "group",
        type: "combobox",
        label: "Group",
        options: groups,
      },
    ],
  ]);
  const [preFill, setPreFill] = useState(() => {
    if (workToEdit) {
      setDate(formatDate(workToEdit.date));
      setPaid(workToEdit.paid);
      let inputProduction = [];
      if (workToEdit.products.length > 0) {
        workToEdit.products.forEach((item) => {
          inputProduction.push([
            {
              ...empWork.current[0][0],
              value: item.dress,
            },
            {
              ...empWork.current[0][1],
              value: item.qnt,
            },
            {
              ...empWork.current[0][2],
              value: empWork.current[0][2].options.find(
                (option) => option.value === item.group
              ),
            },
          ]);
        });
      }
      inputProduction.push(...empWork.current);
      return {
        ...workToEdit,
        products: [...inputProduction],
      };
    } else {
      return null;
    }
  });
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(`/api/${employee ? "empWork" : "lots"}`, {
      method: preFill ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(preFill && { _id: workToEdit._id }),
        ...(employee && !preFill && { employee }),
        date,
        season,
        ...(employee && { paid: paid || 0 }),
        products: GetGroupData($(".modal div#dress")),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          onSuccess?.(data.content);
        } else {
          setLoading(false);
          alert("something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        alert("something wont wrong");
      });
  };
  return (
    <form className={`${s.form} ${s.empWork}`} onSubmit={submit}>
      <h2>{workToEdit ? "Edit work" : "Add work"}</h2>
      <Input
        defaultValue={formatDate(preFill?.date)}
        required={true}
        label="Date"
        type="date"
        onChange={(target) => setDate(target.value)}
        validationMessage="Enter a date"
      />
      <div className={s.products}>
        <MultipleInput
          id="dress"
          inputs={preFill?.products || empWork.current}
          refInput={empWork.current}
        />
      </div>
      {employee && (
        <Input
          defaultValue={preFill?.paid}
          label="Payment"
          type="number"
          onChange={(t) => setPaid(t.value)}
        />
      )}
      <Submit loading={loading} label={<IoAddOutline />} />
      <div className={s.pBtm} />
    </form>
  );
}
