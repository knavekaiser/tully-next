import { useState } from "react";
import {
  Input,
  ImgUpload,
  uploadImg,
  Submit,
  MultipleInput,
  GetGroupData,
  Combobox,
  formatDate,
  $,
  convertUnit,
} from "@/components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

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

export function AddFabric({ fy, edit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(edit && formatDate(edit.date));
  const [dealer, setDealer] = useState(edit?.dealer);
  const [name, setName] = useState(edit?.name);
  const [qnt, setQnt] = useState(edit?.qnt || {});
  const [price, setPrice] = useState(edit?.price);
  const [img, setImg] = useState(edit?.img || "");
  const [preFill, setPreFill] = useState(() => {
    if (edit) {
      let usage = [];
      if (edit.usage.length > 0) {
        edit.usage.forEach((item) => {
          usage.push([
            {
              ...fabricUsage[0][0],
              value: item.lot.lot || item.lot,
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
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
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
    };
    if (edit) {
      if (img.startsWith("data:image/")) {
        formData.img = { new: await uploadImg(img), old: edit.img };
      } else {
        formData.img =
          edit.img === img ? { new: img, old: "" } : { new: "", old: edit.img };
      }
    } else {
      if (img.startsWith("data:image/")) {
        formData.img = await uploadImg(img);
      } else {
        formData.img = "";
      }
    }
    fetch("/api/fabrics", {
      method: edit ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formData),
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
        setLoading(false);
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
      <ImgUpload
        label="Image"
        height="5rem"
        defaultValue={img}
        onChange={(_img) => setImg(_img)}
      />
      <h3>Usage</h3>
      <div className={s.fabricUsage}>
        <MultipleInput
          inputs={preFill?.fabricUsage || fabricUsage}
          className={s.multipleInput}
          refInput={fabricUsage}
        />
      </div>
      <Submit loading={loading} label={<IoAddOutline />} />
      <div className={s.pBtm} />
    </form>
  );
}
