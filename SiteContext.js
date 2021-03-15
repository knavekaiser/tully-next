import React, { createContext, useState } from "react";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
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
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
