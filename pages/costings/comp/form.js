import { useState, useRef } from "react";
import {
  Input,
  ImgUpload,
  uploadImg,
  Submit,
  MultipleInput,
  GetGroupDataWithEmptyField,
  formatDate,
  $,
} from "@/components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

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
const defaultCostMaterials = ["লিনেন", "কটন", "নেট", "মশারী", "জিপার"];

export function CostingForm({ fy, defaultLot, edit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [lot, setLot] = useState(edit?.lot || +defaultLot + 1 || "");
  const [lotSize, setLotSize] = useState(edit?.lotSize);
  const [dress, setDress] = useState(edit?.dress);
  const [date, setDate] = useState(
    edit ? formatDate(edit.date) : formatDate(new Date())
  );
  const [note, setNote] = useState(edit?.note);
  const [img, setImg] = useState(edit?.img || "");
  const [preFill, setPreFill] = useState(() => {
    if (edit) {
      let materials = [];
      if (edit.materials.length > 0) {
        edit.materials.forEach((item) => {
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
        ...edit,
        materials: [...materials],
      };
    } else {
      return null;
    }
  });
  const defaultMaterials = useRef([
    ...costMaterials,
    ...defaultCostMaterials.map((item) => [
      {
        id: "material",
        type: "text",
        label: "Material",
        clone: true,
        value: item,
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
    ]),
  ]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const materials = GetGroupDataWithEmptyField($(".modal #materials"));
    const formData = {
      ...(preFill && edit?._id && { _id: edit._id }),
      date,
      fy,
      lot,
      lotSize,
      dress,
      materials,
      note,
    };
    if (edit?._id) {
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
    if (materials.length < 1) return;
    fetch("/api/costings", {
      method: edit?._id ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        console.log(data);
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
    <form className={`${s.form}`} onSubmit={submit}>
      <h2>Add Costing</h2>
      <Input
        type="number"
        required={true}
        defaultValue={lot}
        label="Lot no"
        onChange={(t) => setLot(t.value)}
      />
      <Input
        className={s.date}
        required={true}
        defaultValue={date}
        type="date"
        label="Date"
        onChange={(t) => setDate(t.value)}
      />
      <Input
        className={s.dress}
        required={true}
        defaultValue={edit?.dress}
        label="Dress"
        onChange={(t) => setDress(t.value)}
      />
      <Input
        type="number"
        className={s.lotSize}
        required={true}
        defaultValue={edit?.lotSize}
        label="Lot size"
        onChange={(t) => setLotSize(t.value)}
      />
      <ImgUpload
        defaultValue={edit?.img}
        label="Image"
        className={s.imgUpload}
        height="5rem"
        onChange={(_img) => setImg(_img)}
      />
      <div className={s.materials}>
        <MultipleInput
          id="materials"
          inputs={
            preFill?.materials ||
            // costMaterials
            defaultMaterials.current
          }
          className={s.multipleInput}
          refInput={costMaterials}
        />
      </div>
      <Input
        className={s.note}
        defaultValue={edit?.note}
        label="Note"
        onChange={(t) => setNote(t.value)}
      />
      <Submit loading={loading} label={<IoAddOutline />} />
      <div className={s.pBtm} />
    </form>
  );
}
