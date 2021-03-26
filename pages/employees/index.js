import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import { AddEmp, UpdateEmp, AddEmpWork } from "../../components/Forms";
import { AddBtn, SS } from "../../components/FormElements";
import { Modal } from "../../components/Modals";
import Table, { Tr, LoadingTr } from "../../components/Table";
import { useRouter } from "next/router";
import s from "../../components/SCSS/Table.module.scss";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EmpList() {
  const router = useRouter();
  const { user, empRate, fy, dateFilter, setMonths } = useContext(SiteContext);
  const { error, data } = user
    ? useSWR(
        `/api/employee?fy=${fy}${
          dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
        }`,
        fetcher
      )
    : {};
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [employees, setEmployees] = useState(null);
  const [empToUpdate, setEmpToUpdate] = useState({});
  const [addBtnStyle, setAddBtnStyle] = useState(false);
  const dltEmp = (_id) => {
    fetch("/api/employee", {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ _id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setEmployees((prev) => {
            const newEmps = prev.filter((emp) => emp._id !== _id);
            return newEmps;
          });
        } else {
          alert("something went worng");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("something went worng");
      });
  };
  const update = (_id) => {
    fetch("/api/employee", {
      method: "PATCH",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ _id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setEmployees((prev) => {
            const newEmps = prev.filter((emp) => emp._id !== _id);
            return newEmps;
          });
        } else {
          alert("something went worng");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("something went worng");
      });
  };
  useEffect(() => {
    if (!user) return;
    if (data) {
      setEmployees(data.content.allEmps);
      setMonths(data.content.months);
    }
  }, [data]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
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
  if (!employees) {
    return (
      <App>
        <Table
          className={s.empList}
          columns={[
            { label: "Name" },
            { label: "Last Week" },
            { label: "Production" },
            { label: "Payment" },
          ]}
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
      <Modal open={showForm} setOpen={setShowForm}>
        <AddEmp
          onSuccess={(data) => {
            setEmployees((prev) => {
              const newEmps = [...prev];
              newEmps.push({
                ...data,
                cost: 0,
                qnt: 0,
                paid: 0,
                deu: 0,
                lastDay: { paid: 0, qnt: 0 },
              });
              return newEmps;
            });
            setShowForm(false);
          }}
        />
      </Modal>
      <Modal open={showUpdateForm} setOpen={setShowUpdateForm}>
        <UpdateEmp
          onSuccess={(data) => {
            setShowUpdateForm(false);
            setEmployees((prev) => {
              const newEmps = prev.map((item) => {
                if (item._id === data._id) {
                  item.name = data.name;
                  item.pass = data.pass;
                }
                return item;
              });
              return newEmps;
            });
          }}
          data={empToUpdate}
        />
      </Modal>
      <Table
        className={s.empList}
        columns={[
          { label: "Name" },
          { label: "Last Week" },
          { label: "Production" },
          { label: "Payment" },
        ]}
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {employees?.map((emp, i) => {
          return (
            <Tr
              onClick={() => {
                SS.set("empWork", JSON.stringify(emp));
                router.push(
                  `/employees/${emp.name}?fy=${fy}${
                    dateFilter
                      ? `&from=${dateFilter.from}&to=${dateFilter.to}`
                      : ""
                  }`
                );
              }}
              key={i}
              options={[
                {
                  label: "Update",
                  fun: () => {
                    setEmpToUpdate({
                      name: emp.name,
                      pass: emp.pass,
                      _id: emp._id,
                    });
                    setShowUpdateForm(true);
                  },
                },
                {
                  label: "Delete",
                  fun: () => {
                    if (confirm("you sure want to delete this employee?")) {
                      dltEmp(emp._id);
                    }
                  },
                },
              ]}
            >
              <td className={s.name}>{emp.name}</td>
              <td>
                <span className={s.lastPaid}>
                  {emp.lastDay.paid.toLocaleString()}
                </span>
                <span className={s.lastQnt}>
                  {emp.lastDay.qnt.toLocaleString()}
                </span>
              </td>
              <td>
                <span className={s.cost}>
                  {emp.cost.toLocaleString("en-IN")}
                </span>
                <span className={s.qnt}>{emp.qnt.toLocaleString("en-IN")}</span>
              </td>
              <td>
                <span className={s.paid}>
                  {emp.paid.toLocaleString("en-IN")}
                </span>
                <span className={s.deu}>{emp.deu.toLocaleString("en-IN")}</span>
              </td>
            </Tr>
          );
        })}
      </Table>
      {!user?.work && <AddBtn translate={addBtnStyle} onClick={setShowForm} />}
    </App>
  );
}
