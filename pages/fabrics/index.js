import { useEffect, useState, useContext, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr, LoadingTr } from "../../components/Table";
import {
  AddBtn,
  displayDate,
  convertUnit,
  SS,
} from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { AddFabric } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Fabrics() {
  const router = useRouter();
  const { fy, user, dateFilter, setMonths, setNameTag } = useContext(
    SiteContext
  );
  const { error, data } = useSWR(
    `/api/fabrics?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [fabrics, setFabrics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const dltFabric = (_id) => {
    if (confirm("you want to delete this Fabric?")) {
      fetch("/api/fabrics", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setFabrics((prev) => prev.filter((item) => item._id !== _id));
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
    if (data?.fabrics) {
      setFabrics(data.fabrics);
      setMonths(data.months);
    }
  }, [data]);
  useEffect(() => !showForm && setEdit(null), [showForm]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Fabrics");
    }
  }, []);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <ion-icon name="lock-closed-outline"></ion-icon>
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  if (!fabrics) {
    return (
      <App>
        <Table
          columns={[
            { label: "Date", className: s.date },
            { label: "Fabric", className: s.fabric },
            { label: "Usage", className: s.usage },
          ]}
          className={s.fabrics}
          onScroll={(dir) => {
            if (dir === "down") {
              setAddBtnStyle(true);
            } else {
              setAddBtnStyle(false);
            }
          }}
        >
          <LoadingTr number={3} />
        </Table>
      </App>
    );
  }
  return (
    <App>
      <Table
        columns={[
          { label: "Date", className: s.date },
          { label: "Fabric", className: s.fabric },
          { label: "Usage", className: s.usage },
        ]}
        className={s.fabrics}
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {fabrics.length > 0 ? (
          fabrics.map((fabric, i) => (
            <Tr
              key={i}
              options={[
                {
                  label: "Edit",
                  fun: () => {
                    setEdit(fabric);
                    setShowForm(true);
                  },
                },
                {
                  label: "Delete",
                  fun: () => dltFabric(fabric._id),
                },
              ]}
              onClick={() => {
                router.push(`/fabrics/${fabric._id}`);
                SS.set("singleFabric", JSON.stringify(fabric));
              }}
            >
              <td className={s.date}>
                {displayDate(fabric.date)}
                <span>{fabric.dealer}</span>
              </td>
              <td className={s.fabric}>
                {fabric.name}
                <span>
                  {fabric.qnt.amount}
                  {fabric.qnt.unit.substr(0, 1)} • ৳ {fabric.price}
                </span>
              </td>
              {fabric.usage.length > 0 ? (
                <td className={s.usage}>
                  {convertUnit(
                    fabric.usage.reduce(
                      (p, c) =>
                        p +
                        convertUnit(c.qnt.amount, c.qnt.unit, fabric.qnt.unit),
                      0
                    ),
                    fabric.qnt.unit,
                    "yard"
                  )}
                  yd/{fabric.usage.length} lots
                  <span>
                    Remaining{" "}
                    {convertUnit(
                      fabric.qnt.amount -
                        fabric.usage.reduce(
                          (p, c) =>
                            p +
                            convertUnit(
                              c.qnt.amount,
                              c.qnt.unit,
                              fabric.qnt.unit
                            ),
                          0
                        ),
                      fabric.qnt.unit,
                      "yard"
                    ).toLocaleString("en-IN")}{" "}
                    yd
                  </span>
                </td>
              ) : (
                <td className={s.usage}>
                  Remaining{" "}
                  {convertUnit(fabric.qnt.amount, fabric.qnt.unit, "yard")} yd
                </td>
              )}
            </Tr>
          ))
        ) : (
          <tr>
            <td>- Nothing much -</td>
          </tr>
        )}
      </Table>
      {fy !== "all" && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
      <Modal open={showForm} setOpen={setShowForm}>
        <AddFabric
          fy={fy}
          edit={edit}
          onSuccess={(newCosting) => {
            setFabrics((prev) => {
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
