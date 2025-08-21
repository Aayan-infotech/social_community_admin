import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Table from "../../components/Table";
import Th from "../../components/Th";
import { useDebounce } from "../../hook/useDebounce";
import { CapitalizeFirstLetter } from "../../service/helper";
// import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProductOrder = ({ type = "" }) => {
  const userState = useSelector((state) => state.user);
  const role = userState?.userInfo?.role || [];
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalOrder, setModalOrder] = useState(null);
  const [showUpdateStatusForm, setShowUpdateStatusForm] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig, type]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
      });

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }

      if (sortConfig.key) {
        params.append("sortBy", sortConfig.key);
        params.append("sortOrder", sortConfig.direction);
      }
      if (type) {
        params.append("type", type);
      }

      const res = await axios.get(`/marketplace/get-orders?${params}`);
      if (res.data.success) {
        setOrders(res?.data?.data?.orders || []);
        setPagination({
          current_page: res?.data?.data?.current_page,
          total_page: res?.data?.data?.total_page,
          per_page: res?.data?.data?.per_page,
          total_records: res?.data?.data?.total_records,
        });
      } else {
        toast.error(res.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);

      // toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div
          className="d-flex flex-column align-items-center"
          style={{ fontSize: "10px" }}
        >
          <i
            className="bi bi-caret-up-fill text-secondary"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    if (sortConfig.direction === "asc") {
      return (
        <div
          className="d-flex flex-column align-items-center"
          style={{ fontSize: "10px" }}
        >
          <i
            className="bi bi-caret-up-fill text-white"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    if (sortConfig.direction === "desc") {
      return (
        <div
          className="d-flex flex-column align-items-center"
          style={{ fontSize: "10px" }}
        >
          <i
            className="bi bi-caret-up-fill text-secondary"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-white"></i>
        </div>
      );
    }
  };

  const handleSaveStatus = (itemId, newStatus) => {
    console.log("Changing status for item:", itemId, "to", newStatus);
  };

  return (
    <>
      <Table
        // PageTitle="📦  Orders"
        PageTitle={`📦  ${
          type === "placed"
            ? "Placed"
            : type === "cancelled"
            ? "Cancelled"
            : type === "delivered"
            ? "Completed"
            : "All"
        } Orders`}
        pagination={pagination}
        setPagination={setPagination}
        dataLength={orders.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Sl No."
                // sortIcon={getSortIcon("slNo")}
                // onClick={() => handleSort("slNo")}
              />
              <Th
                children="Order ID"
                sortIcon={getSortIcon("orderId")}
                onClick={() => handleSort("orderId")}
              />
              <Th
                children="Order Date"
                sortIcon={getSortIcon("createdAt")}
                onClick={() => handleSort("createdAt")}
              />
              <Th
                children="Order Amount"
                sortIcon={getSortIcon("orderAmount")}
                onClick={() => handleSort("orderAmount")}
              />
              <Th
                children="Total Products"
                sortIcon={getSortIcon("totalProducts")}
                onClick={() => handleSort("totalProducts")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th
                children="Payment Status"
                sortIcon={getSortIcon("paymentStatus")}
                onClick={() => handleSort("paymentStatus")}
              />
              <Th children="Action" />
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={order.orderId}>
                  <td>{index + 1}</td>
                  <td>{order.orderId}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalAmount}</td>
                  <td>{order.totalProducts}</td>
                  <td>
                    {" "}
                    <span
                      className={`badge bg-${
                        order?.status === "delivered"
                          ? "success"
                          : order?.status === "placed"
                          ? "info"
                          : order?.status === "cancelled"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {CapitalizeFirstLetter(order?.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "failed"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {order.paymentStatus || "N/A"}
                    </span>
                  </td>

                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5"
                      style={{ cursor: "pointer" }}
                      // onClick={() => setModalOrder(order)}
                      onClick={() => {
                        if (role.includes("admin")) {
                          navigate(`/admin/product-orders/${order.orderId}`);
                        } else if (role.includes("vendor")) {
                          navigate(`/user/orders/${order.orderId}`);
                        }
                      }}
                      title="View Order"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  {loading ? "Loading..." : "No orders found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* {modalOrder && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-fullscreen modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Order Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Order Id</th>
                      <td>{modalOrder.orderId}</td>
                    </tr>
                    <tr>
                      <th>Dated</th>
                      <td>{new Date(modalOrder.createdAt).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th
                        className="text-center font-weight-bold bg-primary text-white"
                        colSpan="2"
                      >
                        Buyer Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Full Name</th>
                      <td>{modalOrder.buyer?.name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{modalOrder.buyer?.email}</td>
                    </tr>
                    <tr>
                      <th>Mobile</th>
                      <td>{modalOrder.buyer?.mobile || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Address</th>
                      <td>{modalOrder.shippingAddress?.address}</td>
                    </tr>
                    <tr>
                      <th>Shipping Address</th>
                      <td>
                        {modalOrder?.shippingAddress?.mobile},{" "}
                        {modalOrder?.shippingAddress?.alternate_mobile || "-"} ,
                        {modalOrder.shippingAddress?.address} ,{" "}
                        {modalOrder?.shippingAddress?.city},{" "}
                        {modalOrder?.shippingAddress?.state},{" "}
                        {modalOrder?.shippingAddress?.country},{" "}
                        {modalOrder?.shippingAddress?.pincode}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="table table-bordered  mb-2">
                  <thead className="text-center font-weight-bold">
                    <tr>
                      <th className="bg-primary text-white">Product </th>
                      <th className="bg-primary text-white">Quantity</th>
                      <th className="bg-primary text-white">Price</th>
                      <th className="bg-primary text-white">Status</th>
                      <th className="bg-primary text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center font-weight-bold">
                          <ul className="list-group">
                            <li className="list-group-item">
                              <img
                                src={item?.product?.image[0]}
                                alt="Product"
                                className="img-fluid"
                                style={{
                                  maxHeight: "100px",
                                  maxWidth: "100px",
                                }}
                              />
                            </li>
                            <li className="list-group-item p-2 text-left d-flex">
                              <span className="w-50 d-block pr-2">
                                {" "}
                                Product Name{" "}
                              </span>
                              <span className="w-50 h-100 text-primary d-block">
                                {item?.product?.name}
                              </span>
                            </li>
                            <li className="list-group-item p-2 text-left d-flex">
                              <span className="w-50 d-block pr-2">
                                {" "}
                                Product Id{" "}
                              </span>
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
                              <span className="w-50 d-block pr-2">
                                Platform Fee
                              </span>
                              <span className="w-50 h-100 text-primary d-block">
                                $
                                {item?.amount * 0.1 -
                                  (item?.amount * 0.029 + 0.3)}
                              </span>
                            </li>
                            <li className="list-group-item p-2 text-left d-flex">
                              <span className="w-50 d-block pr-2">
                                Net Payable
                              </span>
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
                          <button type="button" className="btn btn-link">
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={2}
                        className="text-primary font-weight-bold h6"
                      >
                        Total Amount
                      </td>
                      <td colSpan={3} className="font-weight-bold">
                        $
                        {modalOrder?.items.reduce(
                          (acc, item) => acc + item.amount,
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        className="text-primary font-weight-bold h6"
                      >
                        Total Charges & Fees
                      </td>
                      <td colSpan={3} className="font-weight-bold">
                        $
                        {modalOrder?.items.reduce(
                          (acc, item) => acc + item.amount * 0.1,
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        className="text-primary font-weight-bold h6"
                      >
                        Net Payable Amount
                      </td>
                      <td colSpan={3} className="font-weight-bold">
                        $
                        {modalOrder?.items.reduce(
                          (acc, item) => acc + item.amount - item.amount * 0.1,
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-2 text-left">
                        <button
                          className="btn btn-primary btn-sm mb-2"
                          onClick={() => {
                            setShowUpdateStatusForm(!showUpdateStatusForm);
                          }}
                        >
                          Manage Status
                        </button>

                        {showUpdateStatusForm && (
                          <form
                            className="row row-cols-lg-2 align-items-center mb-2"
                            onSubmit={handleSaveStatus}
                          >
                            <div className="col-12">
                              <label
                                className="visually-hidden"
                                htmlFor="inlineFormInputGroupName"
                              >
                                Order Status
                              </label>
                              <div className="input-group">
                                <select
                                  className="form-select"
                                  id="inlineFormInputGroupName"
                                  onChange={(e) =>
                                    handleSaveStatus(
                                      modalOrder.orderId,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="placed">Placed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            <div className="col-12">
                              <label
                                className="visually-hidden"
                                htmlFor="inlineFormInputGroupEmail"
                              >
                                Email
                              </label>
                              <div className="input-group">
                                <input
                                  type="email"
                                  className="form-control"
                                  id="inlineFormInputGroupEmail"
                                  placeholder="Email"
                                />
                              </div>
                            </div>

                            <div className="col-12 mt-2">
                              <button
                                disabled={disabled}
                                type="submit"
                                className="btn btn-primary btn-sm"
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default ProductOrder;
