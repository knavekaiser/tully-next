import { useEffect, useContext, useState } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { LoadingTr } from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, SS } from "../../components/FormElements";
import { Modal } from "../../components/Modals";
import Img from "next/image";
import s from "../../components/SCSS/Table.module.scss";

export default function SingleCosting() {
  const router = useRouter();
  const { fy, user } = useContext(SiteContext);
  const [data, setData] = useState(null);
  const [showImg, setShowImg] = useState(false);
  const fetchData = (lotNo) => {
    fetch(`/api/costings?lot=${lotNo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setData(data.costing);
          SS.set("singleCosting", JSON.stringify(data.costing));
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
    if (!data) {
      const localData = SS.get("singleCosting")
        ? JSON.parse(SS.get("singleCosting"))
        : null;
      if (localData) {
        if (+router.query.lot === localData.lot) {
          setData(localData);
        } else {
          fetchData(router.query.lot);
        }
      } else {
        fetchData(router.query.lot);
      }
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
  if (!data) {
    return (
      <App>
        <Table
          className={s.singleCosting}
          columns={[
            { label: `Date:`, className: s.date },
            { label: `Lot:`, className: s.lot },
            { label: `Lot size:`, className: s.lotSize },
            { label: "", className: s.back },
            { label: "Material", className: s.material },
            { label: "qnt" },
            { label: "price" },
            { label: "Total" },
          ]}
        >
          <LoadingTr number={4} />
        </Table>
      </App>
    );
  }
  return (
    <App>
      <Table
        className={s.singleCosting}
        columns={[
          { label: `${displayDate(data.date)}`, className: s.date },
          { label: `Lot: ${data.lot}`, className: s.lot },
          { label: `Lot size: ${data.lotSize}`, className: s.lotSize },
          { label: "", className: s.back },
          { label: "Material", className: s.material },
          { label: "qnt", className: s.qnt },
          { label: "price", className: s.price },
          { label: "Total" },
        ]}
      >
        {data.materials.map((item, i) => (
          <tr key={i}>
            <td className={s.material}>{item.material}</td>
            <td className={s.qnt}>{item.qnt}</td>
            <td className={s.price}>{item.price}</td>
            <td className={s.total}>
              {(item.price * item.qnt).toLocaleString("en-IN")}
            </td>
          </tr>
        ))}
        <tr className={s.hr} />
        <tr>
          <td className={s.totalCostLabel}>Total material cost</td>
          <td className={s.totalCost}>
            {Math.ceil(
              data.materials.reduce((p, c) => p + c.qnt * c.price, 0)
            ).toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td className={s.perUnitLabel}>Per unit ({data.lotSize})</td>
          <td className={s.perUnit}>
            {Math.ceil(
              data.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
                data.lotSize
            ).toLocaleString("en-IN")}
          </td>
        </tr>
        {data.img && (
          <tr className={s.img}>
            <td>
              <Img
                src={data.img}
                layout="fill"
                objectFit="contain"
                onClick={() => setShowImg(true)}
              />
            </td>
          </tr>
        )}
      </Table>
      <Modal className={s.sampleImg} open={showImg} setOpen={setShowImg}>
        <Img
          src={data.img}
          alt="sample image"
          objectFit="contain"
          layout="fill"
          onClick={() => setShowImg(false)}
        />
      </Modal>
    </App>
  );
}
