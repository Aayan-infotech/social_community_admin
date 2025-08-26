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
  getAllInterestCategories,
  createInterestCategory,
  updateInterestCategory,
  deleteInterestCategory,
} from "../../service/interest/interest";

const InterestCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ 
    key: "createdAt", 
    direction: "desc" 
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  
  // Form state
  const [categoryForm, setCategoryForm] = useState({
    category: "",
    type: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchCategories();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig, typeFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllInterestCategories(
        pagination.current_page,
        pagination.per_page,
        debouncedSearchTerm,
        sortConfig.key,
        sortConfig.direction,
        typeFilter
      );

      if (response.success) {
        setCategories(response.data.interestsCategories || []);
        setPagination({
          current_page: response.data.current_page || 1,
          total_page: response.data.total_page || 1,
          per_page: response.data.per_page || 10,
          total_records: response.data.total_records || 0,
        });
      } else {
        toast.error(response.message || "Failed to fetch categories");
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
        <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
          <i className="bi bi-caret-up-fill text-secondary" style={{ marginBottom: "-8px" }}></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    if (sortConfig.direction === "asc") {
      return (
        <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
          <i className="bi bi-caret-up-fill text-white" style={{ marginBottom: "-8px" }}></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    return (
      <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
        <i className="bi bi-caret-up-fill text-secondary" style={{ marginBottom: "-8px" }}></i>
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
          const response = await deleteInterestCategory(id);
          if (response.success) {
            toast.success("Category deleted successfully");
            fetchCategories();
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
    setCategoryForm({
      category: "",
      type: "",
    });
  };

  const handleAdd = () => {
    resetForm();
    setModalType("add");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleView = (category) => {
    setModalType("view");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setModalType("edit");
    setSelectedCategory(category);
    setCategoryForm({
      category: category.category || "",
      type: category.type || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedCategory(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!categoryForm.category.trim()) {
        toast.error("Category name is required");
        return;
      }
      if (!categoryForm.type.trim()) {
        toast.error("Category type is required");
        return;
      }

      let response;
      if (modalType === "add") {
        response = await createInterestCategory(categoryForm);
      } else if (modalType === "edit") {
        response = await updateInterestCategory(selectedCategory._id, categoryForm);
      }

      if (response?.success) {
        toast.success(
          modalType === "add"
            ? "Category added successfully"
            : "Category updated successfully"
        );
        handleCloseModal();
        fetchCategories();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        error.message ||
          `Failed to ${modalType === "add" ? "add" : "update"} category`
      );
    }
  };

  const renderCategoryForm = () => (
    <form>
      <div className="row">
        <div className="col-12 mb-3">
          <label htmlFor="category" className="form-label">
            Category Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={categoryForm.category}
            onChange={handleFormChange}
            placeholder="Enter category name"
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-3">
          <label htmlFor="type" className="form-label">
            Category Type <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="type"
            name="type"
            value={categoryForm.type}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Type</option>
            <option value="social">Social</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>
    </form>
  );

  const renderViewModal = () => (
    <div className="container-fluid">
      {/* Category Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h4 className="card-title text-primary mb-1">
                {CapitalizeFirstLetter(selectedCategory?.category)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Category Information */}
      <div className="row mb-4">
        <div className="col-12">
          <h6 className="text-uppercase text-muted mb-3">
            📂 Category Information
          </h6>
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <h5 className="text-primary mb-2">
                    {CapitalizeFirstLetter(selectedCategory?.category)}
                  </h5>
                  <p className="mb-2">
                    <i className="bi bi-tag-fill text-success me-2"></i>
                    <strong>Type:</strong>{" "}
                    {CapitalizeFirstLetter(selectedCategory?.type)}
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
      <select 
        className="form-select me-2" 
        style={{ width: "150px" }} 
        value={typeFilter} 
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="social">Social</option>
        <option value="professional">Professional</option>
      </select>
    );
  };

  return (
    <>
      <Table
        PageTitle="🏷️ Interest Categories"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={categories.length || 0}
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
                children="Category Name"
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
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <span>{CapitalizeFirstLetter(category.category)}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      category.type === 'professional' ? 'bg-primary' : 'bg-success'
                    }`}>
                      {CapitalizeFirstLetter(category.type)}
                    </span>
                  </td>
                  
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      {/* View Details */}
                      <i
                        className="bi bi-eye text-primary fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleView(category)}
                        title="View Details"
                      ></i>
                      
                      {/* Edit Category */}
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(category)}
                        title="Edit Category"
                      ></i>

                      {/* Delete Category */}
                      {/* <i
                        className="bi bi-trash text-danger fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(category._id)}
                        title="Delete Category"
                      ></i> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  {loading ? (
                    <div className="spinner-border text-primary" role="status"></div>
                  ) : (
                    "No categories found"
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
        title="Interest Category"
        onClose={handleCloseModal}
        onSubmit={modalType !== "view" ? handleSubmit : undefined}
      >
        {modalType === "view" ? renderViewModal() : renderCategoryForm()}
      </Modal>
    </>
  );
};

export default InterestCategories;