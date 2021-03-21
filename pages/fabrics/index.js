import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr } from "../../components/Table";
import {
  AddBtn,
  displayDate,
  convertUnit,
} from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { AddFabric } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json, getMonths } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [user, fabrics, months] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Fabric.find(filters).sort({ date: 1 }),
      getMonths(Fabric, fy),
    ]);
    return {
      props: {
        ssrData: json(fabrics),
        ssrUser: json(user),
        ssrMonths: json(months),
      },
    };
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
}

export default function Fabrics({ ssrData, ssrUser, ssrMonths }) {
  const router = useRouter();
  const { fy, dateFilter, setUser, setMonths } = useContext(SiteContext);
  const [fabrics, setFabrics] = useState(ssrData);
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
  useEffect(() => setUser(ssrUser), []);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => setFabrics(ssrData), [ssrData]);
  useEffect(() => {
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
  // console.log(ssrData);
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
        {fabrics.map((fabric, i) => (
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
            onClick={() => router.push(`/fabrics/${fabric._id}`)}
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
            <td className={s.usage}>
              {convertUnit(
                fabric.usage.reduce(
                  (p, c) =>
                    p + convertUnit(c.qnt.amount, c.qnt.unit, fabric.qnt.unit),
                  0
                ),
                fabric.qnt.unit,
                "yard"
              )}
              yd/{fabric.usage.length} lots
              <span>
                remaining{" "}
                {convertUnit(
                  fabric.qnt.amount -
                    fabric.usage.reduce(
                      (p, c) =>
                        p +
                        convertUnit(c.qnt.amount, c.qnt.unit, fabric.qnt.unit),
                      0
                    ),
                  fabric.qnt.unit,
                  "yard"
                )}
                yd
              </span>
            </td>
          </Tr>
        ))}
      </Table>
      {fy !== "all" && <AddBtn translate={addBtnStyle} onClick={setShowForm} />}
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
