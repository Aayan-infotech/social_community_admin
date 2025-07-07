import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    category_image: "",
  });
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAddCategory = () => {
    setModalType("add");
    setFormData({
      category_name: "",
      category_image: "",
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setFormData({
      category_name: "",
      category_image: "",
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

      const response = await axios.post(
        `marketplace/upsert-category`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Category added successfully");
        setModalType(null);
        setFormData({
          category_name: "",
          category_image: "",
        });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to add category");
      }
    } catch (error) {
      toast.error("Failed to add category");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`marketplace/delete-marketplace-category/${id}`)
          .then((response) => {
            if (response.data.success) {
              Swal.fire({
                title: "Deleted!",
                text: "Category has been deleted.",
                icon: "success",
              });
              fetchCategories();
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.message || "Failed to delete category",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            Swal.fire({
              title: "Error!",
              text: error.message || "Failed to delete category",
              icon: "error",
            });
          });
      }
    });
  };

  const handleUpdate = async () => {
    try {

      const response = await axios.post(
        `marketplace/upsert-category`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Category updated successfully");
        setModalType(null);
        setFormData({
          category_name: "",
          category_image: "",
        });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
      setError(error.message || "An error occurred");
    }
  };

  const handleEdit = (index) => {
    setModalType("edit");
    setFormData({
      id: categories[index]._id,
      category_name: categories[index].category_name,
      category_image: categories[index].category_image,
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`marketplace/get-category`);

      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 bg-light">
          <Topbar />
          <div className="p-4 text-center text-danger">Error: {error}</div>
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
            <h3 className="fw-bold text-dark">MarketPlace Categories</h3>
            <Button
              title="Add Category"
              onClick={handleAddCategory}
              variant="primary"
            >
              Add Category
            </Button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Category Icon</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, idx) => (
                  <tr key={category._id}>
                    <td className="d-flex align-items-center gap-2 justify-content-start">
                      <img
                        src={
                          category.category_image || "./placeholder/person.png"
                        }
                        alt="avatar"
                        className="rounded-circle"
                        width="40"
                        height="40"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "./placeholder/person.png";
                        }}
                      />
                    </td>
                    <td>{category.category_name}</td>
                    <td>
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(idx)}
                        data-bs-toggle="modal"
                        title="Edit User"
                      ></i>
                      <i
                        className="bi bi-trash text-danger fs-5 m-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(category._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {modalType && (
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
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalType === "add"
                        ? "Add Category"
                        : "✏️ Edit Category"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {modalType === "add" ? (
                      <form encType="multipart/form-data">
                        <div className="mb-3">
                          <label className="form-label">Category Name</label>
                          <input
                            type="text"
                            name="category_name"
                            className="form-control"
                            value={formData.category_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category Image</label>
                          <input
                            type="file"
                            name="category_image"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  category_image: file,
                                }));
                              }
                            }}
                          />
                        </div>
                      </form>
                    ) : (
                      <form encType="multipart/form-data">
                        <div className="mb-3">
                          <input type="hidden" name="id" value={formData._id} />
                          <label className="form-label">Category Name</label>
                          <input
                            type="text"
                            name="category_name"
                            className="form-control"
                            value={formData.category_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category Image</label>
                          <input
                            type="file"
                            name="category_image"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  category_image: file,
                                }));
                              }
                            }}
                          />
                        </div>
                      </form>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                    {modalType === "add" ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                      >
                        Save changes
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdate}
                      >
                        Update changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
