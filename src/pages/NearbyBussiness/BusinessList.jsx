import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
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

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchBusinesses();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchBusinesses = async () => {
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

      const response = await axios.get(`nearby/getAllBussinesses?${params}`);
      if (response.data.success) {
        setBusinesses(response.data.data.businesses);
        setPagination({
          current_page: response.data.data.current_page,
          total_page: response.data.data.total_page,
          per_page: response.data.data.per_page,
          total_records: response.data.data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch businesses");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch businesses");
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

  const handleStatusChange = async (id, status) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${status ? "approve" : "reject"} this business!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status ? "approve" : "reject"} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`nearby/update-business-status`, {
            businessId: id,
            status,
          });
          if (response.data.success) {
            toast.success(
              `Business ${status ? "approved" : "rejected"} successfully`
            );
            fetchBusinesses();
          } else {
            toast.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          toast.error("Failed to update business status");
        }
      }
    });
  };

  return (
    <>
      <Table
        PageTitle="🏢 NearBy Businesses"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={businesses.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th
                children="Business Category"
                sortIcon={getSortIcon("category.category_name")}
                onClick={() => handleSort("category.category_name")}
              />
              <Th
                children="Business Name"
                sortIcon={getSortIcon("businessName")}
                onClick={() => handleSort("businessName")}
              />
              <Th
                children="Address"
                sortIcon={getSortIcon("address")}
                onClick={() => handleSort("address")}
              />
              <Th
                children="Listed By"
                sortIcon={getSortIcon("user.name")}
                onClick={() => handleSort("user.name")}
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
            {businesses.length > 0 ? (
              businesses.map((business) => (
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
                      onClick={() => handleStatusChange(business._id, true)}
                      title="Approve"
                    ></i>
                    <i
                      className="bi bi-x-circle text-danger fs-5 m-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleStatusChange(business._id, false)}
                      title="Reject"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  {loading ? (
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  ) : (
                    "No businesses found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>
    </>
  );
};

export default BusinessList;
