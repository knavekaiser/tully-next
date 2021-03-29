import { useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export const Modal = forwardRef(
  (
    {
      containerClass,
      open,
      setOpen,
      children,
      className,
      backDropClass,
      backdropClick,
      block,
      id,
    },
    ref
  ) => {
    useEffect(() => {
      if (!containerClass) return;
      const portal = document.querySelector("#portal");
      portal.classList.add(containerClass);
      return () => portal.classList.remove(containerClass);
    });
    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  type: "spring",
                  mass: 0.5,
                  damping: 10,
                  stiffness: 80,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  type: "spring",
                  mass: 0.5,
                  damping: 10,
                  stiffness: 80,
                },
              }}
              ref={ref}
              key="backdrop"
              className={`modalBackdrop ${backDropClass || ""}`}
              onClick={() => {
                setOpen && !block && setOpen(false);
                backdropClick && !block && backdropClick();
              }}
            />
            <motion.div
              initial={{
                opacity: 0,
                scale: 1.3,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  type: "ease",
                  mass: 0.5,
                  damping: 10,
                  stiffness: 80,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.7,
                transition: {
                  type: "ease",
                  mass: 0.5,
                  damping: 10,
                  stiffness: 80,
                },
              }}
              key="modal"
              id={id}
              className={`modal ${className || ""}`}
            >
              {children}
            </motion.div>{" "}
          </>
        )}
      </AnimatePresence>,
      document.querySelector("#portal")
    );
  }
);

export const Toast = ({ open, children }) => {
  if (!open) return null;
  return createPortal(
    <>
      <div className="toast">{children}</div>
    </>,
    document.querySelector("#portal")
  );
};
