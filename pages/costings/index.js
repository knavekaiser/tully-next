import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr } from "../../components/Table";
import { AddBtn } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { CostingForm } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  let costings = [];
  let user = {};
  let months = [];
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    costings = await Costing.find(filters).sort({ ref: 1 });
    months = await Costing.aggregate([
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
      ssrData: json(costings),
      ssrUser: json(user),
      ssrMonths: json(months),
    },
  };
}

export default function Costings({ ssrData, ssrUser, ssrMonths }) {
  const router = useRouter();
  const { fy, dateFilter, setUser, setMonths } = useContext(SiteContext);
  const [costings, setCostings] = useState(ssrData);
  const [showForm, setShowForm] = useState(false);
  const [costToEdit, setCostToEdit] = useState(null);
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
  useEffect(() => setUser(ssrUser), []);
  useEffect(() => setMonths(ssrMonths), [ssrMonths]);
  useEffect(() => setCostings(ssrData), [ssrData]);
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
  useEffect(() => !showForm && setCostToEdit(null), [showForm]);
  return (
    <App>
      <Table
        columns={[
          { label: "Lot", className: s.lot },
          { label: "note", className: s.note },
          { label: "dress", className: s.dress },
          { label: "lot size" },
          { label: "cost" },
        ]}
        className={s.costings}
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
            onClick={() => router.push(`/costings/${costing.lot}`)}
          >
            <td className={s.lot}>{costing.lot}</td>
            <td className={s.note}>{costing.note}</td>
            <td className={s.dress}>{costing.dress}</td>
            <td>{costing.lotSize}</td>
            <td>
              {Math.ceil(
                costing.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
                  costing.lotSize
              )}
            </td>
          </Tr>
        ))}
      </Table>
      {fy !== "all" && <AddBtn onClick={setShowForm} />}
      <Modal open={showForm} setOpen={setShowForm}>
        <CostingForm
          fy={fy}
          costToEdit={costToEdit}
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
