import { useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";

export const Modal = forwardRef(
  (
    {
      containerClass,
      open,
      setOpen,
      children,
      className,
      backdropClick,
      block,
    },
    ref
  ) => {
    useEffect(() => {
      if (!containerClass) return;
      const portal = document.querySelector("#portal");
      portal.classList.add(containerClass);
      return () => portal.classList.remove(containerClass);
    });
    if (!open) return null;
    return createPortal(
      <>
        <div
          ref={ref}
          className="modalBackdrop"
          onClick={() => {
            setOpen && !block && setOpen(false);
            backdropClick && !block && backdropClick();
          }}
        />
        <div className={`modal ${className || ""}`}>{children}</div>
      </>,
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
