import React, { createContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fy, setFy] = useState("2021-22");
  const [empRate, setEmpRate] = useState({
    1: 20,
    S: 24,
    L: 36,
    F: 43,
    iS: 2.5,
    iL: 4,
  });
  const [dateFilter, setDateFilter] = useState(null);
  const [months, setMonths] = useState([]);
  const [season, setSeason] = useState("");
  const [seasons, setSeasons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [nameTag, setNameTag] = useState(null);
  const firstRender = useRef(true);
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then(({ code, groups }) => {
        if (code === "ok") {
          setGroups(groups);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("could not get groups");
      });
    fetch("/api/season")
      .then((res) => res.json())
      .then(({ code, seasons }) => {
        if (code === "ok") {
          setSeasons(seasons);
          const runningSeason = seasons.filter((sea) => sea.running)[0];
          if (runningSeason) {
            setSeason(runningSeason.season);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        alert("could not get seasons");
      });
  }, []);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        fy,
      },
    });
  }, [fy]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        fy,
        setFy,
        empRate,
        dateFilter,
        setDateFilter,
        months,
        setMonths,
        nameTag,
        setNameTag,
        seasons,
        setSeasons,
        season,
        setSeason,
        groups,
        setGroups,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
