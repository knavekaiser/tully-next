import { useState, useRef, useContext } from "react";
import { SiteContext } from "../SiteContext";
import s from "./SCSS/Table.module.scss";

export default function Table({ className, columns, children, onScroll }) {
  const scrollPos = useRef(0);
  return (
    <table
      className={`${s.table} ${className || ""}`}
      cellSpacing={0}
      cellPadding={0}
    >
      <thead>
        <tr>
          {columns.map((item, i) => {
            return (
              <th
                key={i}
                onClick={() => {
                  if (item.sort) {
                    console.log("do something");
                  }
                }}
                className={item.className || ""}
                onClick={item.onClick}
              >
                {item.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody
        {...(onScroll && {
          onScroll: (e) => {
            if (scrollPos.current < e.target.scrollTop) {
              onScroll("down");
            } else {
              onScroll("up");
            }
            scrollPos.current = e.target.scrollTop;
          },
        })}
      >
        {children}
      </tbody>
    </table>
  );
}

export const Tr = ({ children, options, onClick }) => {
  const { user } = useContext(SiteContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0 });
  const menu = useRef(null);
  return (
    <tr
      onClick={onClick}
      className={s.trContext}
      onContextMenu={(e) => {
        setMenuOpen(!menuOpen);
        const x = e.clientX;
        const y = e.clientY;
        const height = 70;
        const width = 77.03;
        setStyle((prev) => {
          const newPos = { ...prev };
          if (x + width <= window.innerWidth) {
            newPos.left = `${x}px`;
            newPos.transformOrigin = `0 0`;
          } else {
            newPos.left = `${x - width}px`;
            newPos.transformOrigin = `100% 100%`;
          }
          if (y + height <= window.innerHeight) {
            newPos.top = `${y}px`;
            newPos.transformOrigin = `${
              x + width <= window.innerWidth ? 0 : 100
            }% 0`;
          } else {
            newPos.top = `${y - height}px`;
            newPos.transformOrigin = `${
              x + width <= window.innerWidth ? 0 : 100
            }% 100%`;
          }
          return newPos;
        });
      }}
    >
      {children}
      {menuOpen && !user.work && (
        <td className={s.ctxMenu} onClick={(e) => e.stopPropagation()}>
          <>
            <div className={s.backDrop} onClick={() => setMenuOpen(false)} />
            <ul
              className={s.menu}
              style={style}
              ref={menu}
              onClick={() => setMenuOpen(false)}
            >
              {options.map((item, i) => (
                <li key={i} onClick={() => item?.fun()}>
                  {item.label}
                </li>
              ))}
            </ul>
          </>
        </td>
      )}
    </tr>
  );
};

export const LoadingTr = ({ number }) => {
  const tds = [];
  for (var i = 0; i < number; i++) {
    tds.push(<td key={i}></td>);
  }

  return <tr className={s.loadingTr}>{tds}</tr>;
};
