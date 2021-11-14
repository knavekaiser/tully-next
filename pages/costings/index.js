import { useEffect, useState, useContext, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr, LoadingTr } from "../../components/Table";
import { AddBtn, SS } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { CostingForm } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";
import { IoLockClosedOutline } from "react-icons/io5";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Costings() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } = useContext(
    SiteContext
  );
  const { error, data } = useSWR(
    `/api/costings?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [costings, setCostings] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [costToEdit, setCostToEdit] = useState(null);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const dltCosting = (_id) => {
    if (confirm("you want to delete this Costing?")) {
      fetch("/api/costings", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setCostings((prev) => prev.filter((item) => item._id !== _id));
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
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
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
  useEffect(() => {
    if (data?.costings) {
      setCostings(data.costings);
      setMonths(data.months);
    }
  }, [data]);
  useEffect(() => !showForm && setCostToEdit(null), [showForm]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Costings");
    }
  }, []);
  useEffect(() => {
    setTimeout(() => {
      Array.from(document.querySelectorAll("tbody")).forEach((el) => {
        el.scrollBy(0, 100000);
      });
    }, 50);
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
  if (!costings) {
    return (
      <App>
        <Table
          columns={[
            { label: "Lot", className: s.lot },
            { label: "dress", className: s.dress },
            { label: "lot size" },
            { label: "cost" },
          ]}
          className={s.costings}
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
          { label: "Lot", className: s.lot },
          { label: "dress", className: s.dress },
          { label: "lot size" },
          { label: "cost" },
        ]}
        className={s.costings}
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {costings.map((costing, i) => (
          <Tr
            key={i}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setCostToEdit(costing);
                  setShowForm(true);
                },
              },
              {
                label: "Delete",
                fun: () => dltCosting(costing._id),
              },
            ]}
            onClick={() => {
              router.push(`/costings/${costing.lot}`);
              SS.set("singleCosting", JSON.stringify(costing));
            }}
            className={costing.note ? s.withNote : ""}
          >
            <td className={s.lot}>
              {costing.lot.toLocaleString("en-IN").bn()}
            </td>
            <td className={s.dress}>
              {costing.dress}{" "}
              {costing.delivered && (
                <span style={{ color: "red" }}>
                  <i>
                    <small>
                      {(costing.delivered - costing.lotSize)
                        .toLocaleString("en-IN")
                        .bn()}
                    </small>
                  </i>
                </span>
              )}
            </td>
            <td className={s.lotSize}>
              {costing.lotSize.toLocaleString("en-IN").bn()}
            </td>
            <td className={s.cost}>
              {Math.ceil(
                costing.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
                  costing.lotSize
              )
                .toLocaleString("en-IN")
                .bn()}
            </td>
            {costing.note ? (
              <td className={s.note}>Note: {costing.note}</td>
            ) : (
              <></>
            )}
          </Tr>
        ))}
      </Table>
      {fy !== "all" && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
      <Modal open={showForm} setOpen={setShowForm}>
        <CostingForm
          fy={fy}
          defaultLot={costings && costings[costings.length - 1].lot}
          edit={costToEdit}
          onSuccess={(newCosting) => {
            setCostings((prev) => {
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
