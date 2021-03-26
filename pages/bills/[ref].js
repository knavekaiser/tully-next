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
          <small>বিসমিল্লাহির রাহ্‌মানির রাহিম</small>
          <p className={s.pill}>ক্যাশ মেমো</p>
          <p className={s.mobile}>মোবাঃ ০১৭১৭-১৪১০৭৭</p>
          <h1>মোঃ হোসেন</h1>
          <p className={s.add}>
            ৭২ টেকের হাটি মেইন রোড, কামরাঙ্গীরচর, ঢাকা ১২১১
          </p>
          <p className={s.ref}>
            <span className={s.label}>নং </span>
            {bill.ref.toLocaleString("bn-BD")}
          </p>
          <p className={s.date}>
            <span className={s.label}>তারিখ </span>
            {displayDate(bill.date).bn()}
          </p>
          <p className={s.name}>
            <span className={s.label}>নাম </span>আলম গার্মেন্টস
          </p>
          <p className={s.customerAdd}>
            <span className={s.label}>ঠিকানা </span>গাউসিয়া মার্কেট
          </p>
        </header>
        <table className={s.content}>
          <thead>
            <tr>
              <th className={s.no}>সংখ্যা</th>
              <th>মালের বিবরণ</th>
              <th>পরিমাণ</th>
              <th>দর</th>
              <th>টাকা</th>
            </tr>
          </thead>
          <tbody>
            {bill.products.map((product, i) => (
              <tr key={i}>
                <td>{(i + 1).toLocaleString("bn-BD")}</td>
                <td className={s.dress}>{product.dress}</td>
                <td>{product.qnt.toLocaleString("bn-BD")}</td>
                <td>{product.cost.toLocaleString("bn-BD")}</td>
                <td className={s.taka}>
                  {(product.cost * product.qnt).toLocaleString("bn-BD")}
                </td>
              </tr>
            ))}
            {bill.products.length > 1 && (
              <>
                <tr className={s.hr} />
                <tr>
                  <td className={s.taka}>
                    {bill.products
                      .reduce((p, c) => p + c.qnt * c.cost, 0)
                      .toLocaleString("bn-BD")}
                  </td>
                </tr>
              </>
            )}
            <tr className={s.gap} />
            <tr>
              <td />
              <td>মজুরী বাদ</td>
              <td>
                {bill.products
                  .reduce((p, c) => p + c.qnt, 0)
                  .toLocaleString("bn-BD")}
              </td>
              <td>-</td>
              <td className={s.taka}>
                -{" "}
                {bill.products
                  .reduce((p, c) => p + c.qnt * c.wage, 0)
                  .toLocaleString("bn-BD")}
              </td>
            </tr>
            <tr className={s.hr} />
            <tr>
              <td className={s.taka}>
                {bill.products
                  .reduce((p, c) => p + (c.qnt * c.cost - c.qnt * c.wage), 0)
                  .toLocaleString("bn-BD")}
              </td>
            </tr>
          </tbody>
        </table>
        <footer>
          <p>ক্রেতার স্বাক্ষর</p>
          <p className={s.thanks}>ধন্যবাদ আবার আসবেন</p>
          <p>বিক্রেতার স্বাক্ষর</p>
        </footer>
      </div>
    );
  }
}

export default function SingleBill() {
  const { fy, user } = useContext(SiteContext);
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
                Nō<span>{ssrData.ref}</span>
              </>
            ),
            className: s.ref,
          },
          { label: `Date: ${displayDate(ssrData.date)}`, className: s.date },
          { label: "", className: s.gred },
          { label: "Dress", className: s.dress },
          { label: "qtn", className: s.qnt },
          { label: "cost/wage", className: s.cost },
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
      <Modal className={s.container} open={showPrint} setOpen={setShowPrint}>
        <Bill_Class bill={ssrData} ref={componentRef} />
        <button onClick={handlePrint}>Print this out!</button>
        <button onClick={() => setShowPrint(false)}>Close</button>
        <div className={s.pBtm} />
      </Modal>
    </App>
  );
}
