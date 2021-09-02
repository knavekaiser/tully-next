import { useState, useContext, useEffect, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { App } from "./index";
import { Modal } from "../components/Modals";
import s from "../styles/Config.module.scss";
import s2 from "../components/SCSS/Table.module.scss";
import { useRouter } from "next/router";
import { AddSeason, AddGroup } from "../components/Forms";
import {
  IoLockClosedOutline,
  IoCheckmarkDoneOutline,
  IoCloseOutline,
  IoPencilOutline,
} from "react-icons/io5";

export default function Productions() {
  const router = useRouter();
  const {
    user,
    dateFilter,
    setMonths,
    setNameTag,
    seasons,
    setSeasons,
    groups,
    setGroups,
  } = useContext(SiteContext);
  const [showForm, setShowForm] = useState(false);
  const [groupForm, setGroupForm] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setNameTag("Config");
    }
  }, []);
  useEffect(() => {
    if (!groupForm) {
      setGroupToEdit(null);
    }
  }, [groupForm]);
  if (!user) {
    return (
      <App>
        <div className={s.unauthorized}>
          <div>
            <IoLockClosedOutline />
            <p>Please log in</p>
          </div>
        </div>
      </App>
    );
  }
  return (
    <App>
      <div className={s.config}>
        <div className={s.seasons}>
          <h2>Seasons</h2>
          <ul>
            {seasons.map((item) => (
              <li
                key={item.season}
                className={item.running ? "running" : undefined}
              >
                <p>
                  {item.season}
                  {item.running && <span className="pill">Running</span>}
                </p>
                <div className={s.btns}>
                  {!item.running && (
                    <button
                      onClick={() => {
                        if (
                          confirm("You sure want to make this season running?")
                        ) {
                          fetch("/api/season", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ _id: item._id }),
                          })
                            .then((res) => res.json())
                            .then(({ code }) => {
                              if (code === "ok") {
                                setSeasons((prev) =>
                                  prev.map((sea) =>
                                    sea._id === item._id
                                      ? { ...sea, running: true }
                                      : { ...sea, running: false }
                                  )
                                );
                              } else {
                                alert("something went wrong");
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                              alert("something went wrong");
                            });
                        }
                      }}
                    >
                      <IoCheckmarkDoneOutline />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("You sure want to delete this season?")) {
                        fetch("/api/season", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            _id: item._id,
                          }),
                        })
                          .then((res) => res.json())
                          .then(({ code }) => {
                            if (code === "ok") {
                              setSeasons((prev) =>
                                prev.filter((sea) => sea.season !== item.season)
                              );
                            } else {
                              alert("something went wrong");
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            alert("something went wrong");
                          });
                      }
                    }}
                  >
                    <IoCloseOutline />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowForm(true)}>Add Season</button>
        </div>
        <div className={s.groups}>
          <h2>Groups</h2>
          <ul>
            {groups.map((item) => (
              <li key={item.label}>
                <p>
                  {item.label} <span>{item.value}</span>
                </p>
                <div className={s.btns}>
                  <button
                    onClick={() => {
                      setGroupToEdit(item);
                      setGroupForm(true);
                    }}
                  >
                    <IoPencilOutline />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("You sure want to delete this group?")) {
                        fetch("/api/groups", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ _id: item._id }),
                        })
                          .then((res) => res.json())
                          .then(({ code }) => {
                            if (code === "ok") {
                              setGroups((prev) =>
                                prev.filter((gr) => gr.label !== item.label)
                              );
                            } else {
                              alert("something went wrong");
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            alert("something went wrong");
                          });
                      }
                    }}
                  >
                    <IoCloseOutline />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => setGroupForm(true)}>Add Group</button>
        </div>
      </div>
      <Modal open={showForm} setOpen={setShowForm}>
        <AddSeason
          onSuccess={(newSeason) => {
            setShowForm(false);
            setSeasons((prev) => [...prev, newSeason]);
          }}
        />
      </Modal>
      <Modal open={groupForm} setOpen={setGroupForm}>
        <AddGroup
          edit={groupToEdit}
          onSuccess={({ newGroup, edit }) => {
            setGroupForm(false);
            if (edit) {
              setGroups((prev) =>
                prev.map((gr) => ({
                  ...gr,
                  ...(gr._id === newGroup._id && newGroup),
                }))
              );
            } else {
              setGroups((prev) => [...prev, newGroup]);
            }
          }}
        />
      </Modal>
    </App>
  );
}
