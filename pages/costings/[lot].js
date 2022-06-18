import {
  useEffect,
  useContext,
  useState,
  Component,
  useRef,
  useCallback,
} from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { LoadingTr } from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, SS } from "../../components/FormElements";
import { Modal } from "../../components/Modals";
import Img from "next/image";
import { IoLockClosedOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import s from "../../components/SCSS/Table.module.scss";

class Costing_print extends Component {
  render() {
    const costing = this.props.costing;
    return (
      <div className={`${s.paper} ${s.costing}`}>
        {
          // <div />
        }
        <div className={`${s.billPrint}`}>
          {
            <header>
              <h2 contentEditable={true}>{costing.dress}</h2>
            </header>
            // <div className={s.detail}>
            //   <p>ক্রেতা -</p>
            //   <p className={s.name}>আলম গার্মেন্টস • গাউসিয়া মার্কেট</p>
            //   {
            //     // <p className={s.date}>{`${new Date(costing.date)
            //     //   .getDate()
            //     //   .toLocaleString("bn-BD")} • ${(
            //     //   new Date(costing.date).getMonth() + 1
            //     // ).toLocaleString("bn-BD")} • ${new Date(costing.date)
            //     //   .getFullYear()
            //     //   .toString()
            //     //   .bn()}`}</p>
            //   }
            // </div>
          }
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
          <footer>
            {
              //   <p>ক্রেতার স্বাক্ষর</p>
              // <p className={s.thanks} contentEditable={false}>
              //   ধন্যবাদ আবার আসবেন
              // </p>
              // <p>বিক্রেতার স্বাক্ষর</p>
            }
          </footer>
          {
            //   <svg
            //   className={s.topWave}
            //   xmlns="http://www.w3.org/2000/svg"
            //   width="278"
            //   height="191"
            //   viewBox="29 5 200 170"
            // >
            //   <g>
            //     <g>
            //       <path
            //         d="M2.6638712879121593,162.1317202649126 C2.6638712879121593,162.1317202649126 24.432885784333976,156.0415904603013 35.470137805551325,140.55019231653296 C46.507389826768666,125.05879417276476 58.69674876884821,106.9719462922821 77.00467706641558,95.90894957399449 C95.31260536398294,84.84472103333557 100.33537519029977,84.86935748076522 123.05384015998249,82.013993223668 C145.77243053588276,79.15862896657076 184.24454996356368,73.86795188105198 208.22974313697222,59.249915798664915 C232.21493631038072,44.63187971627799 252.1720817752779,2.4875409207353183 252.1720817752779,2.4875409207353183 L3.8677709766328636,2.4875409207353183 L2.6638712879121593,162.1317202649126 z"
            //         fill="#f4eae9"
            //       />
            //     </g>
            //   </g>
            // </svg>
            // <svg
            //   className={s.bottomWave}
            //   xmlns="http://www.w3.org/2000/svg"
            //   width="295"
            //   height="191"
            //   viewBox="50 20 200 160"
            // >
            //   <g>
            //     <g>
            //       <path
            //         d="M26.44089014014605,188.14780875063036 C26.44089014014605,188.14780875063036 26.24751375264528,177.64652303373896 49.615959148019584,160.94917078828902 C72.98440454339388,144.25181854283892 125.37510924729709,138.52014904832933 151.04450792273883,120.74248858308883 C176.71390659818056,102.96482811784834 205.4871091586054,63.89511796152682 233.81261152228717,56.293542107106106 C262.13811388596895,48.691966252685525 277.15300031623246,57.77172895288558 277.15300031623246,57.77172895288558 L277.4539752384127,188.73908348894201 L26.44089014014605,188.14780875063036 z"
            //         fill="#f0f1fd"
            //       />
            //     </g>
            //   </g>
            // </svg>
            // <div className={`${s.circle} ${s.top}`} />
            // <div className={`${s.circle} ${s.bottom}`} />
          }
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
            {
              // <tbody className={s.summery}>
              // <tr>
              // <td>মোট</td>
              // <td className={s.taka}>
              // {costing.materials
              //   .reduce((p, c) => p + c.qnt * c.price, 0)
              //   .toLocaleString("bn-BD")}
              //   </td>
              //   </tr>
              //   <tr>
              //   <td>প্রতি পিছ</td>
              //   <td className={s.taka}>
              //     {Math.ceil(
              //       costing.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
              //         costing.lotSize
              //     ).toLocaleString("bn-BD")}
              //   </td>
              // </tr>
              // </tbody>
            }
          </table>
          <footer>
            {
              //   <p>ক্রেতার স্বাক্ষর</p>
              // <p className={s.thanks} contentEditable={false}>
              //   ধন্যবাদ আবার আসবেন
              // </p>
              // <p>বিক্রেতার স্বাক্ষর</p>
            }
          </footer>
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
  const fetchData = useCallback(() => {
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
  }, []);
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
