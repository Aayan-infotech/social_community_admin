import React from "react";
import UserDetailsCard from "./UserDetailsCard";
import ImageCarousle from "./ImageCarousle";
import { CapitalizeFirstLetter } from "../service/helper";

function ProductCard({ item }) {
  return (
    <div className="col-md-6 mb-4">
      <div className="card">
        <div className="card-body">
          <ImageCarousle images={item.product.image} />
          <h5 className="card-title mt-2 text-primary">{item.product.name}</h5>
          <p className="mb-1">Price: <span className="text-danger text-decoration-line-through text-bold">${item.product.price}</span> <span className="text-success text-bold">${item.product.price - (item.product.price * item.product.discount) / 100}</span></p>
          <p className="mb-1">Discount: {item.product.discount}%</p>
          <p className="mb-1">Quantity: {item.quantity}</p>
          <p className="mb-1">Amount: ${item.amount}</p>
          <p className="mb-1">Status: <span className={`badge bg-${item.status === "delivered" ? "success" : item.status === "placed" ? "info" : item.status === "cancelled" ? "danger" : "warning"}`}>{CapitalizeFirstLetter(item.status)}</span></p>
          <hr />
          <h6 className="text-muted">👤 Seller Information</h6>
          <UserDetailsCard
            profile_image={item.seller?.profile_image}
            user_name={item.seller?.name}
            user_email={item.seller?.email}
            user_id={item.seller?.id}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
