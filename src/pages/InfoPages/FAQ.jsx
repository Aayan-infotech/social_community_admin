import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";

export default function Page() {
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const [modalType, setModalType] = useState(null); // "add" | "edit" | "view"
  const [loading, setLoading] = useState(true);

  const handleAdd = () => {
    setModalType("add");
    setFormData({ question: "", answer: "" });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setFormData({ question: "", answer: "" });
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
      const response = await axios.post(`users/FAQ`, formData);

      if (response.data.success) {
        toast.success("FAQ added successfully");
        setModalType(null);
        setFormData({ question: "", answer: "" });
        fetchFaqs();
      } else {
        toast.error(response.data.message || "Failed to add FAQ");
      }
    } catch (error) {
      toast.error("Failed to add FAQ");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`users/FAQ/${formData.id}`, formData);

      if (response.data.success) {
        toast.success("FAQ updated successfully");
        setModalType(null);
        setFormData({ question: "", answer: "" });
        fetchFaqs();
      } else {
        toast.error(response.data.message || "Failed to update FAQ");
      }
    } catch (error) {
      toast.error("Failed to update FAQ");
      setError(error.message || "An error occurred");
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
          .delete(`users/delete-faq/${id}`)
          .then((response) => {
            if (response.data.success) {
              Swal.fire("Deleted!", "FAQ has been deleted.", "success");
              fetchFaqs();
            } else {
              Swal.fire(
                "Error!",
                response.data.message || "Failed to delete FAQ",
                "error"
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              error.response.data.message || "Failed to delete FAQ",
              "error"
            );
          });
      }
    });
  };

  const handleEdit = (faq) => {
    setModalType("edit");
    setFormData({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
    });
  };

  const handleView = (faq) => {
    setModalType("view");
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`users/FAQ`);

      if (response.data.success) {
        setFaqs(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch FAQs");
      }
    } catch (error) {
      toast.error("Failed to fetch FAQs");
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
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
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">FAQ</h3>
        <Button title="Add FAQ" onClick={handleAdd} variant="primary">
          Add FAQ
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq._id}>
                <td>{faq.question}</td>
                <td>{faq.answer}</td>
                <td>
                  <i
                    className="bi bi-eye text-info fs-5 m-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleView(faq)}
                    title="View FAQ"
                  ></i>
                  <i
                    className="bi bi-pencil text-warning fs-5 m-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEdit(faq)}
                    title="Edit FAQ"
                  ></i>
                  <i
                    className="bi bi-trash text-danger fs-5 m-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(faq._id)}
                    title="Delete FAQ"
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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "add"
                    ? "➕ Add FAQ"
                    : modalType === "edit"
                    ? "✏️ Edit FAQ"
                    : "👁️ View FAQ"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
                  <div>
                    <p>
                      <strong>Question:</strong> {formData.question}
                    </p>
                    <p>
                      <strong>Answer:</strong> {formData.answer}
                    </p>
                  </div>
                ) : (
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Question</label>
                      <input
                        type="text"
                        name="question"
                        className="form-control"
                        value={formData.question}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Answer</label>
                      <textarea
                        name="answer"
                        className="form-control"
                        rows="4"
                        value={formData.answer}
                        onChange={handleChange}
                      ></textarea>
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
                {modalType === "add" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
                {modalType === "edit" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
