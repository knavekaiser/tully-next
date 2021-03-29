import React, { createContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fy, setFy] = useState("2020-21");
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
  const [nameTag, setNameTag] = useState(null);
  const firstRender = useRef(true);
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
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
