import { useEffect, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate } from "../../components/FormElements";
import s from "../../components/SCSS/Table.module.scss";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const token = verifyToken(req);
  let bill = {};
  let user = {};
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    bill = await Bill.findOne({ ref: ctx.query.ref });
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(bill),
      ssrUser: json(user),
    },
  };
}

export default function SingleBill({ ssrData, ssrUser }) {
  const { setUser } = useContext(SiteContext);
  useEffect(() => {
    console.log(ssrData);
  }, [ssrData]);
  useEffect(() => {
    setUser(ssrUser);
  }, []);
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
      </Table>
    </App>
  );
}
