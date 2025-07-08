import React from "react";

const Modal = ({ isOpen, type, title, onClose, onSubmit, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {type === "view"
                ? `👁️ View ${title}`
                : type === "edit"
                ? `✏️ Edit ${title}`
                : `➕ Add ${title}`}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">{children}</div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {type !== "view" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onSubmit}
              >
                {type === "edit" ? "Save Changes" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
