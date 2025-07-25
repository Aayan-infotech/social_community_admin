import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import images from "../../contstants/images";

const HealthWellness = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchResources();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchResources = async () => {
    try {
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
        `health-wellness/get-all-resources?${params}`
      );
      if (response.data.success) {
        setResources(response.data.data.resources);
        setPagination({
          current_page: response.data.data.current_page,
          total_page: response.data.data.total_page,
          per_page: response.data.data.per_page,
          total_records: response.data.data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch resources");
      }
    } catch (err) {
      toast.error("Error fetching resources");
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
    return sortConfig.direction === "asc" ? (
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
    ) : (
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

  const handleView = (resource) => {
    setSelectedResource(resource);
    setModalType("view");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedResource(null);
  };

  const handleStatusChange = async (id, status) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${
        status === "approved" ? "approve" : "reject"
      } this Resource!`,
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
          const response = await axios.put(`health-wellness/updateResource/${id}`, {
            status,
          });
          if (response.data.success) {
            toast.success(
              `Resource ${
                status === "approved" ? "approved" : "rejected"
              } successfully`
            );
            fetchResources();
          } else {
            toast.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          toast.error("Failed to update event status");
        }
      }
    });
  };

  return (
    <>
      <Table
        PageTitle="🧘 Health & Wellness Resources"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={resources.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Image & Title"
                sortIcon={getSortIcon("title")}
                onClick={() => handleSort("title")}
              />
              <Th
                children="Location"
                sortIcon={getSortIcon("location")}
                onClick={() => handleSort("location")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Posted By" />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {resources.length > 0 ? (
              resources.map((item) => (
                <tr key={item._id}>
                  <td className="d-flex align-items-center gap-2 justify-content-start">
                    <img
                      src={item.resourceImage || images.placeholder}
                      alt={item.title}
                      className="rounded"
                      width="40"
                      height="40"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = images.placeholder;
                      }}
                    />
                    <span>{item.title}</span>
                  </td>
                  <td>{item.location}</td>
                  <td>{item.user?.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === "approved"
                          ? "bg-success"
                          : item.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(item)}
                      title="View Details"
                    ></i>
                    {/* Add more actions if needed */}
                    {item.status !== "approved" ? (
                      <i
                        className="bi bi-check2-circle text-success fs-5 me-3"
                        title="Activate User"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleStatusChange(item._id, "approved")}
                      ></i>
                    ) : (
                      <i
                        className="bi bi-ban text-danger fs-5 me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleStatusChange(item._id, "rejected")}
                        title="Block User"
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No resources found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {modalType && selectedResource && (
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
                <h5 className="modal-title">🧘 Resource Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4 text-center">
                    <img
                      src={selectedResource.resourceImage || images.placeholder}
                      alt={selectedResource.title}
                      className="img-fluid rounded shadow"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <h5 className="text-primary">{selectedResource.title}</h5>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedResource.description}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedResource.location}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="badge bg-info">
                        {selectedResource.status}
                      </span>
                    </p>
                  </div>
                </div>
                <hr />
                <h6 className="text-muted">🧑 Posted By</h6>
                <div className="d-flex align-items-center">
                  <img
                    src={
                      selectedResource.user?.profile_image || images.placeholder
                    }
                    alt="User"
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                  />
                  <div>
                    <strong>{selectedResource.user?.name}</strong>
                    <br />
                    <small>ID: {selectedResource.user?.userId}</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
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

export default HealthWellness;
