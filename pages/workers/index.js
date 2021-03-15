import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { Tr } from "../../components/Table";
import { displayDate, AddBtn } from "../../components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "../../components/Modals";
import { AddWorker } from "../../components/Forms";
import s from "../../components/SCSS/Table.module.scss";

function calculateSalary(salary, start, end, abs) {
  const startDate = new Date(start),
    endDate = new Date(end);
  let total = 0;
  for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    !abs.includes(displayDate(d)) &&
      (total += salary / new Date(d.getYear(), d.getMonth() + 1, 0).getDate());
  }
  return Math.round(total);
}

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const token = verifyToken(ctx.req);
  let workers = [];
  let user = {};
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    workers = await Worker.find();
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(workers),
      ssrUser: json(user),
    },
  };
}

export default function Workers({ ssrData, ssrUser }) {
  const router = useRouter();
  const { setUser } = useContext(SiteContext);
  const [workers, setWorkers] = useState(ssrData);
  const [showForm, setShowForm] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState(null);
  const dltWorker = (_id) => {
    if (confirm("you want to delete this Worker?")) {
      fetch("/api/workers", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ _id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setWorkers((prev) => prev.filter((item) => item._id !== _id));
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
  useEffect(() => setWorkers(ssrData), [ssrData]);
  useEffect(() => !showForm && setWorkerToEdit(null), [showForm]);
  return (
    <App>
      <Table
        columns={[
          { label: "name", className: s.name },
          { label: "payment", className: s.payment },
        ]}
        className={s.workers}
      >
        {workers.map((worker, i) => (
          <Tr
            key={i}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setWorkerToEdit(worker);
                  setShowForm(true);
                },
              },
              {
                label: "Delete",
                fun: () => dltWorker(worker._id),
              },
            ]}
            onClick={() => router.push(`/workers/${worker.name}`)}
          >
            <td className={s.name}>{worker.name}</td>
            <td>
              {calculateSalary(
                worker.salary,
                worker.join,
                new Date(),
                []
              ).toLocaleString("en-IN")}
            </td>
          </Tr>
        ))}
      </Table>
      <AddBtn onClick={setShowForm} />
      <Modal open={showForm} setOpen={setShowForm}>
        <AddWorker
          edit={workerToEdit}
          onSuccess={(newWorker) => {
            setWorkers((prev) => {
              const newWorkers = prev.filter(
                (item) => item._id !== newWorker._id
              );
              newWorkers.push(newWorker);
              return newWorkers;
            });
            setShowForm(false);
          }}
        />
      </Modal>
    </App>
  );
}
