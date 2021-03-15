import { useEffect, useContext, useState } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, AddBtn } from "../../components/FormElements";
import { WorkerForm } from "../../components/Forms";
import { Modal } from "../../components/Modals";
import s from "../../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const token = verifyToken(req);
  let worker = {};
  let user = {};
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    worker = await Worker.findOne({ name: ctx.query.name });
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(worker),
      ssrUser: json(user),
    },
  };
}

export default function SingleCosting({ ssrData, ssrUser }) {
  const { setUser } = useContext(SiteContext);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    console.log(ssrData);
  }, [ssrData]);
  useEffect(() => {
    setUser(ssrUser);
  }, []);
  return (
    <App>
      <Table
        className={s.singleWorker}
        columns={[
          { label: `Date`, className: s.date },
          { label: `Payments`, className: s.payments },
        ]}
      >
        {ssrData.paid.map((item, i) => (
          <tr key={i}>
            <td className={s.date}>{displayDate(item.date)}</td>
            <td className={s.amount}>{item.paid}</td>
          </tr>
        ))}
        {ssrData.abs.map((item, i) => (
          <tr key={i}>
            <td className={s.date}>{displayDate(item.date)}</td>
            <td className={s.amount}>{item.paid}</td>
          </tr>
        ))}
      </Table>
      <AddBtn onClick={setShowForm} />
      <Modal open={showForm} setOpen={setShowForm}>
        <WorkerForm
          edit={edit}
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
