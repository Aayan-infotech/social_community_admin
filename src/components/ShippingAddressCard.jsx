import React from "react";

function ShippingAddressCard({ shippingAddress }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title">Shipping Address</h5>
        <p className="card-text">
          <i className="bi bi-telephone me-2"></i>
          {shippingAddress?.mobile || "N/A"}
          <br />
          <i className="bi bi-telephone me-2"></i>
          {shippingAddress?.alternate_mobile || "N/A"}
          <br />
          <i className="bi bi-geo-alt me-2"></i>
          {shippingAddress?.address} , {shippingAddress?.city || "N/A"} ,{" "}
          {shippingAddress?.state || "N/A"} {shippingAddress?.country || "N/A"} {shippingAddress?.pincode || "N/A"}
          
        </p>
      </div>
    </div>
  );
}

export default ShippingAddressCard;
