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
  let costing = {};
  let user = {};
  if (token?.role === "admin") {
    user = await Admin.findOne({ _id: token.sub }, "-pass");
    costing = await Costing.findOne({ lot: ctx.query.lot });
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {
      ssrData: json(costing),
      ssrUser: json(user),
    },
  };
}

export default function SingleCosting({ ssrData, ssrUser }) {
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
        className={s.singleCosting}
        columns={[
          { label: `Date: ${displayDate(ssrData.date)}`, className: s.date },
          { label: `Lot: ${ssrData.lot}`, className: s.lot },
          { label: `Lot size: ${ssrData.lotSize}`, className: s.lotSize },
          { label: "", className: s.back },
          { label: "Material", className: s.material },
          { label: "qnt" },
          { label: "price" },
          { label: "Total" },
        ]}
      >
        {ssrData.materials.map((item, i) => (
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
              ssrData.materials.reduce((p, c) => p + c.qnt * c.price, 0)
            ).toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td className={s.perUnitLabel}>Per unit ({ssrData.lotSize})</td>
          <td className={s.perUnit}>
            {Math.ceil(
              ssrData.materials.reduce((p, c) => p + c.qnt * c.price, 0) /
                ssrData.lotSize
            ).toLocaleString("en-IN")}
          </td>
        </tr>
      </Table>
    </App>
  );
}
