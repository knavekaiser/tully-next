import { useEffect, useState, useContext, Fragment, useRef } from "react";
import { SiteContext } from "SiteContext";
import { App } from "../index.page.js";
import Table, { Tr, LoadingTr } from "@/components/Table";
import { displayDate, AddBtn } from "@/components/FormElements";
import { useRouter } from "next/router";
import { Modal } from "@/components/Modals";
import { LotForm } from "./comp/form";
import s from "./comp/style.module.scss";
import { IoLockClosedOutline } from "react-icons/io5";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Lots() {
  const router = useRouter();
  const { fy, dateFilter, user, setMonths, empRate } = useContext(SiteContext);
  const [lots, setLots] = useState(null);
  const { error, data } = useSWR(
    `/api/lots?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const dltLot = (_id) => {
    if (confirm("you want to delete this Lot?")) {
      fetch(`/api/lots/${_id}`, { method: "DELETE" })
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
  const firstRedner = useRef(true);
  useEffect(() => {
    if (firstRedner.current) {
      firstRedner.current = false;
      return;
    }
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
  useEffect(() => {
    !showForm && setEdit(null), [showForm];
  }, []);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, []);
  useEffect(() => {
    if (data?.lots) {
      setLots(data.lots);
      setMonths(data.months);
    }
  }, [data]);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <IoLockClosedOutline />
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  if (!lots) {
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
          <LoadingTr number={4} />
        </Table>
      </App>
    );
  }
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
        {lots.map((lot, i) => (
          <Tr
            key={i}
            options={[
              {
                label: "Edit",
                fun: () => {
                  setEdit(lot);
                  setShowForm(true);
                },
              },
              {
                label: "Delete",
                fun: () => {
                  dltLot(lot._id);
                },
              },
            ]}
          >
            <td className={`${s.date} ${lot.products.length <= 1 && s.single}`}>
              {displayDate(lot.date)}
            </td>
            {lot.products.map((product, j) => (
              <Fragment key={j}>
                <td className={s.dress}>{product.dress}</td>
                <td className={s.qnt}>
                  {product.qnt} <sup>{product.group}</sup>
                </td>
              </Fragment>
            ))}
            <td className={s.total}>
              {lot.products
                .reduce((a, c) => a + c.qnt, 0)
                .toLocaleString("en-IN")}
            </td>
          </Tr>
        ))}
      </Table>
      {fy !== "all" && (
        <AddBtn translate={addBtnStyle || showForm} onClick={setShowForm} />
      )}
      <Modal open={showForm} setOpen={setShowForm}>
        <LotForm
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
            setEdit(null);
          }}
        />
      </Modal>
    </App>
  );
}
