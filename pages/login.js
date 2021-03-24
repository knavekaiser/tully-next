import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index.js";
import { Input, PasswordInput, Submit } from "../components/FormElements";
import { Modal } from "../components/Modals";
import s from "../styles/Login.module.scss";
import s2 from "../components/SCSS/FormElements.module.scss";
import { useRouter } from "next/router";
import { json } from "../utils/db";

export async function getServerSideProps(ctx) {
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const token = verifyToken(req);
  if (token) {
    let user =
      (await Admin.findOne({ _id: token.sub }, "-pass")) ||
      (await Employee.findOne({ _id: token.sub }, "-pass"));
    if (user) {
      return {
        props: {
          ssrData: {
            user: json(user),
            ...(req.headers.referer && {
              originalUrl: json(req.headers.referer),
            }),
          },
        },
      };
    }
  } else {
    return { props: { ssrData: { notLoggedIn: true } } };
  }
}

export default function Login({ ssrData }) {
  const { setUser } = useContext(SiteContext);
  const router = useRouter();
  useEffect(() => {
    if (ssrData.user) {
      setUser(ssrData.user);
      if (ssrData.originalUrl) {
        router.push(
          ssrData.originalUrl.includes("/login") ? "/" : ssrData.originalUrl
        );
      } else {
        router.push("/");
      }
    }
  }, [ssrData]);
  const [loading, setLoading] = useState(false);
  const [adminForm, setAdminForm] = useState(false);
  const [viwer, setViwer] = useState({ id: "", pass: "" });
  const [admin, setAdmin] = useState({ id: "", pass: "" });
  const [wrongInfo, setWrongInfo] = useState({ admin: false, viwer: false });
  const viwerFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("./api/viwerLogin", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(viwer),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          router.push("/");
        } else if (data.message === "invalid credentials") {
          setWrongInfo({ admin: false, viwer: true });
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        alert("something went wrong");
      });
  };
  const adminFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("./api/adminLogin", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(admin),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          router.push("/");
        } else if (data.message === "invalid credentials") {
          setWrongInfo({ admin: true, viwer: false });
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        alert("something went wrong");
      });
  };
  useEffect(() => {
    if (wrongInfo.admin || wrongInfo.viwer) {
      setTimeout(() => setWrongInfo({ admin: false, viwer: false }), 500);
    }
  }, [wrongInfo]);
  return (
    <App>
      <div className={s.container}>
        <div className={s.innerWrapper}>
          <h1>WORKPLACE</h1>
          <form className={`${s.viwerForm}`} onSubmit={viwerFormSubmit}>
            <Input
              className={wrongInfo.viwer ? s2.wrong : ""}
              required={true}
              label="User"
              value={viwer.id}
              onChange={(t) => setViwer((prev) => ({ ...prev, id: t.value }))}
            />
            <PasswordInput
              className={wrongInfo.viwer ? s2.wrong : ""}
              required={true}
              label="Password"
              value={viwer.pass}
              onChange={(t) => setViwer((prev) => ({ ...prev, pass: t.value }))}
            />
            <Submit label="Log in" loading={loading} />
          </form>
          <p onClick={() => setAdminForm(true)}>management</p>
          <Modal open={adminForm} setOpen={setAdminForm}>
            <form
              className={`${s.adminForm} ${s2.form}`}
              onSubmit={adminFormSubmit}
            >
              <h2>Admin Login</h2>
              <Input
                className={wrongInfo.admin ? s2.wrong : ""}
                required={true}
                label="User"
                value={admin.id}
                onChange={(t) => setAdmin((prev) => ({ ...prev, id: t.value }))}
              />
              <PasswordInput
                className={wrongInfo.admin ? s2.wrong : ""}
                required={true}
                label="Password"
                value={admin.pass}
                onChange={(t) =>
                  setAdmin((prev) => ({ ...prev, pass: t.value }))
                }
              />
              <Submit label="Log in" loading={loading} />
            </form>
          </Modal>
        </div>
      </div>
    </App>
  );
}
