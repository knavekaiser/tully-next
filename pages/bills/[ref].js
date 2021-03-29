import { Component, useEffect, useContext, useState, useRef } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, SS } from "../../components/FormElements";
import s from "../../components/SCSS/Table.module.scss";
import { Modal } from "../../components/Modals";
import { useReactToPrint } from "react-to-print";

String.prototype.bn = function () {
  return this.replace(/1/g, "১")
    .replace(/2/g, "২")
    .replace(/3/g, "৩")
    .replace(/4/g, "৪")
    .replace(/5/g, "৫")
    .replace(/6/g, "৬")
    .replace(/7/g, "৭")
    .replace(/8/g, "৮")
    .replace(/9/g, "৯")
    .replace(/0/g, "০");
};

class Bill_Class extends Component {
  render() {
    const bill = this.props.bill;
    return (
      <div className={s.billPrint}>
        <header>
          <p className={s.memo}>ক্যাশ মেমো</p>
          <p className={s.ref}>{bill.ref}</p>
          <h1>মোঃ হোসেন</h1>
          <p className={s.add}>
            ৭২ টেকের হাটি মেইন রোড, কামরাঙ্গীরচর, ঢাকা ১২১১ • ০১৭১৭-১৪১০৭৭
          </p>
        </header>
        <div className={s.detail}>
          <p>খদ্দের -</p>
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
                <td>{product.cost.toLocaleString("bn-BD")}</td>
                <td className={s.taka}>
                  {(product.cost * product.qnt).toLocaleString("bn-BD")}
                </td>
              </tr>
            ))}
          </tbody>
          <tbody className={s.summery}>
            {bill.products.length > 1 && (
              <tr>
                <td>মোট</td>
                <td className={s.taka}>
                  ৳{" "}
                  {bill.products
                    .reduce((p, c) => p + c.qnt * c.cost, 0)
                    .toLocaleString("bn-BD")}
                </td>
              </tr>
            )}
            <tr>
              <td>মজুরী বাদ</td>
              <td className={s.taka}>
                -{" "}
                {bill.products
                  .reduce((p, c) => p + c.qnt * c.wage, 0)
                  .toLocaleString("bn-BD")}
              </td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td>সর্বমোট</td>
              <td className={s.taka}>
                ৳{" "}
                {bill.products
                  .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
                  .toLocaleString("bn-BD")}
              </td>
            </tr>
          </tbody>
        </table>
        <footer>
          <p>ক্রেতার স্বাক্ষর</p>
          <p className={s.thanks} contentEditable={true}>
            ধন্যবাদ আবার আসবেন
          </p>
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
                fill="#f4eae9"
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
                fill="#f0f1fd"
              />
            </g>
          </g>
        </svg>
        <div className={`${s.circle} ${s.top}`} />
        <div className={`${s.circle} ${s.bottom}`} />
      </div>
    );
  }
}

export default function SingleBill() {
  const { fy, user, setNameTag } = useContext(SiteContext);
  const router = useRouter();
  const [ssrData, setSsrData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  useEffect(() => {
    SS.get("singleBillData") &&
      setSsrData(JSON.parse(SS.get("singleBillData")));
  }, []);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag(`Bill: ${router.query.ref}`);
    }
  }, []);
  if (!ssrData) {
    return <App />;
  }
  return (
    <App>
      <Table
        className={s.singleBill}
        columns={[
          {
            label: (
              <>
                Nō <span>{ssrData.ref}</span>
              </>
            ),
            className: s.ref,
          },
          { label: `Date: ${displayDate(ssrData.date)}`, className: s.date },
          { label: "", className: s.gred },
          { label: "Dress", className: s.dress },
          { label: "qnt", className: s.qnt },
          { label: "cost", className: s.cost },
          { label: "taka", className: s.taka },
        ]}
      >
        {ssrData.products.map((item, i) => (
          <tr key={i}>
            <td className={s.dress}>{item.dress}</td>
            <td className={s.qnt}>{item.qnt}</td>
            <td className={s.cost}>{item.cost}</td>
            <td className={s.taka}>
              {(item.cost * item.qnt).toLocaleString("en-IN")}
            </td>
          </tr>
        ))}
        <tr className={s.hr} />
        <tr className={s.total}>
          <td>
            {ssrData.products
              .reduce((p, c) => p + c.qnt * c.cost, 0)
              .toLocaleString("en-IN")}
          </td>
        </tr>
        <tr className={s.hr} />
        {ssrData.products.map((item, i) => (
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
            {ssrData.products
              .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
              .toLocaleString("en-IN")}
          </td>
        </tr>
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
        <Bill_Class bill={ssrData} ref={componentRef} />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
    </App>
  );
}
