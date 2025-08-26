import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import Modal from "../../components/modal/Modal";
import { CapitalizeFirstLetter } from "../../service/helper";
import {
  getAllInterests,
  createInterest,
  updateInterest,
  deleteInterest,
  getAllInterestCategories,
} from "../../service/interest/interest";

const Interests = () => {
  const [interests, setInterests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Form state
  const [interestForm, setInterestForm] = useState({
    name: "",
    categoryId: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchInterests();
    fetchCategories();
  }, [
    pagination.current_page,
    debouncedSearchTerm,
    sortConfig,
    typeFilter,
    categoryFilter,
  ]);

  const fetchCategories = async () => {
    try {
      const response = await getAllInterestCategories(1, 100);
      if (response.success) {
        setCategories(response.data.interestsCategories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await getAllInterests(
        pagination.current_page,
        pagination.per_page,
        debouncedSearchTerm,
        sortConfig.key,
        sortConfig.direction,
        typeFilter,
        categoryFilter
      );

      if (response.success) {
        setInterests(response.data.interests || []);
        setPagination({
          current_page: response.data.current_page || 1,
          total_page: response.data.total_page || 1,
          per_page: response.data.per_page || 10,
          total_records: response.data.total_records || 0,
        });
      } else {
        toast.error(response.message || "Failed to fetch interests");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteInterest(id);
          if (response.success) {
            toast.success("Interest deleted successfully");
            fetchInterests();
          } else {
            toast.error(response.message || "Delete failed");
          }
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  const resetForm = () => {
    setInterestForm({
      name: "",
      categoryId: "",
    });
  };

  const handleAdd = () => {
    resetForm();
    setModalType("add");
    setSelectedInterest(null);
    setIsModalOpen(true);
  };

  const handleView = (interest) => {
    setModalType("view");
    setSelectedInterest(interest);
    setIsModalOpen(true);
  };

  const handleEdit = (interest) => {
    setModalType("edit");
    setSelectedInterest(interest);
    console.log(interest);
    setInterestForm({
      name: interest.name || "",
      categoryId: interest.categoryId || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedInterest(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInterestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!interestForm.name.trim()) {
        toast.error("Interest name is required");
        return;
      }
      if (!interestForm.categoryId.trim()) {
        toast.error("Category is required");
        return;
      }

      let response;
      if (modalType === "add") {
        console.log(interestForm);
        response = await createInterest(interestForm);
      } else if (modalType === "edit") {
        response = await updateInterest(selectedInterest._id, interestForm);
      }

      if (response?.success) {
        toast.success(
          modalType === "add"
            ? "Interest added successfully"
            : "Interest updated successfully"
        );
        handleCloseModal();
        fetchInterests();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        error.message ||
          `Failed to ${modalType === "add" ? "add" : "update"} interest`
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.category : "Unknown Category";
  };

  const renderInterestForm = () => (
    <form>
      <div className="row">
        <div className="col-12 mb-3">
          <label htmlFor="name" className="form-label">
            Interest Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={interestForm.name}
            onChange={handleFormChange}
            placeholder="Enter interest name"
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-3">
          <label htmlFor="categoryId" className="form-label">
            Category <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="categoryId"
            name="categoryId"
            value={interestForm.categoryId}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {CapitalizeFirstLetter(category.category)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );

  const renderViewModal = () => (
    <div className="container-fluid">
      {/* Interest Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="card-title text-primary mb-1">
                {CapitalizeFirstLetter(selectedInterest?.name)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Information */}
      <div className="row mb-4">
        <div className="col-12">
          <h6 className="text-uppercase text-muted mb-3">
            🎯 Interest Information
          </h6>
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <h5 className="text-primary mb-2">
                    {CapitalizeFirstLetter(selectedInterest?.name)}
                  </h5>
                  <p className="mb-2">
                    <i className="bi bi-folder-fill text-info me-2"></i>
                    <strong>Category:</strong>{" "}
                    {CapitalizeFirstLetter(selectedInterest?.category)}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-tag-fill text-success me-2"></i>
                    <strong>Type:</strong>{" "}
                    {CapitalizeFirstLetter(selectedInterest?.type)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => {
    return (
      <div className="d-flex gap-2">
        <select
          className="form-select"
          style={{ width: "150px" }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="social">Social</option>
          <option value="professional">Professional</option>
        </select>

        <select
          className="form-select"
          style={{ width: "200px" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {CapitalizeFirstLetter(category.category)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <>
      <Table
        PageTitle="🎯 Interests"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={interests.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        handleAdd={handleAdd}
        filters={renderFilters()}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Interest Name"
                sortIcon={getSortIcon("name")}
                onClick={() => handleSort("name")}
              />
              <Th
                children="Category"
                sortIcon={getSortIcon("category")}
                onClick={() => handleSort("category")}
              />
              <Th
                children="Type"
                sortIcon={getSortIcon("type")}
                onClick={() => handleSort("type")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {interests.length > 0 ? (
              interests.map((interest) => (
                <tr key={interest._id}>
                  <td>
                    <span>{CapitalizeFirstLetter(interest.name)}</span>
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {CapitalizeFirstLetter(interest.category)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        interest.type === "professional"
                          ? "bg-primary"
                          : "bg-success"
                      }`}
                    >
                      {CapitalizeFirstLetter(interest.type)}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      {/* View Details */}
                      <i
                        className="bi bi-eye text-primary fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleView(interest)}
                        title="View Details"
                      ></i>

                      {/* Edit Interest */}
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(interest)}
                        title="Edit Interest"
                      ></i>

                      {/* Delete Interest */}
                      {/* <i
                        className="bi bi-trash text-danger fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(interest._id)}
                        title="Delete Interest"
                      ></i> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  {loading ? (
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  ) : (
                    "No interests found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      <Modal
        isOpen={isModalOpen}
        type={modalType}
        title="Interest"
        onClose={handleCloseModal}
        onSubmit={modalType !== "view" ? handleSubmit : undefined}
      >
        {modalType === "view" ? renderViewModal() : renderInterestForm()}
      </Modal>
    </>
  );
};

export default Interests;
