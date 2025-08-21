import { useState, useEffect } from "react";
// import "./Pages.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useDebounce } from "../../hook/useDebounce";
import Swal from "sweetalert2";
import Th from "../../components/Th";
import Table from "../../components/Table";

const InfoPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  useEffect(() => {
    fetchPages();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchPages = async () => {
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

      const response = await axios.get(`users/get-pages?${params.toString()}`);
      if (response.data.success) {
        const data = response.data.data?.infoPages || [];
        setPages(data);
        setPagination((prev) => ({
          ...prev,
          current_page: response.data.data.current_page || 1,
          total_page: response.data.data.total_page || 1,
          per_page: response.data.data.per_page || 10,
          total_records: response.data.data.total_records || data.length,
        }));
      } else {
        toast.error(response.data.message || "Failed to fetch pages");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch pages");
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
      return <SortIcon inactive />;
    }
    if (sortConfig.direction === "asc") {
      return <SortIcon asc />;
    }
    if (sortConfig.direction === "desc") {
      return <SortIcon desc />;
    }
  };

  const SortIcon = ({ inactive, asc, desc }) => (
    <div
      className="d-flex flex-column align-items-center"
      style={{ fontSize: "10px" }}
    >
      <i
        className={`bi bi-caret-up-fill ${
          inactive ? "text-secondary" : asc ? "text-white" : "text-secondary"
        }`}
        style={{ marginBottom: "-8px" }}
      ></i>
      <i
        className={`bi bi-caret-down-fill ${
          inactive ? "text-secondary" : desc ? "text-white" : "text-secondary"
        }`}
      ></i>
    </div>
  );

  const handleView = (index) => {
    setSelectedPageIndex(index);
    setFormData({
      title: pages[index].title,
      url: pages[index].url,
      description: pages[index].description,
    });
    setModalType("view");
  };

  const handleAdd = () => {
    setSelectedPageIndex(null);
    setFormData({
      title: "",
      url: "",
      description: "",
    });
    setModalType("add");
  };

  const handleEdit = (index) => {
    setSelectedPageIndex(index);
    setFormData({
      title: pages[index].title,
      url: pages[index].url,
      description: pages[index].description,
    });
    setModalType("edit");
  };

  const handleCloseModal = () => {
    setSelectedPageIndex(null);
    setModalType(null);
    setFormData({
      title: "",
      url: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setDisabled(true);
    try {
      const response = await axios.put(
        `users/update-page/${pages[selectedPageIndex]._id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Page saved successfully");
        fetchPages();
        handleCloseModal();
      } else {
        toast.error(response.data.message || "Failed to save page");
      }
    } catch (err) {
      toast.error("Failed to save page");
    } finally {
      setDisabled(false);
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
      <Table
        PageTitle="📄 Info Pages"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={pages?.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        addBtnLabel="Add Info Page"
        onAddClick={handleAdd}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th
                children="Page Name"
                sortIcon={getSortIcon("title")}
                onClick={() => handleSort("title")}
              />
              <Th
                children="Page URL"
                sortIcon={getSortIcon("url")}
                onClick={() => handleSort("url")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {pages.length > 0 ? (
              pages.map((page, idx) => (
                <tr key={page._id}>
                  <td>{page.title}</td>
                  <td>{page.url}</td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View Page"
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                      title="Edit Page"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  {searchTerm
                    ? "No pages found matching your search"
                    : "No pages found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* Modal */}
      {modalType && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "view"
                    ? "👁️ View Page"
                    : modalType === "add"
                    ? "➕ Add Page"
                    : "✏️ Edit Page"}
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
                      <strong>Page Name:</strong> {formData.title}
                    </p>
                    <p>
                      <strong>Page URL:</strong> {formData.url}
                    </p>
                    <p>
                      <strong>Description:</strong> {formData.description}
                    </p>
                  </div>
                ) : (
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Page Name</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Page URL</label>
                      <input
                        type="text"
                        name="url"
                        className="form-control"
                        value={formData.url}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Page Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        value={formData.description}
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
                {modalType !== "view" && (
                  <button
                    disabled={disabled}
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoPages;
