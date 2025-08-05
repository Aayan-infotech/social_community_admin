import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Table from "../../components/Table";
import Th from "../../components/Th";
import { useDebounce } from "../../hook/useDebounce";
import ProductCard from "../../components/ProductCard";
import UserDetailsCard from "../../components/UserDetailsCard";
import ShippingAddressCard from "../../components/ShippingAddressCard";

const ProductOrder = () => {
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
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchOrders();
  }, [pagination.current_page, debouncedSearchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
      });
      const res = await axios.get(`/marketplace/get-orders?${params}`);
      if (res.data.success) {
        const { orders, current_page, total_page, per_page, total_records } =
          res.data.data;
        setOrders(orders);
        setPagination({ current_page, total_page, per_page, total_records });
      } else {
        toast.error(res.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  return (
    <>
      <Table
        PageTitle="📦 All Orders"
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
              <Th children="Order ID" />
              <Th children="Buyer Name" />
              <Th children="Total Products" />
              <Th children="Status" />
              <Th children="Payment Status" />
              <Th children="Order Date" />
              <Th children="Action" />
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.buyer?.name || "N/A"}</td>
                  <td>{order.items?.length}</td>
                  <td>
                    {/* Add Badge Status */}
                    <span
                      className={`badge bg-${
                        order.items?.[0]?.status === "delivered"
                          ? "success"
                          : order.items?.[0]?.status === "placed"
                          ? "info"
                          : order.items?.[0]?.status === "cancelled"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {order.items?.[0]?.status || "N/A"}
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
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => setModalOrder(order)}
                      title="View Order"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  {loading ? "Loading..." : "No orders found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {modalOrder && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Order #{modalOrder.orderId}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body">
                        <h5 className="card-title mb-3">
                          <i className="bi bi-person-circle me-2"></i>Buyer
                          Information
                        </h5>
                        <UserDetailsCard
                          profile_image={modalOrder.buyer?.profile_image}
                          user_name={modalOrder.buyer?.name}
                          user_email={modalOrder.buyer?.email}
                          user_id={modalOrder.buyer?.userId}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <ShippingAddressCard
                      shippingAddress={modalOrder.shippingAddress}
                    />
                  </div>
                </div>

                <hr />
                <h6 className="mt-4 mb-3">Order Items</h6>
                <div className="row">
                  {modalOrder.items.map((item, idx) => (
                    <ProductCard item={item} key={idx} />
                  ))}
                </div>
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
      )}
    </>
  );
};

export default ProductOrder;
