import React from "react";


function Th({ children, onClick, sortIcon }) {
  return (
    <th style={{ cursor: "pointer" }} onClick={onClick}>
      <div className="d-flex align-items-center justify-content-between">
        {children}
        {sortIcon}
      </div>
    </th>
  );
}

export default Th;
