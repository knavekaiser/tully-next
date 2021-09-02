import { useEffect, useState, useContext, Fragment, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index.js";
import Table, { Tr, LoadingTr } from "../components/Table";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../components/Modals";
import { AddEmpWork } from "../components/Forms";
import s from "../components/SCSS/Table.module.scss";
import { IoLockClosedOutline } from "react-icons/io5";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Lots() {
  const router = useRouter();
  const { fy, dateFilter, user, setMonths, empRate } = useContext(SiteContext);
  const [lots, setLots] = useState(null);
  const { error, data } = useSWR(
    `/api/lots?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const dltCosting = (_id) => {
    if (confirm("you want to delete this Lot?")) {
      fetch("/api/lots", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setLots((prev) => prev.filter((item) => item._id !== _id));
          } else {
            alert("something went wrong");
          }
        })
        .catch((err) => {
          console.log(err);
          alert("something went wrong");
        });
    }
  };
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const firstRedner = useRef(true);
  useEffect(() => {
    if (firstRedner.current) {
      firstRedner.current = false;
      return;
    }
    router.push({
      pathname: router.pathname,
      query: {
        fy,
        ...(dateFilter && {
          from: dateFilter.from,
          to: dateFilter.to,
        }),
      },
    });
  }, [fy, dateFilter]);
  useEffect(() => !showForm && setEdit(null), [showForm]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, []);
  useEffect(() => {
    if (data?.lots) {
      setLots(data.lots);
      setMonths(data.months);
    }
  }, [data]);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <IoLockClosedOutline />
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  if (!lots) {
    return (
      <App>
        <Table
          columns={[
            { label: "Date" },
            { label: "Dress" },
            {
              label: (
                <>
                  Pcs<sup>G</sup>
                </>
              ),
            },
            { label: "Total" },
          ]}
          className={s.lots}
          onScroll={(dir) => {
            if (dir === "down") {
              setAddBtnStyle(true);
            } else {
              setAddBtnStyle(false);
            }
          }}
        >
          <LoadingTr number={4} />
        </Table>
      </App>
    );
  }
  return (
    <App>
      <Table
        columns={[
          { label: "Date" },
          { label: "Dress" },
          {
            label: (
              <>
                Pcs<sup>G</sup>
              </>
            ),
          },
          { label: "Total" },
        ]}
        className={s.lots}
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {lots.map((work, i) => (
          <Tr
            key={i}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setEdit(work);
                  setShowForm(true);
                },
              },
              {
                label: "Delete",
                fun: () => {
                  if (confirm("You sure you want to delete this task?")) {
                    dltWork(work._id);
                  }
                },
              },
            ]}
          >
            <td
              className={`${s.date} ${work.products.length <= 1 && s.single}`}
            >
              {displayDate(work.date)}
            </td>
            {work.products.map((product, j) => (
              <Fragment key={j}>
                <td className={s.dress}>{product.dress}</td>
                <td className={s.qnt}>
                  {product.qnt} <sup>{product.group}</sup>
                </td>
              </Fragment>
            ))}
            <td className={s.total}>
              {work.products
                .reduce((a, c) => a + c.qnt, 0)
                .toLocaleString("en-IN")}
            </td>
          </Tr>
        ))}
      </Table>
      {fy !== "all" && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
      <Modal open={showForm} setOpen={setShowForm}>
        <AddEmpWork
          fy={fy}
          workToEdit={edit}
          onSuccess={(newCosting) => {
            setLots((prev) => {
              const newCostings = prev.filter(
                (item) => item._id !== newCosting._id
              );
              newCostings.push(newCosting);
              return newCostings;
            });
            setShowForm(false);
          }}
        />
      </Modal>
    </App>
  );
}
