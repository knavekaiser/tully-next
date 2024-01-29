import { useContext, useRef, useState } from "react";
import { SiteContext } from "SiteContext";
import {
  GetGroupData,
  Input,
  MultipleInput,
  Submit,
  formatDate,
} from "@/components/FormElements";
import { IoAddOutline } from "react-icons/io5";
import s from "./style.module.scss";
import { $ } from "@/helpers";

export function LotForm({ workToEdit, onSuccess }) {
  const { groups, season } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
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
  }, []);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(`/api/lots`, {
      method: preFill ? "PATCH" : "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...(preFill && { _id: workToEdit._id }),
        date,
        season,
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
      <h2>{workToEdit ? "Edit" : "Add"} Lot</h2>
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
      <Submit loading={loading} label={<IoAddOutline />} />
      <div className={s.pBtm} />
    </form>
  );
}
