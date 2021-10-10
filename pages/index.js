import { useContext, useState, useEffect, Fragment } from "react";
import { SiteContext } from "../SiteContext";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import s from "../styles/Dashboard.module.scss";
import s2 from "../components/SCSS/Table.module.scss";
import { displayDate } from "../components/FormElements";
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
  const [loadingWeekData, setLoadingWeekData] = useState(true);
  const { user, fy, dateFilter, setNameTag, season } = useContext(SiteContext);
  const [summery, setSummery] = useState(null);
  const [pastWeek, setPastWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const { error, data } = useSWR(
    `/api/dashboardData?${new URLSearchParams({
      ...(dateFilter && {
        from: dateFilter.from,
        to: dateFilter.to,
      }),
      season,
    }).toString()}`,
    fetcher
  );
  const { error: error_pastWeek, data: data_pastWeek } = useSWR(
    `/api/dashboardData?${new URLSearchParams({
      ...(dateFilter && {
        from: dateFilter.from,
        to: dateFilter.to,
      }),
      pastWeek: "true",
      ...(selectedWeek && { week: selectedWeek }),
      season,
    }).toString()}`,
    fetcher,
    [selectedWeek]
  );
  useEffect(() => {
    if (data) {
      // console.log(data.summery);
      setSummery(data.summery);
    }
  }, [data]);
  useEffect(() => {
    if (data_pastWeek) {
      setLoadingWeekData(false);
      setPastWeek({
        production: data_pastWeek.pastWeek,
        lot: data_pastWeek.lot,
      });
      !selectedWeek && setSelectedWeek(data_pastWeek.date);
      setWeeks(data_pastWeek.dates);
    }
  }, [data_pastWeek]);
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
        {loadingWeekData ? (
          <div className={`${s.pastWeek} ${s.loading}`}>
            <div className={s.label} />
            <div className={s.qty}>
              <h3>🔴</h3>
              <p />
            </div>
            <div className={s.lot}>
              <h3>🔴</h3>
              <p />
            </div>
            <div className={s.paid}>
              <h3>🔴</h3>
              <p />
            </div>
          </div>
        ) : (
          <div className={s.pastWeek}>
            <div className={s.label}>
              <label>Past Week</label>
              <select
                defaultValue={selectedWeek}
                onChange={(e) => {
                  setLoadingWeekData(true);
                  setSelectedWeek(e.target.value);
                }}
              >
                {weeks.map((item) => (
                  <option key={item} value={item}>
                    {displayDate(item)}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.qty}>
              <h3>
                {pastWeek.production.total.production.toLocaleString("en-IN")}
              </h3>
              {pastWeek.production.total.production > 0 && (
                <p>
                  {pastWeek?.production?.groups?.map((item, i) => (
                    <Fragment key={i}>
                      {item._id}:&nbsp;{item.total.toLocaleString("en-IN")};{" "}
                    </Fragment>
                  ))}
                </p>
              )}
            </div>
            <div className={s.lot}>
              <h3>
                {pastWeek?.lot?.total?.production.toLocaleString("en-IN")}
                {pastWeek?.lot?.total?.production -
                  pastWeek?.production?.total?.production !==
                  0 && (
                  <sup>
                    {(
                      pastWeek?.lot?.total?.production -
                      pastWeek?.production?.total?.production
                    ).toLocaleString("en-IN")}
                  </sup>
                )}
              </h3>
              <p>
                {pastWeek?.lot?.groups?.map((item, i) => (
                  <Fragment key={i}>
                    {item._id}:&nbsp;
                    {item.total.toLocaleString("en-IN")};{" "}
                  </Fragment>
                ))}
              </p>
            </div>
            <div className={s.paid}>
              <h3>
                <sup>৳</sup>
                {pastWeek?.production?.total?.paid.toLocaleString("en-IN")}
              </h3>
              <p>Paid</p>
            </div>
          </div>
        )}
        <div className={s.pastYear}>
          <label>This Year</label>
          <div className={s.qty}>
            <h3>{summery.pastYear.total.qty.toLocaleString("en-IN")}</h3>
            <p>Pcs.</p>
          </div>
          <div className={s.paid}>
            <h3>
              <sup>৳</sup>
              {summery?.pastYear?.total?.paid.toLocaleString("en-IN")}
            </h3>
            <p>Paid</p>
          </div>
          <div className={s.qty}>
            <h3>
              <sup>৳</sup>
              {(
                summery?.pastYear?.total?.production -
                summery?.pastYear?.total?.paid
              ).toLocaleString("en-IN")}
            </h3>
            <p>Deu</p>
          </div>
        </div>
        <div style={{ height: 1 }} />
      </div>
    </App>
  );
}
