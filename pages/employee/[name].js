import { useState, useEffect, useContext, Fragment, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import { Modal } from "../../components/Modals";
import Table, { Tr } from "../../components/Table";
import { AddEmpWork } from "../../components/Forms";
import { displayDate, AddBtn } from "../../components/FormElements";
import s from "../../components/SCSS/Table.module.scss";
import { useRouter } from "next/router";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const { fy, from, to } = ctx.query;
  const filters = {
    ...(fy !== "all" && { fy }),
    ...(from && to && { date: { $gte: from, $lte: to } }),
  };
  const token = verifyToken(req);
  let emp = {};
  if (token?.role === "admin") {
    emp = await Employee.findOne({ name: ctx.query.name })
      .populate({
        path: "work.work",
        match: filters,
      })
      .then((emp) => {
        return {
          ...json(emp),
          work: emp.work
            .map((item) => item.work)
            .filter((item) => !!item)
            .sort((a, b) => a.date - b.date),
        };
      });
  } else if (token?.role === "viwer") {
    const user = await Employee.findById(token.sub);
    console.log(user, ctx.query);
    if (user.name === ctx.query.name) {
      emp = await Employee.findOne({ _id: token.sub })
        .populate({
          path: "work.work",
          match: filters,
        })
        .then((emp) => {
          return {
            ...json(emp),
            work: emp.work
              .map((item) => item.work)
              .filter((item) => !!item)
              .sort((a, b) => a.date - b.date),
          };
        });
    } else {
      return {
        redirect: {
          destination: "/",
        },
      };
    }
  }
  return { props: { empSsr: json(emp) } };
}

export default function EmpWorkList({ empSsr }) {
  const router = useRouter();
  const [emp, setEmp] = useState(empSsr);
  const { user, fy, empRate, dateFilter, setDateFilter } = useContext(
    SiteContext
  );
  const [showForm, setShowForm] = useState(false);
  const [workToEdit, setWorkToEdit] = useState(null);
  const dltWork = (_id) => {
    fetch("/api/empWork", {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ _id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setEmp((prev) => {
            const newEmp = {
              ...prev,
              work: prev.work.filter((item) => item._id !== _id),
            };
            return newEmp;
          });
        } else {
          alert("something went wrong");
        }
      })
      .catch((err) => {
        alert("something went wrong");
        console.log(err);
      });
  };
  const firstRender = useRef(true);
  useEffect(() => !showForm && setWorkToEdit(null), [showForm]);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    router.push({
      pathname: router.asPath.split("?")[0],
      query: {
        fy,
        ...(dateFilter && {
          from: dateFilter.from,
          to: dateFilter.to,
        }),
      },
    });
  }, [dateFilter]);
  useEffect(() => {
    if (router.query.from && router.query.to) {
      setDateFilter((prev) => {
        return {
          label: prev?.label || "custom",
          from: router.query.from,
          to: router.query.to,
        };
      });
    }
  }, []);
  useEffect(() => {
    setEmp(empSsr);
  }, [empSsr]);
  return (
    <App>
      <Table
        className={s.empWork}
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
          { label: "Paid" },
        ]}
      >
        {emp.work?.map((work, i) => (
          <Tr
            key={i}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setWorkToEdit(work);
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
            <td className={s.paid}>{work.paid.toLocaleString("en-IN")}</td>
          </Tr>
        ))}
      </Table>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddEmpWork
          employee={emp._id}
          fy={fy}
          onSuccess={(newWork) => {
            setEmp((prev) => {
              const newEmp = { ...prev };
              newEmp.work = newEmp.work.filter(
                (item) => item._id !== newWork._id
              );
              newEmp.work.push(newWork);
              return newEmp;
            });
            setShowForm(false);
          }}
          workToEdit={workToEdit}
        />
      </Modal>
      {fy !== "all" && !user?.work && <AddBtn onClick={setShowForm} />}
    </App>
  );
}
