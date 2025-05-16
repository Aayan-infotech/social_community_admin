import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";

function BusinessList() {
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
                      <th>Category Icon</th>
                      <th>Category Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {categories.map((category, idx) => (
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
                    ))} */}
                  </tbody>
                </table>
              </div>
    
              {/* Modal */}
              {/* {modalType && (
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
              )} */}
    
              <ToastContainer />
            </div>
          </div>
        </div>
  )
}

export default BusinessList
