import { useEffect } from "react";
import "./Modal.css";

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ onClose, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <dialog className={`modal ${className || ""}`} open>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </dialog>
    </>
  );
}
