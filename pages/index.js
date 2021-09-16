import { useContext, useState, useEffect, Fragment } from "react";
import { SiteContext } from "../SiteContext";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import s from "../styles/Dashboard.module.scss";
import s2 from "../components/SCSS/Table.module.scss";
import { IoLockClosedOutline } from "react-icons/io5";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

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
      <div
        key="main"
        className="container"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Head>
          <title>Tully</title>
          <link rel="icon" href="/favicon.ico" />
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

export default function Home() {
  const router = useRouter();
  const { user, fy, dateFilter, setNameTag, season } = useContext(SiteContext);
  const { error, data } = useSWR(
    `/api/dashboardData?${new URLSearchParams({
      ...(dateFilter && {
        from: dateFilter.from,
        to: dateFilter.to,
      }),
      season,
    })}`,
    fetcher
  );
  const [summery, setSummery] = useState(null);
  useEffect(() => {
    if (data) {
      console.log(data.summery);
      setSummery(data.summery);
    }
  }, [data]);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user?.role === "viwer") {
      router.push("/employees");
    } else {
      setNameTag(null);
    }
  }, []);
  if (!user) {
    return (
      <App>
        <div className={s2.unauthorized}>
          <div>
            <IoLockClosedOutline />
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  if (!summery) {
    return (
      <App>
        <div className={s.container}>
          <Link href={`employees`}>Employees</Link>
          <Link href={`bills`}>Bills</Link>
          <Link href={`fabrics`}>Fabrics</Link>
          <Link href={`costings`}>Costings</Link>
          <Link href={`wages`}>Wages</Link>
          <Link href={`productions`}>Productions</Link>
        </div>
      </App>
    );
  }
  return (
    <App>
      <div className={s.container}>
        <Link href={`employees`}>
          <a>
            Employees{" "}
            {(summery.emp?.production - summery.emp?.paid).toLocaleString(
              "en-IN"
            )}
          </a>
        </Link>
        <Link href={`bills`}>
          <a>Bills {summery.bill.toLocaleString("en-IN")}</a>
        </Link>
        <Link href={`fabrics`}>Fabrics</Link>
        <Link href={`costings`}>Costings</Link>
        <Link href={`wages`}>
          <a>Wages {summery.wage.toLocaleString("en-IN")}</a>
        </Link>
        <Link href={`productions`}>
          <a>Productions {summery.production.toLocaleString("en-IN")}</a>
        </Link>
        <a className={s.pastWeek}>
          Past week: <br />
          {summery?.pastWeek?.groups?.map((item, i) => (
            <Fragment key={i}>
              {item._id}: {item.total}
              <br />
            </Fragment>
          ))}
          total: {summery?.pastWeek?.total?.production}
          <br />
          <br />
          {summery?.lot?.groups?.map((item, i) => (
            <Fragment key={i}>
              {item._id}: {item.total}
              <br />
            </Fragment>
          ))}
          total: {summery?.lot?.total?.production} (
          {summery?.lot?.total?.production -
            summery?.pastWeek?.total?.production}
          )
        </a>
      </div>
    </App>
  );
}
