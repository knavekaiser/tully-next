import { useEffect, useContext, useState } from "react";
import { SiteContext } from "../../SiteContext";
import { App } from "../index.js";
import Table from "../../components/Table";
import { useRouter } from "next/router";
import { displayDate, convertUnit } from "../../components/FormElements";
import { Modal } from "../../components/Modals";
import s from "../../components/SCSS/Table.module.scss";
import Img from "next/image";

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../../utils/db");
  dbConnect();
  const { verifyToken } = require("../api/auth");
  const { req, res } = ctx;
  const token = verifyToken(req);
  if (token?.role === "admin") {
    const [user, fabric] = await Promise.all([
      Admin.findOne({ _id: token.sub }, "-pass"),
      Fabric.findOne({ _id: ctx.query._id }),
    ]);
    const newUsage = await Promise.all([
      ...fabric.usage.map((item) =>
        Costing.findOne({ lot: item.lot }, "dress lotSize lot img").then(
          (data) => ({
            ...json(item),
            ...(data && { lot: json(data) }),
          })
        )
      ),
    ]);
    return {
      props: {
        ssrData: json({ ...json(fabric), usage: newUsage }),
        ssrUser: json(user),
      },
    };
  } else {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
}

export default function SingleCosting({ ssrData, ssrUser }) {
  const [showSample, setShowSample] = useState(false);
  const { setUser } = useContext(SiteContext);
  useEffect(() => {
    setUser(ssrUser);
  }, []);
  return (
    <App>
      <Table
        className={s.singleFabric}
        columns={[
          {
            label: (
              <>
                {displayDate(ssrData.date)}
                <span>{ssrData.dealer}</span>
              </>
            ),
            className: s.date,
          },
          {
            label: (
              <>
                {ssrData.name}
                <span>
                  {ssrData.qnt.amount}
                  {ssrData.qnt.unit.substr(0, 1)} • ৳ {ssrData.price}
                </span>
              </>
            ),
            className: s.name,
            onClick: () => setShowSample(true),
          },
          {
            label: (
              <>
                {ssrData.img && (
                  <Img
                    src={ssrData.img}
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
        {ssrData.usage.map((item, i) =>
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
            {ssrData.usage.reduce(
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
              convertUnit(ssrData.qnt.amount, ssrData.qnt.unit, "yard") -
              ssrData.usage.reduce(
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
          src={ssrData.img}
          alt="sample image"
          objectFit="contain"
          layout="fill"
          onClick={() => setShowSample(false)}
        />
      </Modal>
    </App>
  );
}
