import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../api/authFetch"; // Assuming you have a utility for authenticated fetch

function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    aboutMe: "",
    profile_image: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  useEffect(() => {
    fetchBusinesses();
  }, [pagination.current_page]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      // const response = await axios.get(
      //   `http://18.209.91.97:3030/api/nearby/getAllBussinesses`,
      //   {
      //     params: {
      //       page: pagination.current_page,
      //       limit: pagination.per_page,
      //     },
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      const response = await fetchWithAuth(
        `http://18.209.91.97:3030/api/nearby/getAllBussinesses`,
        {
          method: "GET",
          params: {
            page: pagination.current_page,
            limit: pagination.per_page,
          },
        }
      );  

      setBusinesses(response.data.data.businesses);
      setPagination({
        current_page: response.data.data.current_page,
        total_page: response.data.data.total_page,
        per_page: response.data.data.per_page,
        total_records: response.data.data.total_records,
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch businesses");
    }
  };

  const handleApprove = async (id) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to approve this business!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const token = localStorage.getItem("authToken");
          const response = await axios.put(
            `http://18.209.91.97:3030/api/nearby/update-business-status`,
            { businessId: id, status: true },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "Approved",
              text: "Business approved successfully",
              showConfirmButton: false,
              timer: 1500,
            });
            fetchBusinesses();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: response.data.message || "Failed to approve business",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to approve business",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleReject = async (id) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to reject this business!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, reject it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const token = localStorage.getItem("authToken");
          const response = await axios.put(
            `http://18.209.91.97:3030/api/nearby/update-business-status`,
            { businessId: id, status: false },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "Rejected",
              text: "Business rejected successfully",
              showConfirmButton: false,
              timer: 1500,
            });
            fetchBusinesses();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: response.data.message || "Failed to reject business",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to reject business",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark">NearBy Bussiness</h3>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Bussiness Category</th>
                  <th>Bussiness Name</th>
                  <th>Address</th>
                  <th>Listed By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business, idx) => (
                  <tr key={business._id}>
                    <td>{business.category_name}</td>
                    <td>{business.businessName}</td>
                    <td>{business.address}</td>
                    <td>{business.userName}</td>
                    <td>
                      {business.status === true ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <i
                        className="bi bi-check-circle text-success fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleApprove(business._id)}
                        title="Approve"
                      ></i>
                      <i
                        className="bi bi-x-circle text-danger fs-5 m-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleReject(business._id)}
                        title="Reject"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_page > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${
                    pagination.current_page === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                  >
                    Previous
                  </button>
                </li>

                {Array.from(
                  { length: pagination.total_page },
                  (_, i) => i + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === pagination.current_page ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    pagination.current_page === pagination.total_page
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default BusinessList;
