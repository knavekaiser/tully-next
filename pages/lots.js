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
  const { dbConnect, json } = require("../utils/db");
  dbConnect();
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  let lots = [];
  let user = {};
  let months = [];
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    lots = await Lot.find(filters).sort({ ref: 1 });
    months = await Lot.aggregate([
      {
        $match: { fy },
      },
      {
        $sort: { date: 1 },
      },
      {
        $project: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      },
      {
        $group: {
          _id: null,
          dates: { $addToSet: { year: "$year", month: "$month" } },
        },
      },
    ]).then(
      (dates) =>
        dates[0]?.dates.map((date) => {
          return {
            label: `${date.month}-${date.year}`,
            value: `${date.year}-${
              date.month < 10 ? "0" + date.month : date.month
            }`,
          };
        }) || []
    );
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(lots),
      ssrUser: json(user),
      ssrMonths: json(months),
    },
  };
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
            <td className={s.date}>{displayDate(work.date)}</td>
            {work.products.map((product, j) => (
              <Fragment key={j}>
                <td className={s.dress}>{product.dress}</td>
                <td className={s.qnt}>
                  {product.qnt} <sup>{product.group}</sup>
                </td>
                <td className={s.total}>
                  {(product.qnt * empRate[product.group]).toLocaleString(
                    "en-IN"
                  )}
                </td>
              </Fragment>
            ))}
          </Tr>
        ))}
      </Table>
      {fy !== "all" && <AddBtn onClick={setShowForm} />}
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
