import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../api/authFetch";

export default function SubcategoryPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subcategory_name: "",
    subcategory_image: "",
    category_id: "",
  });
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `http://18.209.91.97:3030/api/marketplace/get-category`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `http://18.209.91.97:3030/api/marketplace/get-subcategories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSubcategories(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch subcategories");
      }
    } catch (error) {
      toast.error("Failed to fetch subcategories");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleAddSubcategory = () => {
    setModalType("add");
    setFormData({
      subcategory_name: "",
      subcategory_image: "",
      category_id: "",
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setFormData({
      subcategory_name: "",
      subcategory_image: "",
      category_id: "",
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const payload = new FormData();
      payload.append("subcategory_name", formData.subcategory_name);
      payload.append("category_id", formData.category_id);
      if (formData.subcategory_image instanceof File) {
        payload.append("subcategory_image", formData.subcategory_image);
      }

      const response = await axios.post(
        `http://18.209.91.97:3030/api/marketplace/upsert-subcategory`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Subcategory added successfully");
        handleCloseModal();
        fetchSubcategories();
      } else {
        toast.error(response.data.message || "Failed to add subcategory");
      }
    } catch (error) {
      toast.error("Failed to add subcategory");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const payload = new FormData();
      payload.append("id", formData.id);
      payload.append("subcategory_name", formData.subcategory_name);
      payload.append("category_id", formData.category_id);
      if (formData.subcategory_image instanceof File) {
        payload.append("subcategory_image", formData.subcategory_image);
      }

      const response = await axios.post(
        `http://18.209.91.97:3030/api/marketplace/upsert-subcategory`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Subcategory updated successfully");
        handleCloseModal();
        fetchSubcategories();
      } else {
        toast.error(response.data.message || "Failed to update subcategory");
      }
    } catch (error) {
      toast.error("Failed to update subcategory");
      setError(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action is irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("authToken");
        axios
          .delete(
            `http://18.209.91.97:3030/api/marketplace/delete-subcategory/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((response) => {
            if (response.data.success) {
              Swal.fire("Deleted!", "Subcategory deleted.", "success");
              fetchSubcategories();
            } else {
              Swal.fire("Error!", response.data.message, "error");
            }
          })
          .catch((err) =>
            Swal.fire("Error!", err.message || "Deletion failed", "error")
          );
      }
    });
  };

  const handleEdit = (index) => {
    setModalType("edit");
    const sub = subcategories[index];
    setFormData({
      id: sub._id,
      subcategory_name: sub.subcategory_name,
      subcategory_image: sub.subcategory_image,
      category_id: sub.category_id,
    });
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c._id === id);
    return cat?.category_name || "Unknown";
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 bg-light">
          <Topbar />
          <div className="p-4 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark">Marketplace Subcategories</h3>
            <Button onClick={handleAddSubcategory} variant="primary">
              Add Subcategory
            </Button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Icon</th>
                  <th>Subcategory Name</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((sub, idx) => (
                  <tr key={sub._id}>
                    <td>
                      <img
                        src={sub.subcategory_image || "./placeholder/person.png"}
                        alt="icon"
                        width="40"
                        height="40"
                        className="rounded-circle"
                      />
                    </td>
                    <td>{sub.subcategory_name}</td>
                    <td>{getCategoryName(sub.category_id)}</td>
                    <td>
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(idx)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger fs-5 m-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(sub._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {modalType && (
            <div
              className="modal show fade d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalType === "add" ? "Add Subcategory" : "Edit Subcategory"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
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
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData((prev) => ({
                                ...prev,
                                subcategory_image: file,
                              }));
                            }
                          }}
                        />
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                      Close
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={modalType === "add" ? handleSave : handleUpdate}
                    >
                      {modalType === "add" ? "Save" : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}
