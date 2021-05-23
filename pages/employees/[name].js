import { useState, useEffect, useContext, Fragment, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import { Modal } from "../../components/Modals";
import Table, { Tr, LoadingTr } from "../../components/Table";
import { AddEmpWork } from "../../components/Forms";
import { displayDate, AddBtn, SS } from "../../components/FormElements";
import s from "../../components/SCSS/Table.module.scss";
import { useRouter } from "next/router";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function getServerSideProps() {
  return { props: {} };
}

export default function EmpWorkList() {
  const router = useRouter();
  const [emp, setEmp] = useState(null);
  const {
    user,
    fy,
    empRate,
    dateFilter,
    setDateFilter,
    setNameTag,
  } = useContext(SiteContext);
  const [showForm, setShowForm] = useState(false);
  const [workToEdit, setWorkToEdit] = useState(null);
  const [addBtnStyle, setAddBtnStyle] = useState(false);
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
  }, [fy, dateFilter]);
  const fetchData = (lotNo) => {
    fetch(`/api/empWork?emp=${router.query.name}&fy=${fy}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setEmp(data.content);
          SS.set("empWork", JSON.stringify(data.content));
        } else if (data.code === 400) {
          router.push(`/employees?fy=${fy}`);
        } else {
          alert("something went");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (SS.get("empWork")) {
      const localData = JSON.parse(SS.get("empWork"));
      if (localData.name === router.query.name) {
        setEmp(localData);
      } else {
        fetchData();
      }
    } else {
      fetchData();
    }
  }, []);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag(router.query.name);
      SS.get("empWork") && setEmp(JSON.parse(SS.get("empWork")));
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
        onScroll={(dir) => {
          if (dir === "down") {
            setAddBtnStyle(true);
          } else {
            setAddBtnStyle(false);
          }
        }}
      >
        {emp?.work.map((work, i) => (
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
                  if (
                    confirm(
                      `Do you want to delete the date ${work.date.replace(
                        /T.*$/,
                        ""
                      )}?`
                    )
                  ) {
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
                  {product.qnt.toLocaleString("en-IN")}{" "}
                  <sup>{product.group}</sup>
                </td>
                <td className={s.total}>
                  {(product.qnt * empRate[product.group]).toLocaleString(
                    "en-IN"
                  )}
                </td>
              </Fragment>
            ))}
            <td
              className={`${s.paid} ${work.products.length <= 1 && s.single}`}
            >
              {work.paid.toLocaleString("en-IN")}
            </td>
          </Tr>
        ))}
        {emp?.work.length === 0 && (
          <tr className={s.empty}>
            <td>
              <ion-icon name="file-tray-outline"></ion-icon> Nothing yet!
            </td>
          </tr>
        )}
      </Table>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddEmpWork
          employee={emp?._id}
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
      {fy !== "all" && !user?.work && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
    </App>
  );
}
