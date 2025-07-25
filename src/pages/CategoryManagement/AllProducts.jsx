import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import { CapitalizeFirstLetter } from "../../service/helper";
import ImageCarousle from "../../components/ImageCarousle";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
      });
      if (debouncedSearchTerm.trim())
        params.append("search", debouncedSearchTerm);
      if (sortConfig.key) {
        params.append("sortBy", sortConfig.key);
        params.append("sortOrder", sortConfig.direction);
      }

      const response = await axios.get(
        `marketplace/get-all-products?${params}`
      );
      if (response.data.success) {
        setProducts(response.data.data.products);
        setPagination({
          current_page: response.data.data.current_page,
          total_page: response.data.data.total_page,
          per_page: response.data.data.per_page,
          total_records: response.data.data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
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
  };

  const handleView = (product) => {
    setModalType("view");
    setSelectedProduct(product);
    console.log("Selected Product:", product);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  const handleStatusChange = async (id, status) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${
        status === "approved" ? "approve" : "reject"
      } this Product!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${
        status === "approved" ? "approve" : "reject"
      } it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`marketplace/updateProduct/${id}`, {
            status,
          });
          if (response.data.success) {
            toast.success(
              `Product ${
                status === "approved" ? "approved" : "rejected"
              } successfully`
            );
            fetchProducts();
          } else {
            toast.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to update product status"
          );
        }
      }
    });
  };

  return (
    <>
      <Table
        PageTitle="🛍️ All Products"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={products.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Product Image & Name"
                sortIcon={getSortIcon("product_name")}
                onClick={() => handleSort("product_name")}
              />
              <Th
                children="Price"
                sortIcon={getSortIcon("product_price")}
                onClick={() => handleSort("product_price")}
              />
              <Th
                children="Discount"
                sortIcon={getSortIcon("product_discount")}
                onClick={() => handleSort("product_discount")}
              />
              <Th
                children="Category"
                sortIcon={getSortIcon("category_name")}
                onClick={() => handleSort("category_name")}
              />
              <Th
                children="Subcategory"
                sortIcon={getSortIcon("subcategory_name")}
                onClick={() => handleSort("subcategory_name")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Action" />
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td className="d-flex align-items-center gap-2 justify-content-start">
                    <img
                      src={product.product_image[0]}
                      alt={product.product_name}
                      className="rounded"
                      width="40"
                      height="40"
                    />
                    <span>{product.product_name}</span>
                  </td>
                  <td>${product.product_price}</td>
                  <td>{product.product_discount}%</td>
                  <td>{product.category_name}</td>
                  <td>{product.subcategory_name}</td>
                  <td>
                    {product.status === "approved" ? (
                      <span className="badge bg-success">Approved</span>
                    ) : product.status === "rejected" ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(product)}
                      title="View Details"
                    ></i>

                    {product.status !== "approved" ? (
                      <i
                        className="bi bi-check2-circle text-success fs-5 me-3"
                        title="Activate User"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleStatusChange(product._id, "approved")
                        }
                      ></i>
                    ) : (
                      <i
                        className="bi bi-ban text-danger fs-5 me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleStatusChange(product._id, "rejected")
                        }
                        title="Block User"
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  {loading ? (
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  ) : (
                    "No products found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {modalType && selectedProduct && (
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
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">🛍️ Product Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <ImageCarousle images={selectedProduct?.product_image} />
                    </div>
                    <div className="col-md-6">
                      <h4 className="text-primary">
                        {CapitalizeFirstLetter(selectedProduct.product_name)}
                      </h4>
                      <p>
                        <strong>Category:</strong>{" "}
                        {CapitalizeFirstLetter(selectedProduct.category_name)}
                      </p>
                      <p>
                        <strong>Subcategory:</strong>{" "}
                        {CapitalizeFirstLetter(selectedProduct.subcategory_name)}
                      </p>
                      <p>
                        <strong>Price:</strong> ${selectedProduct.product_price}
                      </p>

                      <p>
                        <strong>Discount:</strong>{" "}
                        {selectedProduct.product_discount}%
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {selectedProduct.status === "approved" ? (
                          <span className="badge bg-success">Approved</span>
                        ) : selectedProduct.status === "rejected" ? (
                          <span className="badge bg-danger">Rejected</span>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </p>
                      <hr />
                      <h6 className="text-muted">👤 Seller Information</h6>
                      <div className="d-flex align-items-center">
                        <img
                          src={selectedProduct.profile_image}
                          alt="Seller"
                          className="rounded-circle me-3"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong>{selectedProduct.user_name}</strong>
                          <p className="mb-0">
                            <i className="bi bi-envelope me-2"></i>
                            {selectedProduct.user_email}
                          </p>
                          <p className="mb-0">
                            <i className="bi bi-person me-2"></i>ID:{" "}
                            {selectedProduct.user_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 mb-2">
                      <strong>Description:</strong>{" "}
                      {selectedProduct.product_description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
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

export default AllProducts;
