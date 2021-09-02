import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import s from "./SCSS/Sidebar.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  IoHomeOutline,
  IoDownloadOutline,
  IoRefresh,
  IoTrashOutline,
  IoLogOutOutline,
  IoLayersOutline,
  IoSettingsOutline,
} from "react-icons/io5";

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
                <IoHomeOutline />
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
                <IoLayersOutline />
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
                <IoSettingsOutline />
                <p>Config</p>
              </li>
            </Link>
            {
              // <li onClick={() => setBackupOpen(!backupOpen)}>
              //   <IoDownloadOutline/>
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
              //   <IoRefresh/>
              //   <p>Restore</p>
              // </li>
              // <li className={s.clear}>
              //   <IoTrashOutline/>
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
            <IoLogOutOutline />
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
