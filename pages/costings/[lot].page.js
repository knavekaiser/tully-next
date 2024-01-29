import { useEffect, useContext, useState, Component, useRef } from "react";
import { SiteContext } from "SiteContext";
import { App } from "../index.page.js";
import Table, { LoadingTr } from "@/components/Table";
import { useRouter } from "next/router";
import { displayDate, SS } from "@/components/FormElements";
import { Modal } from "@/components/Modals";
import Img from "next/image";
import { IoLockClosedOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import s from "./comp/style.module.scss";

class Costing_print extends Component {
  render() {
    const costing = this.props.costing;
    return (
      <div className={`${s.paper} ${s.costing}`}>
        <div className={`${s.billPrint}`}>
          <header>
            <h2 contentEditable={true}>{costing.dress}</h2>
          </header>
          <table className={s.content} cellSpacing={0} cellPadding={0}>
            <thead>
              <tr>
                <th>আইটেম</th>
                <th>পরিমাণ</th>
                <th>দর</th>
                <th>টাকা</th>
              </tr>
            </thead>
            <tbody className={s.products}>
              {costing.materials.map((material, i) => (
                <tr key={i}>
                  <td className={s.dress}>{material.material}</td>
                  <td>{material.qnt?.toLocaleString("bn-BD")}</td>
                  <td>{material.price?.toLocaleString("bn-BD")}</td>
                  <td className={s.taka}>
                    {(material.price * material.qnt).toLocaleString("bn-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tbody className={s.summery}>
              <tr>
                <td>মোট</td>
                <td className={s.taka}>
                  {costing.materials
                    .reduce((p, c) => p + c.qnt * c.price, 0)
                    .toLocaleString("bn-BD")}
                </td>
              </tr>
              <tr>
                <td>প্রতি পিছ</td>
                <td className={s.taka}>
                  {Math.ceil(
                    costing.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
                      costing.lotSize
                  ).toLocaleString("bn-BD")}
                </td>
              </tr>
            </tbody>
          </table>
          <footer></footer>
        </div>
        <div className={s.cut} />
        <div className={`${s.billPrint}`}></div>
      </div>
    );
  }
}

class Costing_lot extends Component {
  render() {
    const costing = this.props.costing;
    return (
      <div className={`${s.paper} ${s.costing} ${s.lot}`}>
        <div className={`${s.billPrint} ${s.image}`}>
          {costing.img && (
            <Img src={costing.img} layout="fill" objectFit="contain" />
          )}
        </div>
        <div className={s.cut} />
        <div className={`${s.billPrint}`}>
          <header>
            <h2 contentEditable={true}>{costing.dress}</h2>
            <div>
              <p>লট নংঃ {costing.lot?.toLocaleString("bn-BD")}</p>
              <p>লট সাইজঃ {costing.lotSize?.toLocaleString("bn-BD")}</p>
            </div>
          </header>
          <table className={s.content} cellSpacing={0} cellPadding={0}>
            <thead>
              <tr>
                <th>আইটেম</th>
                <th>পরিমাণ</th>
                <th>দর</th>
              </tr>
            </thead>
            <tbody className={s.products}>
              {costing.materials.map((material, i) => (
                <tr key={i}>
                  <td className={s.dress}>{material.material}</td>
                  <td>
                    {
                      // material.qnt?.toLocaleString("bn-BD")
                    }
                  </td>
                  <td>
                    {
                      // material.price?.toLocaleString("bn-BD")
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <footer></footer>
        </div>
      </div>
    );
  }
}

export default function SingleCosting() {
  const router = useRouter();
  const { fy, user } = useContext(SiteContext);
  const [data, setData] = useState(null);
  const [showImg, setShowImg] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showLotPrint, setShowLotPrint] = useState(false);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });
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
            <IoLockClosedOutline />
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
        {data.img ? (
          <tr className={s.img}>
            <td>
              {data.img && (
                <Img
                  src={data.img || ""}
                  layout="fill"
                  objectFit="contain"
                  onClick={() => setShowImg(true)}
                />
              )}
            </td>
          </tr>
        ) : (
          <></>
        )}
        <tr>
          <td onClick={() => setShowPrint(true)}>Print</td>
          <td onClick={() => setShowLotPrint(true)}>Print Lot</td>
        </tr>
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
      <Modal
        className={s.container}
        backDropClass={s.printBackdrop}
        open={showPrint}
        setOpen={setShowPrint}
      >
        <Costing_print costing={data} ref={componentRef} />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
      <Modal
        className={s.container}
        backDropClass={s.printBackdrop}
        open={showLotPrint}
        setOpen={setShowLotPrint}
      >
        <Costing_lot costing={data} ref={componentRef} />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowLotPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
    </App>
  );
}
