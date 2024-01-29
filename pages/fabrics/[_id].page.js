import { useEffect, useContext, useState } from "react";
import { SiteContext } from "SiteContext";
import { App } from "../index.page.js";
import Table, { LoadingTr } from "@/components/Table";
import { useRouter } from "next/router";
import { displayDate, convertUnit, SS } from "@/components/FormElements";
import { Modal } from "@/components/Modals";
import { IoLockClosedOutline } from "react-icons/io5";
import s from "./comp/style.module.scss";
import Img from "next/image";

export async function getServerSideProps(ctx) {
  return {
    props: {},
  };
}

export default function SingleCosting() {
  const router = useRouter();
  const [showSample, setShowSample] = useState(false);
  const [fabric, setFabric] = useState(null);
  const { user } = useContext(SiteContext);
  const fetchData = (_id) => {
    fetch(`/api/fabrics?_id=${_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setFabric(data.fabric);
          SS.set("singleCosting", JSON.stringify(data.fabric));
        } else if (data.code === 400) {
          router.push(`/costings?fy=${fy}`);
        } else {
          alert("something went ---- wrong");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    if (!fabric) {
      const localData = SS.get("singleFabric")
        ? JSON.parse(SS.get("singleFabric"))
        : null;
      if (localData) {
        if (router.query._id === localData._id) {
          setFabric(localData);
        } else {
          fetchData(router.query._id);
        }
      } else {
        fetchData(router.query._id);
      }
    }
  }, []);
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
  if (!fabric) {
    return (
      <App>
        <Table
          className={s.singleFabric}
          columns={[
            {
              label: "",
              className: s.date,
            },
            {
              label: "",
              className: s.name,
              onClick: () => setShowSample(true),
            },
            {
              label: "",
              className: s.back,
            },
            { label: "Lot", className: s.lot },
            { label: "Usage" },
          ]}
        >
          <LoadingTr number={2} />
        </Table>
      </App>
    );
  }
  return (
    <App>
      <Table
        className={s.singleFabric}
        columns={[
          {
            label: (
              <>
                {displayDate(fabric.date)}
                <span>{fabric.dealer}</span>
              </>
            ),
            className: s.date,
          },
          {
            label: (
              <>
                {fabric.name}
                <span>
                  {fabric.qnt.amount}
                  {fabric.qnt.unit.substr(0, 1)} • ৳ {fabric.price}
                </span>
              </>
            ),
            className: s.name,
            onClick: () => fabric.img && setShowSample(true),
          },
          {
            label: (
              <>
                {fabric.img && (
                  <Img
                    src={fabric.img}
                    alt="image"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center center"
                  />
                )}
              </>
            ),
            className: s.back,
          },
          { label: "Lot", className: s.lot },
          { label: "Usage" },
        ]}
      >
        {fabric.usage.map((item, i) =>
          item.lot.lot ? (
            <tr key={i}>
              <td className={s.lot}>
                {item.lot.dress}
                <span>
                  Lot no: {item.lot.lot}, Lot size: {item.lot.lotSize}
                </span>
              </td>
              <td className={s.qnt}>
                {convertUnit(item.qnt.amount, item.qnt.unit, "yard")} yd
              </td>
            </tr>
          ) : (
            <tr key={i}>
              <td className={s.lot}>
                Lot does not exists!
                <span>Lot no: {item.lot}</span>
              </td>
              <td className={s.qnt}>
                {convertUnit(item.qnt.amount, item.qnt.unit, "yard")} yd
              </td>
            </tr>
          )
        )}
        <tr className={s.hr} />
        <tr>
          <td className={s.totalUsage}>Total usage</td>
          <td className={s.qnt}>
            {fabric.usage.reduce(
              (p, c) => p + convertUnit(c.qnt.amount, c.qnt.unit, "yard"),
              0
            )}{" "}
            yd
          </td>
        </tr>
        <tr>
          <td className={s.totalUsage}>Remaining</td>
          <td className={s.qnt}>
            {(
              convertUnit(fabric.qnt.amount, fabric.qnt.unit, "yard") -
              fabric.usage.reduce(
                (p, c) => p + convertUnit(c.qnt.amount, c.qnt.unit, "yard"),
                0
              )
            ).toFixed(2)}{" "}
            yd
          </td>
        </tr>
      </Table>
      <Modal className={s.sampleImg} open={showSample} setOpen={setShowSample}>
        <Img
          src={fabric.img}
          alt="sample image"
          objectFit="contain"
          layout="fill"
          onClick={() => setShowSample(false)}
        />
      </Modal>
    </App>
  );
}
