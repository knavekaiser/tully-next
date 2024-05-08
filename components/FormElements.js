import { useEffect, useState, useRef, useLayoutEffect } from "react";
import Img from "next/image";
import s from "./SCSS/FormElements.module.scss";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoAddOutline,
  IoReload,
} from "react-icons/io5";

export function convertUnit(value, curr, target) {
  const con = {
    meter2yard: (n) => n * 1.0936132983377078,
    yard2meter: (n) => n * 0.9144,
  };
  return curr !== target
    ? +con[`${curr}2${target}`]?.(value).toFixed(2) || +value.toFixed(2)
    : +value.toFixed(2);
}

const defaultValidation = /./;

export const uploadImg = (img) => {
  const formData = new FormData();
  formData.append("file", img);
  formData.append("upload_preset", "dxrnr2ha");
  return new Promise((resolve, reject) => {
    fetch("https://api.cloudinary.com/v1_1/knave-kaiser-lab-works/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => resolve(data.secure_url));
  }).catch((err) => reject(err));
};
export const ID = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  result += characters.charAt(
    Math.floor(Math.random() * charactersLength - 10)
  );
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
export const formatDate = (raw) => {
  if (!raw) return "";
  const date = new Date(raw);
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
};
export const displayDate = (raw) => {
  if (!raw) return "";
  const date = new Date(raw);
  return `${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}-${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }-${date.getFullYear().toString().substr(2)}`;
};
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);
export const SS = {
  set: (key, value) => sessionStorage.setItem(key, value),
  get: (key) => sessionStorage.getItem(key) || "",
  remove: (key) => sessionStorage.removeItem(key),
};
export const Input = ({
  id,
  dataId,
  label,
  type,
  defaultValue,
  value,
  pattern,
  strict,
  warning,
  required,
  onChange,
  disabled,
  max,
  min,
  children,
  placeholder,
  className,
  validationMessage,
  autoFocus,
  name,
  autoComplete,
}) => {
  const [localValue, setValue] = useState(defaultValue || value);
  const [showLabel, setShowLabel] = useState(!defaultValue);
  const [invalidChar, setInvalidChar] = useState(false);
  const [invalidInput, setInvalidInput] = useState(false);
  const changeHandler = (e) => {
    e.target.setCustomValidity("");
    setInvalidInput(false);
    const regex = strict || defaultValidation;
    if (e.target.value === "" || regex.exec(e.target.value) !== null) {
      setValue(e.target.value);
      onChange && onChange(e.target);
    } else {
      if (!invalidChar) {
        setInvalidChar(true);
        setTimeout(() => setInvalidChar(false), 2000);
      }
    }
  };
  const focus = () => setShowLabel(false);
  const blur = () => !localValue && setShowLabel(true);
  useEffect(() => {
    value && setValue(value);
  }, [value]);
  return (
    <section
      id={dataId}
      className={`${s.input} ${className || ""} ${
        invalidChar ? s.invalid : ""
      } ${disabled ? s.disabled : ""} ${
        type === "date" && !localValue ? s.empty : ""
      }`}
    >
      <input
        autoFocus={autoFocus}
        onInvalid={(e) => {
          e.target.setCustomValidity(" ");
          setInvalidInput(true);
        }}
        name={name}
        minLength={min}
        value={localValue || ""}
        required={required}
        type={type || "text"}
        onChange={changeHandler}
        onFocus={focus}
        onBlur={blur}
        maxLength={max || 100}
        id={id}
        disabled={disabled}
        placeholder={placeholder || label}
        pattern={pattern}
        autoComplete={autoComplete}
      />
      <label className={`${s.label} ${showLabel ? s.active : ""}`}>
        {invalidChar ? (warning ? warning : "অকার্যকর অক্ষর!") : label}
      </label>
      {children}
      {invalidInput && <p className={s.fieldWarning}>{validationMessage}</p>}
    </section>
  );
};
export const PasswordInput = ({
  className,
  label,
  dataId,
  passwordStrength,
  placeholder,
  onChange,
  defaultValue,
  validationMessage,
  id,
  pattern,
  children,
  name,
  autoComplete,
}) => {
  const [showPass, setShowPass] = useState(false);
  const [passValidation, setPassValidation] = useState("Enter password");
  function change(target) {
    onChange && onChange(target);
  }
  function handleIconClick(e) {
    setShowPass(!showPass);
    e.target.parentElement.parentElement.querySelector("input")?.focus();
  }
  return (
    <Input
      className={s.passInput + " " + className}
      id={id}
      defaultValue={defaultValue}
      strict={/./}
      pattern={pattern}
      min={8}
      dataId={dataId}
      type={showPass ? "text" : "password"}
      required={true}
      label={label}
      max={32}
      onChange={change}
      placeholder={placeholder}
      validationMessage={validationMessage}
      name={name}
      autoComplete={autoComplete}
    >
      {showPass ? (
        <span onClick={handleIconClick}>
          <IoEyeOutline />
        </span>
      ) : (
        <span onClick={handleIconClick}>
          <IoEyeOffOutline />
        </span>
      )}
      {children}
    </Input>
  );
};
export const Submit = ({ disabled, className, label, loading, onClick }) => {
  return (
    <button
      className={`${s.submit} ${s[className]} ${loading ? s.loading : ""}`}
      type="submit"
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && (
        <div className="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      {loading ? <IoReload /> : label}
    </button>
  );
};

export const ImgUpload = ({
  defaultValue,
  label,
  height,
  required,
  onChange,
  className,
}) => {
  const [file, setFile] = useState(defaultValue);
  const handleChange = (e) => {
    if (!e.target.files[0]) {
      setFile(defaultValue);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onloadend = () => {
      setFile(reader.result);
      onChange(reader.result);
    };
  };
  return (
    <section
      className={`${s.upload} ${className || ""}`}
      style={{ height: height || "4rem" }}
    >
      <input
        required={required}
        id="img"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
      <label htmlFor="img">{label}</label>
      {file && (
        <div className={s.preview}>
          <span
            className={s.close}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setFile("");
            }}
          >
            <IoCloseOutline />
          </span>
          <Img src={file} alt="chosen" layout="fill" />
        </div>
      )}
    </section>
  );
};

export const GetGroupData = (multipleInput) => {
  const allData = [];
  for (var i = 0; i < multipleInput.children.length; i++) {
    const group = multipleInput.children[i];
    const data = {};
    for (var j = 0; j < group.children.length; j++) {
      const section = group.children[j];
      const input = section.querySelector("input");
      if (input.value === "") {
        continue;
      } else {
        const num = +input.value;
        data[section.id] = isNaN(num)
          ? input.getAttribute("data")
            ? JSON.parse(input.getAttribute("data"))
            : input.value?.trim()
          : num;
      }
    }
    Object.keys(data).length === group.children.length && allData.push(data);
  }
  return allData;
};
export const GetGroupDataWithEmptyField = (multipleInput) => {
  const allData = [];
  for (var i = 0; i < multipleInput.children.length; i++) {
    const group = multipleInput.children[i];
    const data = {};
    for (var j = 0; j < group.children.length; j++) {
      const section = group.children[j];
      const input = section.querySelector("input");
      if (input.value === "") {
        data[section.id] = "";
        continue;
      } else {
        const num = +input.value;
        data[section.id] = isNaN(num)
          ? input.getAttribute("data")
            ? JSON.parse(input.getAttribute("data"))
            : input.value?.trim()
          : num;
      }
    }
    Object.values(data).filter((value) => value).length > 0 &&
      allData.push(data);
  }
  return allData;
};

export const MultipleInput = ({ inputs, refInput, id }) => {
  const [groupCount, setGroupCount] = useState([]);
  useEffect(() => {
    if (inputs[0].value) {
      setGroupCount([]);
    }
  }, [inputs]);
  useEffect(() => {}, [groupCount]);
  function clone(target) {
    setGroupCount((prev) => {
      const newGroup = [...prev];
      let current = 0;
      newGroup.some((item, i) => {
        if (item.split(":")[0] === target.id) {
          newGroup.splice(i, 1);
          current = i;
        }
      });
      newGroup.splice(current, 0, `${target.id}:${target.value}`);
      const currentValue = newGroup[current].split(":")[1];
      const nextGroup = newGroup[current + 1];
      const emptyGroup = newGroup.filter((item) => !item.split(":")[1]);
      if (currentValue.length && !emptyGroup.length) {
        setFinal((prev) => {
          const newFinal = [...prev];
          newFinal.push(
            <Group
              id={ID(8)}
              key={ID(8)}
              inputs={refInput[0]}
              clone={clone}
              groupCount={groupCount}
              setGroupCount={setGroupCount}
            />
          );
          return newFinal;
        });
      } else if (currentValue.length === 0) {
        if (target.maxLength === 100) {
          setFinal((prev) => {
            const newRef = [];
            newGroup.forEach((item, i) => {
              if (!!item.split(":")[1] || target.id === item.split(":")[0]) {
                newRef.push(prev[i]);
              }
            });
            return newRef;
          });
        }
      }
      return newGroup;
    });
  }
  const [final, setFinal] = useState([]);
  function handleInputChange() {
    setFinal(
      inputs.map((input) => {
        return (
          <Group
            id={ID(8)}
            key={ID(8)}
            inputs={input}
            clone={clone}
            groupCount={groupCount}
            setGroupCount={setGroupCount}
          />
        );
      })
    );
  }
  useEffect(handleInputChange, [inputs]);
  return (
    <div id={id} className={s.multipleInput}>
      {final}
    </div>
  );
};
const Group = ({ id, inputs, clone, setGroupCount }) => {
  const [value, setValue] = useState("");
  function handleMount() {
    setGroupCount((prev) => {
      const newGroup = [...prev];
      newGroup.push(`${id}:${inputs[0].value || ""}`);
      return newGroup;
    });
    return () => {
      setGroupCount((prev) => {
        return prev.filter((item) => item.split(":")[0] !== id);
      });
    };
  }
  useEffect(handleMount, []);
  return (
    <div className={s.group}>
      {inputs.map((input, i) => {
        if (input.type === "combobox") {
          return (
            <Combobox
              label={input.label}
              dataId={input.id}
              key={input.id}
              defaultValue={input.value}
              options={input.options}
              // required={!input.clone}
              disabled={
                false
                // input.clone ? false : input.value ? false : value === ""
              }
              onChange={(target) => {
                clone(target);
                input.clone && setValue(target.value);
              }}
              id={input.clone ? id : id + i}
            />
          );
        }
        return (
          <Input
            type={input.type}
            dataId={input.id}
            key={input.id}
            defaultValue={input.value}
            // required={!input.clone}
            max={input.clone ? 100 : 12}
            label={input.label}
            id={input.clone ? id : id + i}
            onChange={(target) => {
              clone(target);
              input.clone && setValue(target.value);
            }}
            disabled={
              false
              // input.clone ? false : input.value ? false : value === ""
            }
          />
        );
      })}
    </div>
  );
};

export const MultipleInput2 = ({ inputs, refInput, id }) => {
  const [groupInputs, setGroupInputs] = useState(inputs);
  return (
    <div id={id} className={s.multipleInput}>
      {groupInputs?.map((item, i) => (
        <Group
          key={i}
          inputs={item}
          clone={(values) => {
            const cleanGroup = inputs[inputs.length - 1];
            console.log(values, cleanGroup);
            // setGroupInputs((prev) => [...prev, cleanGroup]);
          }}
        />
      ))}
    </div>
  );
};
const Group2 = ({ id, inputs, clone, setGroupCount }) => {
  const [value, setValue] = useState("");
  const [values, setValues] = useState({});
  // useEffect(() => {
  //   setGroupCount((prev) => {
  //     const newGroup = [...prev];
  //     newGroup.push(`${id}:${inputs[0].value || ""}`);
  //     return newGroup;
  //   });
  //   return () => {
  //     setGroupCount((prev) => {
  //       return prev.filter((item) => item.split(":")[0] !== id);
  //     });
  //   };
  // }, []);
  useEffect(() => {
    clone(values);
  }, [values]);
  return (
    <div className={s.group}>
      {inputs.map((input, i) => {
        if (input.type === "combobox") {
          return (
            <Combobox
              label={input.label}
              dataId={input.id}
              key={input.id}
              defaultValue={input.value}
              options={input.options}
              // required={!input.clone}
              disabled={
                false
                // input.clone ? false : input.value ? false : value === ""
              }
              onChange={(target) => {
                setValues((prev) => {
                  const newValues = { ...prev };
                  newValues[input.label] = target.value;
                  return newValues;
                });
                // clone(values);
                // input.clone && setValue(target.value);
              }}
              // id={input.clone ? id : id + i}
            />
          );
        }
        return (
          <Input
            type={input.type}
            dataId={input.id}
            key={input.id}
            defaultValue={input.value}
            // required={!input.clone}
            max={input.clone ? 100 : 12}
            label={input.label}
            // id={input.clone ? id : id + i}
            onChange={(target) => {
              setValues((prev) => {
                const newValues = { ...prev };
                newValues[input.label] = target.value;
                return newValues;
              });
              // clone(values);
              // input.clone && setValue(target.value);
            }}
            disabled={
              false
              // input.clone ? false : input.value ? false : value === ""
            }
          />
        );
      })}
    </div>
  );
};

export const OutsideClick = ({
  id,
  className,
  style,
  children,
  setOpen,
  open,
}) => {
  return (
    <section className={className} style={style} id={id}>
      {open && (
        <div
          className={s.backdrop}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        />
      )}
      {children}
    </section>
  );
};

export const Combobox = ({
  label,
  icon,
  options,
  defaultValue,
  onChange,
  maxHeight,
  required,
  disabled,
  dataId,
  validationMessage,
}) => {
  const [value, setValue] = useState(() => {
    if (options[defaultValue]) {
      return options[defaultValue];
    } else if (typeof defaultValue === "object") {
      return defaultValue;
    } else if (typeof defaultValue === "string") {
      return options.filter((item) => item.value === defaultValue)[0];
    } else {
      return "";
    }
  });
  const [invalidInput, setInvalidInput] = useState(false);
  const [open, setOpen] = useState(false);
  const input = useRef();
  const ul = useRef();
  useLayoutEffect(() => {
    const { bottom } = input.current.getBoundingClientRect();
    if (bottom + maxHeight > window.innerHeight) {
      ul.current.style.top = `${window.innerHeight - (bottom + maxHeight)}px`;
    } else {
      ul.current.style.removeProperty("top");
    }
  });
  return (
    <OutsideClick
      className={`${s.combobox} ${disabled ? s.disabled : ""}`}
      setOpen={setOpen}
      open={open}
      style={{ position: "relative" }}
      id={dataId ? dataId : ""}
    >
      <input
        onClick={() => setOpen(!open)}
        placeholder={label}
        ref={input}
        required={required}
        data={JSON.stringify(value.value)}
        value={value.label || ""}
        onFocus={(e) => e.target.blur()}
        onInvalid={(e) => {
          setInvalidInput(true);
          e.target.setCustomValidity(" ");
        }}
        onChange={() => {}}
        disabled={disabled}
      />
      <label className={`${s.label} ${value === "" ? s.active : ""}`}>
        {label}
      </label>
      {invalidInput && <p className={s.fieldWarning}>{validationMessage}</p>}
      {icon || null}
      <ul
        ref={ul}
        style={{
          width: "100%",
          position: "absolute",
          maxHeight: open ? maxHeight : 0,
          zIndex: 100,
          overflow: "auto",
        }}
        className={s.options}
      >
        {options.map((option) => (
          <li
            key={option.label}
            onClick={(e) => {
              setValue(option);
              onChange && onChange(option);
              setOpen(false);
              setInvalidInput(false);
              input.current.setCustomValidity("");
            }}
            className={`${s.option} ${
              (value.label || value) === option.label ? s.selected : ""
            }`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </OutsideClick>
  );
};

export const AddBtn = ({ translate, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${s.addBtn} ${translate && s.hidden}`}
    >
      <IoAddOutline />
    </button>
  );
};
