import { Component, useEffect, useContext, useState, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table, { LoadingTr } from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, SS } from "../../components/FormElements";
import s from "../../components/SCSS/Table.module.scss";
import { Modal } from "../../components/Modals";
import { useReactToPrint } from "react-to-print";

const Name = () => {
  return (
    <svg height={56} width={300} className={s.name}>
      <defs>
        <linearGradient
          id="rainbow"
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF5B99" offset="0%" />
          <stop stopColor="#FF5B99" offset="5%" />
          <stop stopColor="#FF5447" offset="20%" />
          <stop stopColor="#FF7B21" offset="40%" />
          <stop stopColor="#EAFC37" offset="60%" />
          <stop stopColor="#4FCB6B" offset="80%" />
          <stop stopColor="#51F7FE" offset="100%" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient
          id="blueRedYellow"
          x1="100%"
          y1="0"
          x2="0"
          y2="150%"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4158D0" offset="0%" />
          <stop stopColor="#C850C0" offset="46%" />
          <stop stopColor="#d4972a" offset="100%" />
        </linearGradient>
      </defs>
      <text x="15" y="46" fill="url(#blueRedYellow)">
        মোঃ হোসেন
      </text>
    </svg>
  );
};

class Bill_Class extends Component {
  render() {
    const viewMode = this.props.viewMode;
    const bill = this.props.bill;
    const wages = {};
    bill.products?.forEach((item, i) => {
      wages[item.wage]
        ? (wages[item.wage] += item.qnt)
        : (wages[item.wage] = item.qnt);
    });
    const _bill = (
      <>
        <header>
          <p className={s.memo}>
            বিল <span className={s.ref}>{bill.ref}</span>
          </p>
          <Name />
          <p className={s.add}>
            ৭২ টেকের হাটি মেইন রোড, কামরাঙ্গীরচর, ঢাকা ১২১১ • ০১৭১৭-১৪১০৭৭
          </p>
        </header>
        <div className={s.detail}>
          <p>ক্রেতা -</p>
          <p className={s.name}>আলম গার্মেন্টস • গাউসিয়া মার্কেট</p>
          <p className={s.date}>{`${new Date(bill.date)
            .getDate()
            .toLocaleString("bn-BD")} • ${(
            new Date(bill.date).getMonth() + 1
          ).toLocaleString("bn-BD")} • ${new Date(bill.date)
            .getFullYear()
            .toString()
            .bn()}`}</p>
        </div>
        <table className={s.content} cellSpacing={0} cellPadding={0}>
          <thead>
            <tr>
              <th>মালের বিবরণ</th>
              <th>পরিমাণ</th>
              <th>দর</th>
              <th>টাকা</th>
            </tr>
          </thead>
          <tbody className={s.products}>
            {bill.products.map((product, i) => (
              <tr key={i}>
                <td className={s.dress}>{product.dress}</td>
                <td>{product.qnt.toLocaleString("bn-BD")}</td>
                <td>
                  {(viewMode === "advanced"
                    ? product.cost
                    : product.wage
                  ).toLocaleString("bn-BD")}
                </td>
                <td className={s.taka}>
                  {(
                    (viewMode === "advanced" ? product.cost : product.wage) *
                    product.qnt
                  ).toLocaleString("bn-BD")}
                </td>
              </tr>
            ))}
          </tbody>
          <tbody className={s.summery}>
            {viewMode === "advanced" ? (
              <>
                {bill.products.length > 1 && (
                  <tr>
                    <td>মোট</td>
                    <td className={s.taka}>
                      {bill.products
                        .reduce((p, c) => p + c.qnt * c.cost, 0)
                        .toLocaleString("bn-BD")}
                    </td>
                  </tr>
                )}
                {Object.entries(wages).map(([wage, qty]) => (
                  <tr key={wage}>
                    <td>
                      মজুরী বাদ ({qty.toLocaleString("en-IN").bn()} x{" "}
                      {(+wage || 0).toLocaleString("en-IN").bn()})
                    </td>
                    <td className={s.taka}>
                      - {(wage * qty).toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))}
                <tr className={s.hr} />
                <tr>
                  <td>সর্বমোট</td>
                  <td className={s.taka}>
                    {bill.products
                      .reduce(
                        (p, c) => p + (c.qnt * c.cost - c.qnt * c.wage),
                        0
                      )
                      .toLocaleString("bn-BD")}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td>সর্বমোট</td>
                <td className={s.taka}>
                  {bill.products
                    .reduce((p, c) => p + c.qnt * c.wage, 0)
                    .toLocaleString("bn-BD")}
                </td>
              </tr>
            )}
          </tbody>
          {false && Object.entries(wages).length > 1 && (
            <tbody className={s.wagesBreakdown}>
              <tr>
                <td>মজুরী</td>
              </tr>
              {Object.entries(wages).map(([wage, qnt], i) => (
                <tr key={i}>
                  <td>
                    {qnt.toLocaleString("en-IN").bn()} x{" "}
                    {wage.toLocaleString("en-IN").bn()}
                  </td>
                  <td>{(wage * qnt).toLocaleString("en-IN").bn()}</td>
                </tr>
              ))}
              <tr className={s.hr} />
              <tr>
                <td>সর্বমোট</td>
                <td className={s.taka}>
                  {bill.products
                    .reduce((p, c) => p + c.qnt * c.wage, 0)
                    .toLocaleString("bn-BD")}
                </td>
              </tr>
            </tbody>
          )}
        </table>
        <footer>
          <p>ক্রেতার স্বাক্ষর</p>
          <p>বিক্রেতার স্বাক্ষর</p>
        </footer>
        <svg
          className={s.topWave}
          xmlns="http://www.w3.org/2000/svg"
          width="278"
          height="191"
          viewBox="29 5 200 170"
        >
          <g>
            <g>
              <path
                d="M2.6638712879121593,162.1317202649126 C2.6638712879121593,162.1317202649126 24.432885784333976,156.0415904603013 35.470137805551325,140.55019231653296 C46.507389826768666,125.05879417276476 58.69674876884821,106.9719462922821 77.00467706641558,95.90894957399449 C95.31260536398294,84.84472103333557 100.33537519029977,84.86935748076522 123.05384015998249,82.013993223668 C145.77243053588276,79.15862896657076 184.24454996356368,73.86795188105198 208.22974313697222,59.249915798664915 C232.21493631038072,44.63187971627799 252.1720817752779,2.4875409207353183 252.1720817752779,2.4875409207353183 L3.8677709766328636,2.4875409207353183 L2.6638712879121593,162.1317202649126 z"
                fill="#f4e0de"
              />
            </g>
          </g>
        </svg>
        <svg
          className={s.bottomWave}
          xmlns="http://www.w3.org/2000/svg"
          width="295"
          height="191"
          viewBox="50 20 200 160"
        >
          <g>
            <g>
              <path
                d="M26.44089014014605,188.14780875063036 C26.44089014014605,188.14780875063036 26.24751375264528,177.64652303373896 49.615959148019584,160.94917078828902 C72.98440454339388,144.25181854283892 125.37510924729709,138.52014904832933 151.04450792273883,120.74248858308883 C176.71390659818056,102.96482811784834 205.4871091586054,63.89511796152682 233.81261152228717,56.293542107106106 C262.13811388596895,48.691966252685525 277.15300031623246,57.77172895288558 277.15300031623246,57.77172895288558 L277.4539752384127,188.73908348894201 L26.44089014014605,188.14780875063036 z"
                fill="#dfe0f6"
              />
            </g>
          </g>
        </svg>
        <div className={`${s.circle} ${s.top}`} />
        <div className={`${s.circle} ${s.bottom}`} />
      </>
    );
    return (
      <div className={s.paper}>
        <div className={`${s.billPrint} ${s.bill_one}`}>{_bill}</div>
        <div className={s.cut} />
        <div className={`${s.billPrint} ${s.bill_two}`}>{_bill}</div>
        <div className={s.circle_1}>1</div>
        <div className={s.circle_2}>2</div>
        <div className={s.circle_3}>3</div>
        <div className={s.circle_4}>4</div>
      </div>
    );
    // return (
    //   <div className={s.paper}>
    //   </div>
    // );
  }
}

export function getServerSideProps() {
  return { props: {} };
}

export default function SingleBill() {
  const { viewMode, fy, user, setNameTag } = useContext(SiteContext);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });
  const fetchData = (lotNo) => {
    fetch(`/api/bills?ref=${router.query.ref}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setData(data.bill);
          SS.set("singleBillData", JSON.stringify(data.bill));
        } else if (data.code === 400) {
          router.push(`/bills?fy=${fy}`);
        } else {
          alert("something went");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (SS.get("singleBillData")) {
      const localData = JSON.parse(SS.get("singleBillData"));
      if (localData.ref === +router.query.ref) {
        setData(localData);
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
      setNameTag(`Bill: ${router.query.ref}`);
    }
  }, []);
  if (!data) {
    return (
      <App>
        <Table
          className={s.singleBill}
          columns={[
            {
              label: <>Nō</>,
              className: s.ref,
            },
            { label: `Date:`, className: s.date },
            { label: "", className: s.gred },
            { label: "Dress", className: s.dress },
            { label: "qnt", className: s.qnt },
            { label: "cost", className: s.cost },
            { label: "taka", className: s.taka },
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
        className={s.singleBill}
        columns={[
          {
            label: (
              <>
                Nō <span>{data.ref}</span>
              </>
            ),
            className: s.ref,
          },
          { label: `Date: ${displayDate(data.date)}`, className: s.date },
          { label: "", className: s.gred },
          { label: "Dress", className: s.dress },
          { label: "qnt", className: s.qnt },
          { label: "cost", className: s.cost },
          { label: "taka", className: s.taka },
        ]}
      >
        {data.products.map((item, i) => (
          <tr key={i}>
            <td className={s.dress}>{item.dress}</td>
            <td className={s.qnt}>{item.qnt}</td>
            <td className={s.cost}>
              {viewMode === "advanced" ? item.cost : item.wage}
            </td>
            <td className={s.taka}>
              {(
                (viewMode === "advanced" ? item.cost : item.wage) * item.qnt
              ).toLocaleString("en-IN")}
            </td>
          </tr>
        ))}
        <tr className={s.hr} />
        <tr className={s.total}>
          <td>
            {data.products
              .reduce(
                (p, c) =>
                  p + c.qnt * (viewMode === "advanced" ? c.cost : c.wage),
                0
              )
              .toLocaleString("en-IN")}
          </td>
        </tr>
        {viewMode === "advanced" && (
          <>
            <tr className={s.hr} />
            {data.products.map((item, i) => (
              <tr key={i}>
                <td className={s.deduction}>Deduction</td>
                <td className={s.qnt}>{item.qnt}</td>
                <td className={s.cost}>{item.wage}</td>
                <td className={s.taka}>
                  - {(item.qnt * item.wage).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            <tr className={s.hr} />
            <tr>
              <td className={s.final}>
                {data.products
                  .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
                  .toLocaleString("en-IN")}
              </td>
            </tr>
          </>
        )}

        <tr>
          <td onClick={() => setShowPrint(true)}>Print</td>
        </tr>
      </Table>
      <Modal
        className={s.container}
        backDropClass={s.printBackdrop}
        open={showPrint}
        setOpen={setShowPrint}
      >
        <Bill_Class bill={data} ref={componentRef} viewMode={viewMode} />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
    </App>
  );
}
