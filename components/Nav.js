import { useContext, useState, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import s from "./SCSS/Nav.module.scss";
import { useRouter } from "next/router";
import { Modal } from "./Modals";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Input, Submit } from "./FormElements";

function DateFilter({ onSubmit }) {
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

export default function Nav({ sidebarOpen, setSidebarOpen }) {
  const { user, months, setDateFilter, dateFilter, nameTag } =
    useContext(SiteContext);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [backBtn, setBackBtn] = useState(false);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  useEffect(() => {
    if (
      [
        "/",
        "/bills",
        "/costings",
        "/productions",
        "/wages",
        "/workers",
        "/lots",
        "/fabrics",
        "/employees",
        "/config",
        "/transactions/wages",
        "/transactions/productions",
      ].includes(router.pathname)
    ) {
      setBackBtn(false);
      setShowMonthFilter(true);
    } else {
      setBackBtn(true);
      setShowMonthFilter(false);
    }
  }, [router]);
  return (
    <header className={s.header}>
      <span className={s.gred + ` gred`} />
      <Link href={user?.role === "admin" ? "/" : "/employees"}>
        <div>
          <AnimatePresence>
            {nameTag ? (
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                {nameTag}
              </motion.h1>
            ) : (
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                WORKPLACE
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </Link>
      <div
        className={`${s.btn_sidebar} ${backBtn ? s.back : ""} ${
          sidebarOpen ? s.side_back : ""
        }`}
        onClick={() => {
          if (backBtn) {
            router.back();
          } else {
            setSidebarOpen((prev) => !prev);
          }
        }}
        type="button"
        name="button"
      >
        <div className={s.line}>
          <div className={s.before}></div>
          <div className={s.after}></div>
        </div>
      </div>
      {showMonthFilter && (
        <select
          className={s.month_filter}
          value={dateFilter?.label || "all"}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "all") {
              setDateFilter(null);
            } else if (value === "custom") {
              setShowForm(true);
            } else {
              setDateFilter({
                label: value,
                from: `${value}-01`,
                to: `${value}-${new Date(
                  new Date(`${value}`).getFullYear(),
                  new Date(`${value}`).getMonth() + 1,
                  0
                ).getDate()}`,
              });
            }
          }}
        >
          <option value="all">All</option>
          <option value="custom">Custom</option>
          {months.map((month, i) => (
            <option key={i} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      )}
      {showForm && (
        <Modal open={showForm} setOpen={setShowForm}>
          <DateFilter
            onSubmit={(from, to) => {
              setDateFilter({ label: "custom", from, to });
              setShowForm(false);
            }}
          />
        </Modal>
      )}
      <select className={s.year_filter} name="">
        <option value="2019">2019</option>
        <option value="2020">2020</option>
        <option value="2021">2021</option>
      </select>
    </header>
  );
}
