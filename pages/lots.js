import { useEffect, useState, useContext, Fragment } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index.js";
import Table, { Tr } from "../components/Table";
import { displayDate, AddBtn } from "../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../components/Modals";
import { AddEmpWork } from "../components/Forms";
import s from "../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json, getMonths } = require("../utils/db");
  dbConnect();
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [user, lots, months] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Lot.find(filters).sort({ ref: 1 }),
      getMonths(Lot, fy),
    ]);
    return {
      props: {
        ssrUser: json(user),
        ssrData: json(lots),
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

export default function Lots({ ssrData, ssrUser, ssrMonths }) {
  const router = useRouter();
  const { fy, dateFilter, setUser, setMonths, empRate } = useContext(
    SiteContext
  );
  const [lots, setLots] = useState(ssrData);
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
  useEffect(() => setUser(ssrUser), []);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => setLots(ssrData), [ssrData]);
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
      {fy !== "all" && <AddBtn translate={addBtnStyle} onClick={setShowForm} />}
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
