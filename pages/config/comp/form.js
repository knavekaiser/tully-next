import { useState } from "react";
import { Input, Submit } from "components/FormElements";
import s from "./style.module.scss";
import { IoAddOutline } from "react-icons/io5";

export function AddSeason({ onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [seasonExists, setSeasonExists] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    fetch("/api/season", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season: name }),
    })
      .then((res) => res.json())
      .then(({ code, season }) => {
        setLoading(false);
        if (code === "ok") {
          onSuccess?.(season);
        } else if (code === 11000) {
          setSeasonExists(true);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        alert("something went wrong");
      });
  };
  return (
    <form className={`${s.form} ${s.addSeason}`} onSubmit={submit}>
      <h2>Add Season</h2>
      <Input
        required={true}
        label="Date"
        label="Season name"
        onChange={(t) => {
          setName(t.value);
          setSeasonExists(false);
        }}
      >
        {seasonExists && <p className={s.fieldWarning}>Season exists</p>}
      </Input>
      <Submit
        disabled={seasonExists}
        loading={loading}
        label={<IoAddOutline />}
      />
    </form>
  );
}

export function AddGroup({ edit, onSuccess }) {
  const [label, setLabel] = useState(edit?.label || "");
  const [value, setValue] = useState(edit?.value || "");
  const [loading, setLoading] = useState(false);
  const [groupExists, setGroupExists] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (label && value) {
      setLoading(true);
      fetch("/api/groups", {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          value,
          ...(edit && { _id: edit._id }),
        }),
      })
        .then((res) => res.json())
        .then(({ code, group }) => {
          setLoading(false);
          if (code === "ok") {
            onSuccess?.({ newGroup: group, edit: !!edit });
          } else if (code === 11000) {
            setGroupExists(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          alert("something went wrong");
        });
    }
  };
  return (
    <form className={`${s.form} ${s.addGroup}`} onSubmit={submit}>
      <h2>Add group</h2>
      <Input
        defaultValue={edit?.label}
        required={true}
        label="Date"
        label="Group label"
        onChange={(t) => {
          setLabel(t.value);
          setGroupExists(false);
        }}
      >
        {groupExists && <p className={s.fieldWarning}>Group exists</p>}
      </Input>
      <Input
        defaultValue={edit?.value}
        required={true}
        label="Date"
        label="Taka"
        type="number"
        onChange={(t) => {
          setValue(t.value);
        }}
      />
      <Submit
        disabled={groupExists}
        loading={loading}
        label={<IoAddOutline />}
      />
    </form>
  );
}
