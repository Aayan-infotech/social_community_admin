import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";

const DeleteUser = () => {
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState("");
  const [processing, setProcessing] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchDeleteRequests();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchDeleteRequests = async () => {
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

      const response = await axios.get(
        `users/get-all-delete-request?${params}`
      );
      if (response.data.success) {
        const data = response.data.data;
        setDeleteRequests(data.deleteRequests);
        setPagination({
          current_page: data.current_page,
          total_page: data.total_page,
          per_page: data.per_page,
          total_records: data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch delete requests");
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

    return (
      <div
        className="d-flex flex-column align-items-center"
        style={{ fontSize: "10px" }}
      >
        <i
          className={`bi bi-caret-up-fill ${
            sortConfig.direction === "asc" ? "text-white" : "text-secondary"
          }`}
          style={{ marginBottom: "-8px" }}
        ></i>
        <i
          className={`bi bi-caret-down-fill ${
            sortConfig.direction === "desc" ? "text-white" : "text-secondary"
          }`}
        ></i>
      </div>
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmation(true);
  };

  const processRequest = async () => {
    try {
      setProcessing(true);
      const response = await axios.put("users/update-delete-request", {
        requestId: selectedRequest._id,
        status: actionType,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Request processed");
        setDeleteRequests((prev) =>
          prev.filter((req) => req._id !== selectedRequest._id)
        );
      } else {
        toast.error(response.data.message || "Action failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setProcessing(false);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-danger">Error: {error}</div>;
  }

  return (
    <>
      {console.log(deleteRequests?.length || 0)}
      <Table
        PageTitle="🗑️ Delete Account Requests"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={deleteRequests?.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th
                children="User Info"
                sortIcon={getSortIcon("userInfo")}
                onClick={() => handleSort("userInfo")}
              />
              <Th
                children="Request Details"
                sortIcon={getSortIcon("createdAt")}
                onClick={() => handleSort("createdAt")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {Array.isArray(deleteRequests) && deleteRequests.length > 0 ? (
              deleteRequests.map((request, idx) => (
                <tr key={request._id || idx}>
                  <td className="text-start">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          request.profile_image || "https://i.pravatar.cc/40"
                        }
                        alt="avatar"
                        className="rounded-circle"
                        width="40"
                        height="40"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://i.pravatar.cc/40";
                        }}
                      />
                      <div>
                        <div className="fw-bold">{request.name}</div>
                        <div className="text-muted small">{request.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-start">
                    <strong>Reason:</strong>
                    <div>{request.reason || "No reason provided"}</div>
                    <div className="text-muted small mt-2">
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        request.status === "approved"
                          ? "bg-success"
                          : request.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {request.status || "pending"}
                    </span>
                  </td>
                  <td>
                    {!request.status || request.status === "pending" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleActionClick(request, "approved")}
                          disabled={processing}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleActionClick(request, "rejected")}
                          disabled={processing}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">Action taken</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  {searchTerm
                    ? "No delete requests match your search."
                    : "No delete requests found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Confirm {actionType === "approved" ? "Approval" : "Rejection"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmation(false)}
                  disabled={processing}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to <strong>{actionType}</strong> the
                  delete request for <strong>{selectedRequest?.name}</strong>?
                </p>
                {actionType === "approved" && (
                  <div className="alert alert-danger">
                    This will permanently delete the user's account!
                  </div>
                )}
                <div className="mt-3">
                  <strong>Reason:</strong>
                  <p className="border p-2 rounded mt-1">
                    {selectedRequest?.reason || "No reason provided"}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmation(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className={`btn ${
                    actionType === "approved" ? "btn-danger" : "btn-warning"
                  }`}
                  onClick={processRequest}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    `Confirm ${actionType}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUser;
