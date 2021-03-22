import { useEffect, useState } from "react";
import {
  Input,
  PasswordInput,
  Submit,
  MultipleInput,
  GetGroupData,
  Combobox,
  formatDate,
  $,
  convertUnit,
} from "./FormElements";
import s from "./SCSS/FormElements.module.scss";

const empWorkProduction = [
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
      options: [
        { label: "Small", value: "S" },
        { label: "Large", value: "L" },
        { label: "Fancy", value: "F" },
        { label: "One Pc", value: "1" },
      ],
    },
  ],
];
const billProduction = [
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
      id: "cost",
      type: "number",
      label: "Cost",
    },
    {
      id: "wage",
      type: "number",
      label: "Wage",
    },
  ],
];
const costMaterials = [
  [
    {
      id: "material",
      type: "text",
      label: "Material",
      clone: true,
    },
    {
      id: "qnt",
      type: "number",
      label: "Qnt",
    },
    {
      id: "price",
      type: "number",
      label: "Price",
    },
  ],
];
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
const fabricUsage = [
  [
    {
      id: "lotNo",
      type: "number",
      label: "Lot no",
      clone: true,
    },
    {
      id: "qnt",
      type: "number",
      label: "Qnt",
    },
    {
      id: "unit",
      type: "combobox",
      label: "Unit",
      options: [
        { label: "Meter", value: "meter" },
        { label: "Yard", value: "yard" },
      ],
    },
  ],
];

export function AddEmp({ onSuccess }) {
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
      body: JSON.stringify({ name, pass }),
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
        {sameName && <p className={s.fieldWarning}>Name already exists</p>}
      </Input>
      <PasswordInput
        autoComplete="new-password"
        label="Password"
        value={pass}
        onChange={(target) => setPass(target.value)}
        validationMessage="More than 8 character"
      />
      <Submit
        disabled={sameName}
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
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
export function AddEmpWork({ employee, fy, workToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [preFill, setPreFill] = useState(() => {
    if (workToEdit) {
      setDate(formatDate(workToEdit.date));
      setPaid(workToEdit.paid);
      let inputProduction = [];
      if (workToEdit.products.length > 0) {
        workToEdit.products.forEach((item) => {
          inputProduction.push([
            {
              ...empWorkProduction[0][0],
              value: item.dress,
            },
            {
              ...empWorkProduction[0][1],
              value: item.qnt,
            },
            {
              ...empWorkProduction[0][2],
              value: empWorkProduction[0][2].options.find(
                (option) => option.value === item.group
              ),
            },
          ]);
        });
      }
      inputProduction.push(...empWorkProduction);
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
    fetch(`/api/${employee ? "empWork" : "lots"}`, {
      method: preFill ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(preFill && { _id: workToEdit._id }),
        ...(employee && !preFill && { employee }),
        date,
        fy,
        ...(employee && { paid }),
        products: GetGroupData($(".modal div#dress")),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          onSuccess?.(data.content);
        } else {
          alert("something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
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
          inputs={preFill?.products || empWorkProduction}
          refInput={empWorkProduction}
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
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
      <div className={s.pBtm} />
    </form>
  );
}

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
      <Submit
        disabled={sameName}
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
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
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}

export function DateFilter({ onSubmit }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(from, to);
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <h2>Date Filter</h2>
      <Input
        label="From"
        type="date"
        value={from}
        onChange={(t) => setFrom(t.value)}
      />
      <Input
        label="To"
        type="date"
        defaultValue={to}
        onChange={(t) => setTo(t.value)}
      />
      <Submit label="Filter" />
    </form>
  );
}

export function BillForm({ fy, billToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(billToEdit && formatDate(billToEdit.date));
  const [ref, setRef] = useState(billToEdit?.ref);
  const [refExists, setRefExists] = useState(false);
  const [preFill, setPreFill] = useState(() => {
    if (billToEdit) {
      let products = [];
      if (billToEdit.products.length > 0) {
        billToEdit.products.forEach((item) => {
          products.push([
            {
              ...billProduction[0][0],
              value: item.dress,
            },
            {
              ...billProduction[0][1],
              value: item.qnt,
            },
            {
              ...billProduction[0][2],
              value: item.cost,
            },
            {
              ...billProduction[0][3],
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
        defaultValue={billToEdit && formatDate(billToEdit.date)}
        type="date"
        label="Date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        required={true}
        defaultValue={billToEdit?.ref}
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
        />
      </div>
      <Submit
        disabled={refExists}
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}

export function CostingForm({ fy, costToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [lot, setLot] = useState(costToEdit?.lot);
  const [lotSize, setLotSize] = useState(costToEdit?.lotSize);
  const [dress, setDress] = useState(costToEdit?.dress);
  const [date, setDate] = useState(costToEdit && formatDate(costToEdit.date));
  const [note, setNote] = useState(costToEdit?.note);
  const [preFill, setPreFill] = useState(() => {
    if (costToEdit) {
      let materials = [];
      if (costToEdit.materials.length > 0) {
        costToEdit.materials.forEach((item) => {
          materials.push([
            {
              ...costMaterials[0][0],
              value: item.material,
            },
            {
              ...costMaterials[0][1],
              value: item.qnt,
            },
            {
              ...costMaterials[0][2],
              value: item.price,
            },
          ]);
        });
      }
      materials.push(...costMaterials);
      return {
        ...costToEdit,
        materials: [...materials],
      };
    } else {
      return null;
    }
  });
  const submit = (e) => {
    e.preventDefault();
    const materials = GetGroupData($(".modal #materials"));
    if (materials.length < 1) return;
    setLoading(true);
    fetch("/api/costings", {
      method: costToEdit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(preFill && { _id: costToEdit._id }),
        date,
        fy,
        lot,
        lotSize,
        dress,
        materials,
        note,
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
    <form className={`${s.form} ${s.costing}`} onSubmit={submit}>
      <h2>Add Costing</h2>
      <Input
        type="number"
        required={true}
        defaultValue={costToEdit?.lot}
        label="Lot no"
        onChange={(t) => setLot(t.value)}
      />
      <Input
        className={s.date}
        required={true}
        defaultValue={costToEdit && formatDate(costToEdit.date)}
        type="date"
        label="Date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        className={s.dress}
        required={true}
        defaultValue={costToEdit?.dress}
        label="Dress"
        onChange={(t) => setDress(t.value)}
      />
      <Input
        type="number"
        className={s.lotSize}
        required={true}
        defaultValue={costToEdit?.lotSize}
        label="Lot size"
        onChange={(t) => setLotSize(t.value)}
      />
      <div className={s.materials}>
        <MultipleInput
          id="materials"
          inputs={preFill?.materials || costMaterials}
          refInput={costMaterials}
        />
      </div>
      <Input
        className={s.note}
        defaultValue={costToEdit?.note}
        label="Note"
        onChange={(t) => setNote(t.value)}
      />
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}

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
          inputs={preFill?.payments || matPayments}
          refInput={matPayments}
        />
      </div>
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}

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
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}

export function AddFabric({ fy, edit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(edit && formatDate(edit.date));
  const [dealer, setDealer] = useState(edit?.dealer);
  const [name, setName] = useState(edit?.name);
  const [qnt, setQnt] = useState(edit?.qnt || {});
  const [price, setPrice] = useState(edit?.price);
  const [img, setImg] = useState(edit?.img);
  const [preFill, setPreFill] = useState(() => {
    if (edit) {
      let usage = [];
      if (edit.usage.length > 0) {
        edit.usage.forEach((item) => {
          usage.push([
            {
              ...fabricUsage[0][0],
              value: item.lot,
            },
            {
              ...fabricUsage[0][1],
              value: item.qnt.amount,
            },
            {
              ...fabricUsage[0][2],
              value: item.qnt.unit,
            },
          ]);
        });
      }
      usage.push(...fabricUsage);
      return {
        ...edit,
        fabricUsage: [...usage],
      };
    } else {
      return null;
    }
  });
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/fabrics", {
      method: edit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(edit && { _id: edit._id }),
        fy,
        date,
        dealer,
        name,
        qnt,
        price,
        usage: GetGroupData($(".modal #fabricUsage")).map((item) => ({
          lot: item.lotNo,
          qnt: {
            amount: item.qnt,
            unit: item.unit,
          },
        })),
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
    <form className={`${s.form} ${s.fabric}`} onSubmit={submit}>
      <h2>Add Fabric</h2>
      <Input
        defaultValue={edit && formatDate(edit?.date)}
        required={true}
        label="Date"
        type="date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        defaultValue={edit?.dealer}
        required={true}
        label="Dealer"
        onChange={(t) => setDealer(t.value)}
      />
      <Input
        defaultValue={edit?.name}
        required={true}
        label="Fabric"
        onChange={(t) => setName(t.value)}
      />
      <div className={s.fabricDetail}>
        <Input
          defaultValue={edit?.qnt.amount}
          required={true}
          label="Qnt"
          value={qnt.amount}
          type="number"
          onChange={(t) => setQnt((prev) => ({ ...prev, amount: +t.value }))}
        />
        <Combobox
          label="Unit"
          defaultValue={edit?.qnt.unit || qnt.unit}
          options={[
            { label: "Meter", value: "meter" },
            { label: "Yard", value: "yard" },
          ]}
          required={true}
          onChange={(option) => {
            setQnt((prev) => {
              return {
                unit: option.value,
                amount: convertUnit(prev.amount, prev.unit, option.value),
              };
            });
          }}
        />
        <Input
          defaultValue={edit?.price}
          required={true}
          label="Price"
          type="number"
          onChange={(t) => setPrice(+t.value)}
        />
      </div>
      <h3>Usage</h3>
      <div className={s.fabricUsage}>
        <MultipleInput
          id="fabricUsage"
          inputs={preFill?.fabricUsage || fabricUsage}
          refInput={fabricUsage}
        />
      </div>
      <Submit
        loading={loading}
        label={<ion-icon name="add-outline"></ion-icon>}
      />
    </form>
  );
}
