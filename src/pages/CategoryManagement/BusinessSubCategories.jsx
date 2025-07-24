import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import images from "../../contstants/images";
import { useDebounce } from "../../hook/useDebounce";
import Swal from "sweetalert2";
import Table from "../../components/Table";
import Th from "../../components/Th";

const SubcategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [formData, setFormData] = useState({
    subcategory_name: "",
    subcategory_image: "",
    category_id: "",
  });
  const [disabled, setDisabled] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`marketplace/get-category`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubcategories = async () => {
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
        `marketplace/get-subcategories?${params}`
      );
      if (response.data.success) {
        setSubcategories(response.data.data?.subcategories || []);
        setPagination({
          current_page: response.data.data?.current_page,
          total_page: response.data.data?.total_page,
          per_page: response.data.data?.per_page,
          total_records: response.data.data?.total_records,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch subcategories");
      setError(err.message);
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

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c._id === id);
    return cat?.category_name || "Unknown";
  };

  const handleAdd = () => {
    setModalType("add");
    setFormData({ subcategory_name: "", subcategory_image: "", category_id: "" });
  };

  const handleEdit = (index) => {
    setSelectedIndex(index);
    const sub = subcategories[index];
    setFormData({
      id: sub._id,
      subcategory_name: sub.subcategory_name,
      subcategory_image: sub.subcategory_image,
      category_id: sub.category_id,
    });
    setModalType("edit");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "subcategory_image") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveOrUpdate = async () => {
    try {
      setDisabled(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) payload.append(key, formData[key]);
      });
      const response = await axios.post(
        `marketplace/upsert-subcategory`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        toast.success(
          `Subcategory ${modalType === "edit" ? "updated" : "added"} successfully`
        );
        handleCloseModal();
        fetchSubcategories();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving subcategory");
    } finally {
      setDisabled(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `marketplace/delete-subcategory/${id}`
          );
          if (res.data.success) {
            toast.success("Deleted successfully");
            fetchSubcategories();
          } else {
            toast.error(res.data.message);
          }
        } catch (err) {
          toast.error("Error deleting subcategory");
        }
      }
    });
  };

  const handleCloseModal = () => {
    setFormData({ subcategory_name: "", subcategory_image: "", category_id: "" });
    setModalType(null);
    setSelectedIndex(null);
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

  return (
    <>
      <Table
        PageTitle="📂 Subcategories"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={subcategories.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        handleAdd={handleAdd}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th children="Icon" />
              <Th
                children="Subcategory Name"
                sortIcon={getSortIcon("subcategory_name")}
                onClick={() => handleSort("subcategory_name")}
              />
              <Th children="Parent Category" 
                sortIcon={getSortIcon("category.category_name")}
                onClick={() => handleSort("category.category_name")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {subcategories.length > 0 ? (
              subcategories.map((sub, idx) => (
                <tr key={sub._id}>
                  <td>
                    <img
                      src={sub.subcategory_image || images.placeholder}
                      alt="icon"
                      className="rounded-circle"
                      width="40"
                      height="40"
                      onError={(e) => (e.target.src = images.placeholder)}
                    />
                  </td>
                  <td>{sub.subcategory_name}</td>
                  <td>{getCategoryName(sub.category_id)}</td>
                  <td>
                    <i
                      className="bi bi-pencil text-warning fs-5 me-3"
                      title="Edit"
                      onClick={() => handleEdit(idx)}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-trash text-danger fs-5"
                      title="Delete"
                      onClick={() => handleDelete(sub._id)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No subcategories found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {modalType && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "add" ? "➕ Add Subcategory" : "✏️ Edit Subcategory"}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form encType="multipart/form-data">
                  <div className="mb-3">
                    <label className="form-label">Subcategory Name</label>
                    <input
                      type="text"
                      name="subcategory_name"
                      className="form-control"
                      value={formData.subcategory_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Parent Category</label>
                    <select
                      name="category_id"
                      className="form-select"
                      value={formData.category_id}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subcategory Image</label>
                    <input
                      type="file"
                      name="subcategory_image"
                      className="form-control"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveOrUpdate}
                  disabled={disabled}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubcategoryPage;