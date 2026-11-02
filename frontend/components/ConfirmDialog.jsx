import { useEffect, useRef } from "react";
import trash from "./assets/trash.svg";
import "./ConfirmDialog.css";

// Устгахын өмнөх баталгаажуулах цонх (нийтлэг component, TASK-06)
export default function ConfirmDialog({ title, name, message, confirmLabel = "Устгах", onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    // Нээгдэхэд "Болих" дээр focus, хаагдахад өмнөх элемент рүү буцаана
    const previous = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onCancel]);

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        data-testid="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <img src={trash} alt="" />
        {name && <p className="confirm-name">{name}</p>}
        <p id="confirm-message" className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" data-testid="confirm-cancel" onClick={onCancel}>
            Болих
          </button>
          <button type="button" data-testid="confirm-delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
