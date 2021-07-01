import { useContext, useState, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { DateFilter } from "./Forms";
import s from "./SCSS/Nav.module.scss";
import { useRouter } from "next/router";
import { Modal } from "./Modals";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav({ sidebarOpen, setSidebarOpen }) {
  const { user, months, setDateFilter, dateFilter, nameTag } = useContext(
    SiteContext
  );
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [backBtn, setBackBtn] = useState(false);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  useEffect(() => {
    if (
      router.pathname === "/" ||
      router.pathname === "/bills" ||
      router.pathname === "/costings" ||
      router.pathname === "/productions" ||
      router.pathname === "/wages" ||
      router.pathname === "/workers" ||
      router.pathname === "/lots" ||
      router.pathname === "/fabrics" ||
      router.pathname === "/employees" ||
      router.pathname === "/config"
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
        <a>
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
        </a>
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
