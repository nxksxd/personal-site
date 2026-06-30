import { useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";
import "./Modal.css";

interface ModalProps {
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}

export default function Modal({ onClose, labelledBy, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Lock background scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="modal__window" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="modal__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <CloseIcon size={22} />
        </button>
        <div className="modal__scroll">{children}</div>
      </div>
    </div>
  );
}
