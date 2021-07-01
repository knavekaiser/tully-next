import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import s from "./SCSS/Sidebar.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const {
    user,
    dateFilter,
    setUser,
    setIsAuthenticated,
    season,
    setSeason,
    seasons,
  } = useContext(SiteContext);
  const router = useRouter();
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    if (sidebarOpen) {
      setSeasonOpen(false);
      setBackupOpen(false);
      setAboutOpen(false);
    }
  }, [sidebarOpen]);
  return (
    <div className={s.sidebar}>
      <ul>
        {!user?.work && (
          <>
            <Link href="/">
              <li onClick={() => setSidebarOpen(false)}>
                <ion-icon name="home-outline"></ion-icon>
                <p>Home</p>
              </li>
            </Link>
            <Link
              href={{
                pathname: `/lots`,
                query: {
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
            <li onClick={() => setSeasonOpen(!seasonOpen)}>
              <p>{season}</p>
            </li>
            {seasonOpen && (
              <ul className={s.fold} onClick={() => setSidebarOpen(false)}>
                {seasons
                  .filter((sea) => sea.season !== season)
                  .map((sea) => (
                    <li key={sea.season} onClick={() => setSeason(sea.season)}>
                      {sea.season}
                    </li>
                  ))}
              </ul>
            )}
            <Link href="/config">
              <li onClick={() => setSidebarOpen(false)}>
                <ion-icon name="settings-outline"></ion-icon>
                <p>Config</p>
              </li>
            </Link>
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
              console.log("calling logout api");
              fetch("/api/logout").then((res) => {
                setUser(null);
                setIsAuthenticated(false);
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
