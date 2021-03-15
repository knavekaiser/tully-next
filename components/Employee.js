import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { AddEmp, UpdateEmp, AddEmpWork } from "../components/Forms";
import { AddBtn } from "../components/FormElements";
import { Modal } from "../components/Modals";
import Table, { Tr } from "../components/Table";
import { useRouter } from "next/router";
import s from "./SCSS/Table.module.scss";

export function EmpList() {
  const { push } = useRouter();
  const { user, empRate, fy, dateFilter, setMonths } = useContext(SiteContext);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empToUpdate, setEmpToUpdate] = useState({});
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
    setLoading(true);
    fetch(`/api/employee`, {
      method: "GET",
      headers: {
        filters: JSON.stringify({
          fy,
          ...(dateFilter && {
            dateFilter: { from: dateFilter.from, to: dateFilter.to },
          }),
        }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          setEmployees(data.content.allEmps);
          setMonths(data.content.months);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("something went wrong");
      });
  }, [fy, dateFilter]);
  return (
    <>
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
      >
        {loading ? (
          <tr>
            <td>Loading</td>
          </tr>
        ) : (
          employees.map((emp, i) => {
            return (
              <Tr
                onClick={() =>
                  push(
                    `/employee/${emp.name}?fy=${fy}${
                      dateFilter
                        ? `&from=${dateFilter.from}&to=${dateFilter.to}`
                        : ""
                    }`
                  )
                }
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
                  <br />
                  <span className={s.lastQnt}>
                    {emp.lastDay.qnt.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className={s.cost}>
                    {emp.cost.toLocaleString("en-IN")}
                  </span>
                  <br />
                  <span className={s.qnt}>
                    {emp.qnt.toLocaleString("en-IN")}
                  </span>
                </td>
                <td>
                  <span className={s.paid}>
                    {emp.paid.toLocaleString("en-IN")}
                  </span>
                  <br />
                  <span className={s.deu}>
                    {emp.deu.toLocaleString("en-IN")}
                  </span>
                </td>
              </Tr>
            );
          })
        )}
      </Table>
      {!user?.work && <AddBtn onClick={setShowForm} />}
    </>
  );
}
