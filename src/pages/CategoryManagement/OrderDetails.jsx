import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CapitalizeFirstLetter } from "../../service/helper";
import { useSelector } from "react-redux";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [formData, setFormData] = useState({
    status: "placed",
    cancellationRemark: "",
    trackingId: "",
    carrierPartner: "",
  });
  const userState = useSelector((state) => state.user);
  const role = userState?.userInfo?.role || [];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`/marketplace/get-order/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch order details");
          if (role.includes("admin")) {
            navigate("/admin/product-orders");
          } else if (role.includes("vendor")) {
            navigate("/user/orders");
          }
        }
      } catch (err) {
        toast.error("Error fetching order");
        if (!role.includes("admin")) {
          navigate("/admin/product-orders");
        } else if (role.includes("vendor")) {
          navigate("/user/orders");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  useEffect(() => {
    if (modalType === "updateStatus" && order) {
      const item = order.items[0]; // You can adapt for multi-item support
      setFormData({
        status: item.status,
        cancellationRemark: item.cancellationRemark || "",
        trackingId: item.trackingId || "",
        carrierPartner: item.carrierPartner || "",
      });
    }
  }, [modalType, order]);

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setDisabled(true);

    const currentStatus = order?.items?.[0]?.status;
    const newStatus = formData.status;

    const invalidTransition =
      currentStatus === "cancelled" ||
      currentStatus === "delivered" ||
      (currentStatus === "shipped" && newStatus === "placed") ||
      (currentStatus === "delivered" && newStatus !== "delivered") ||
      (currentStatus === "shipped" && newStatus === "cancelled") ||
      (currentStatus === "placed" && newStatus === "placed");

    if (invalidTransition) {
      toast.error("Invalid status transition");
      setDisabled(false);
      return;
    }

    try {
      const res = await axios.put("/marketplace/order-status", {
        ...formData,
        orderId,
      });

      if (res.data.success) {
        toast.success("Order status updated successfully");

        const updated = await axios.get(`/marketplace/get-order/${orderId}`);
        if (updated.data.success) {
          setOrder(updated.data.data);
        }

        setModalType(null);
      } else {
        toast.error(res.data.message || "Failed to update order status");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Error updating order status"
      );
    } finally {
      setDisabled(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!order) return <div className="p-4">No order found</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Order Details</h4>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <table className="table table-bordered mb-4">
        <tbody>
          <tr>
            <th>Order Id</th>
            <td>{order.orderId}</td>
          </tr>
          <tr>
            <th>Dated</th>
            <td>{new Date(order.createdAt).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Buyer Details */}
      <table className="table table-bordered mb-4">
        <thead>
          <tr>
            <th colSpan="2" className="bg-primary text-white text-center">
              Buyer Details
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Full Name</th>
            <td>{order.buyer?.name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{order.buyer?.email}</td>
          </tr>
          <tr>
            <th>Mobile</th>
            <td>{order.buyer?.mobile || "N/A"}</td>
          </tr>
          <tr>
            <th>Shipping Address</th>
            <td>
              {order.shippingAddress?.mobile},{" "}
              {order.shippingAddress?.alternate_mobile || "-"},{" "}
              {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state}, {order.shippingAddress?.country},{" "}
              {order.shippingAddress?.pincode}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Product Items */}
      <table className="table table-bordered mb-4">
        <thead>
          <tr className="text-center">
            <th className="bg-primary text-white">Product</th>
            <th className="bg-primary text-white">Quantity</th>
            <th className="bg-primary text-white">Price</th>
            <th className="bg-primary text-white">Status</th>
            <th className="bg-primary text-white">Action</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td>
                {/* <img src={item.product?.image[0]} alt="product" style={{ maxWidth: "80px" }} />
                <div>{item.product?.name}</div>
                <small>ID: {item.product?._id}</small> */}

                <ul className="list-group">
                  <li className="list-group-item">
                    <img
                      src={item?.product?.product_image[0]}
                      alt="Product"
                      className="img-fluid"
                      style={{
                        maxHeight: "100px",
                        maxWidth: "100px",
                      }}
                    />
                  </li>
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2"> Product Name </span>
                    <span className="w-50 h-100 text-primary d-block">
                      {item?.product?.product_name}
                    </span>
                  </li>
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2"> Product Id </span>
                    <span className="w-50 h-100 text-primary d-block">
                      {item?.product?._id}
                    </span>
                  </li>
                </ul>
              </td>
              <td>{item.quantity}</td>
              <td className="text-center font-weight-bold">
                <ul className="list-group">
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2">Amount</span>
                    <span className="w-50 h-100 text-primary d-block">
                      ${item?.amount || 0}
                    </span>
                  </li>
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2">
                      Payment Gateway Fee
                    </span>
                    <span className="w-50 h-100 text-primary d-block">
                      ${item?.amount * 0.029 + 0.3}
                    </span>
                  </li>
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2">Platform Fee</span>
                    <span className="w-50 h-100 text-primary d-block">
                      ${item?.amount * 0.1 - (item?.amount * 0.029 + 0.3)}
                    </span>
                  </li>
                  <li className="list-group-item p-2 text-left d-flex">
                    <span className="w-50 d-block pr-2">Net Payable</span>
                    <span className="w-50 h-100 text-primary d-block">
                      ${item?.amount - item?.amount * 0.1}
                    </span>
                  </li>
                </ul>
              </td>
              <td>
                <span
                  className={`badge bg-${
                    item.status === "delivered"
                      ? "success"
                      : item.status === "placed"
                      ? "info"
                      : item.status === "cancelled"
                      ? "danger"
                      : "warning"
                  }`}
                >
                  {CapitalizeFirstLetter(item.status)}
                </span>
              </td>
              <td>
                <button className="btn btn-link btn-sm">Print Receipt</button>
              </td>
            </tr>
          ))}

          {/* Totals */}
          <tr>
            <td colSpan={2} className="text-end fw-bold text-primary">
              Total Amount
            </td>
            <td colSpan={3}>
              ${order.items.reduce((acc, item) => acc + item.amount, 0)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="text-end fw-bold text-primary">
              Total Charges & Fees
            </td>
            <td colSpan={3}>
              ${order.items.reduce((acc, item) => acc + item.amount * 0.1, 0)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="text-end fw-bold text-primary">
              Net Payable Amount
            </td>
            <td colSpan={3}>
              $
              {order.items.reduce(
                (acc, item) => acc + item.amount - item.amount * 0.1,
                0
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Seller Details Table  */}
      {role.includes("admin") && (
        <table className="table table-bordered mb-4">
          <thead>
            <tr>
              <th colSpan="2" className="bg-primary text-white text-center">
                Seller Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Full Name</th>
              <td>{order.seller?.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{order.seller?.email}</td>
            </tr>
            <tr>
              <th>Mobile</th>
              <td>{order.seller?.mobile || "N/A"}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>{order.seller?.address}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Manage Status Form */}

      {!role.includes("admin") && (
        <button
          className="btn btn-outline-primary btn-sm mb-3"
          onClick={() => setModalType("updateStatus")}
        >
          Manage Status
        </button>
      )}

      {modalType === "updateStatus" && (
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
                <h5 className="modal-title">Update Order Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveStatus}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="status">Order Status</label>

                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                    >
                      {formData.status === "placed" && (
                        <>
                          <option value="placed">Placed</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </>
                      )}

                      {formData.status === "shipped" && (
                        <>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </>
                      )}

                      {formData.status === "delivered" && (
                        <option value="delivered" disabled>
                          Delivered
                        </option>
                      )}

                      {formData.status === "cancelled" && (
                        <option value="cancelled" disabled>
                          Cancelled
                        </option>
                      )}
                    </select>
                  </div>
                  <div
                    className="mb-3"
                    style={{
                      display:
                        formData.status === "cancelled" ||
                        order?.items?.[0]?.status === "cancelled"
                          ? "block"
                          : "none",
                    }}
                  >
                    <label htmlFor="cancellationRemark">Remark</label>
                    <textarea
                      className="form-control"
                      id="cancellationRemark"
                      name="cancellationRemark"
                      rows="3"
                      placeholder="Add any remarks here..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancellationRemark: e.target.value,
                        })
                      }
                    >
                      {order?.items?.[0]?.cancellationRemark}
                    </textarea>
                  </div>
                  <div
                    className="mb-3"
                    style={{
                      display:
                        formData.status === "shipped" ||
                        order?.items?.[0]?.status === "shipped"
                          ? "block"
                          : "none",
                    }}
                  >
                    <label htmlFor="trackingId">Tracking Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="trackingId"
                      name="trackingId"
                      placeholder="Enter tracking number"
                      value={
                        order?.items?.[0]?.trackingId || formData.trackingId
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, trackingId: e.target.value })
                      }
                    />

                    <div className="mb-3">
                      <label htmlFor="carrierPartner">Carrier</label>
                      <input
                        type="text"
                        className="form-control"
                        id="carrierPartner"
                        name="carrierPartner"
                        placeholder="Enter carrier name"
                        value={
                          order?.items?.[0]?.carrierPartner ||
                          formData.carrierPartner
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            carrierPartner: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalType(null)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={disabled}
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
