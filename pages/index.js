import { useContext, useState, useEffect } from "react";
import { SiteContext } from "../SiteContext";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import s from "../styles/Dashboard.module.scss";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export async function getServerSideProps(ctx) {
  const { dbConnect, json } = require("../utils/db");
  dbConnect();
  const { verifyToken } = require("./api/auth");
  const { req, res } = ctx;
  const token = verifyToken(req);
  if (token) {
    let user =
      (await Admin.findOne({ _id: token.sub }, "-pass")) ||
      (await Employee.findOne({ _id: token.sub }, "-pass"));
    if (user) {
      return { props: { ssrData: { user: json(user) } } };
    }
  } else {
    return {
      redirect: {
        destination: "/login",
      },
    };
  }
  return { props: { ssrData: { user: {} } } };
}

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

export const App = ({ children }) => {
  const { fy, dateFilter } = useContext(SiteContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();
  }, []);
  return (
    <>
      <div className="container" onContextMenu={(e) => e.preventDefault()}>
        <Head>
          <title>Tully</title>
          <link rel="icon" href="/favicon.ico" />
          <script
            type="module"
            src="https://unpkg.com/ionicons@5.4.0/dist/ionicons/ionicons.esm.js"
          ></script>
          <link
            href="https://fonts.maateen.me/solaiman-lipi/font.css"
            rel="stylesheet"
          />
        </Head>
        <div className="innerContainer" style={sidebarOpen ? { left: 0 } : {}}>
          <span
            className={`sidebar_span ${sidebarOpen && "active"}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <Sidebar
            sections={[
              {
                label: "Employees",
                link: {
                  pathname: "/employees",
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              { label: "workers", link: "/workers" },
              {
                label: "bills",
                link: {
                  pathname: `/bills`,
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              {
                label: "fabrics",
                link: {
                  pathname: `/fabrics`,
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              {
                label: "costs",
                link: {
                  pathname: `/costings`,
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              {
                label: "production",
                link: {
                  pathname: `/productions`,
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              {
                label: "wages",
                link: {
                  pathname: `/wages`,
                  query: {
                    fy,
                    ...(dateFilter && {
                      from: dateFilter.from,
                      to: dateFilter.to,
                    }),
                  },
                },
              },
              { label: "summery" },
            ]}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <Nav setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          {children}
        </div>
      </div>
      <div id="portal" onContextMenu={(e) => e.preventDefault()} />
    </>
  );
};

export default function Home({ ssrData }) {
  const router = useRouter();
  const { setUser, fy, dateFilter } = useContext(SiteContext);
  const { error, data } = useSWR(
    `/api/dashboardData?fy=${fy}${
      dateFilter ? `&from=${dateFilter.from}&to=${dateFilter.to}` : ""
    }`,
    fetcher
  );
  const [summery, setSummery] = useState(null);
  useEffect(() => {
    if (ssrData.user) {
      setUser(ssrData.user);
    } else {
      rotuer.push("/login");
    }
  }, []);
  useEffect(() => {
    if (data) {
      console.log(data.summery);
      setSummery(data.summery);
    }
  }, [data]);
  if (!summery) {
    return (
      <App>
        <div className={s.container}>
          <Link href={`employees?fy=${fy}`}>Employees</Link>
          <Link href={`bills?fy=${fy}`}>Bills</Link>
          <Link href={`fabrics?fy=${fy}`}>Fabrics</Link>
          <Link href={`costings?fy=${fy}`}>Costings</Link>
          <Link href={`wages?fy=${fy}`}>Wages</Link>
          <Link href={`productions?fy=${fy}`}>Productions</Link>
        </div>
      </App>
    );
  }
  return (
    <App>
      <div className={s.container}>
        <Link href={`employees?fy=${fy}`}>Employees</Link>
        <Link href={`bills?fy=${fy}`}>Bills</Link>
        <Link href={`fabrics?fy=${fy}`}>Fabrics</Link>
        <Link href={`costings?fy=${fy}`}>Costings</Link>
        <Link href={`wages?fy=${fy}`}>
          <a>Wages {summery.wage.toLocaleString("en-IN")}</a>
        </Link>
        <Link href={`productions?fy=${fy}`}>Productions</Link>
      </div>
    </App>
  );
}
