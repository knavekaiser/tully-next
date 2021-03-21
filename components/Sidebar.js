import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import s from "./SCSS/Sidebar.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Sidebar({ sections, sidebarOpen, setSidebarOpen }) {
  const {
    user,
    fy,
    dateFilter,
    setFy,
    setUser,
    setIsAuthenticated,
  } = useContext(SiteContext);
  const router = useRouter();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [fiscalYearOpen, setFiscalYearOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    setSidebarOpen(false);
  }, [fy]);
  useEffect(() => {
    if (sidebarOpen) {
      setFiscalYearOpen(false);
      setBackupOpen(false);
      setAboutOpen(false);
      setSectionOpen(false);
    }
  }, [sidebarOpen]);
  return (
    <div className={s.sidebar}>
      <ul>
        {!user?.work && (
          <>
            <li onClick={() => setSectionOpen(!sectionOpen)}>
              <ion-icon name="albums-outline"></ion-icon>
              <p>Section</p>
            </li>
            {sectionOpen && (
              <ul className={s.fold}>
                {sections.map((section) =>
                  section.link ? (
                    <Link href={section.link} key={section.label}>
                      <li>
                        <p>{section.label}</p>
                      </li>
                    </Link>
                  ) : (
                    <li key={section.label}>
                      <p>{section.label}</p>
                    </li>
                  )
                )}
              </ul>
            )}
          </>
        )}
        <li onClick={() => setFiscalYearOpen(!fiscalYearOpen)}>
          <p>৳</p>
          <p>{fy}</p>
        </li>
        {fiscalYearOpen && (
          <ul className={s.fold} onClick={() => setSidebarOpen(false)}>
            <li onClick={() => setFy("all")}>All time</li>
            <li onClick={() => setFy("2019-20")}>2019-20</li>
            <li onClick={() => setFy("2020-21")}>2020-21</li>
          </ul>
        )}
        {!user?.work && (
          <>
            <Link
              href={{
                pathname: `/lots`,
                query: {
                  fy,
                  ...(dateFilter && {
                    from: dateFilter.from,
                    to: dateFilter.to,
                  }),
                },
              }}
            >
              <li>
                <ion-icon name="layers-outline"></ion-icon>
                <p>Lots</p>
              </li>
            </Link>
            <li>
              <ion-icon name="analytics-outline"></ion-icon>
              <p>Data</p>
            </li>
            {
              // <li onClick={() => setBackupOpen(!backupOpen)}>
              //   <ion-icon name="download-outline"></ion-icon>
              //   <p>Backup</p>
              // </li>
              // {backupOpen && (
              //   <ul className={s.fold}>
              //     <li>App Backup</li>
              //     <li>Json Data</li>
              //   </ul>
              // )}
              // <li>
              //   <input
              //     className={s.upload}
              //     type="file"
              //     accept=".txt, .json"
              //     name="restore"
              //   />
              //   <ion-icon name="refresh-outline"></ion-icon>
              //   <p>Restore</p>
              // </li>
              // <li className={s.clear}>
              //   <ion-icon name="trash-outline"></ion-icon>
              //   <p>Clear All</p>
              //   <span></span>
              // </li>
            }
          </>
        )}
        {user && (
          <li
            className="logout"
            onClick={() => {
              fetch("/api/logout")
                .then((res) => res.json())
                .then((data) => {
                  setUser(data.user);
                  setIsAuthenticated(data.isAuthenticated);
                  router.push("/login");
                });
            }}
          >
            <ion-icon name="log-out-outline"></ion-icon>
            <p>Logout</p>
          </li>
        )}
      </ul>
      <div className={`${s.about} ${s.active}`}>
        <p onClick={() => setAboutOpen(!aboutOpen)}>
          <span>WORKPLACE is a simple tullybook app written by</span>
          <br />
          Naeem Ahmad
        </p>
        <a href="mailTo:naeem.ahmad.9m@gmail.com">
          <div
            className={`${s.portrait} ${s.forward} ${
              aboutOpen ? s.active : ""
            }`}
            title="email"
          ></div>
        </a>
      </div>
    </div>
  );
}
