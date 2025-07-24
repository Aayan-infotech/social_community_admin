import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Link } from "react-router-dom";
import images from "../../contstants/images";
import { useDebounce } from "../../hook/useDebounce";
import Swal from "sweetalert2";
import Th from "../../components/Th";
import Table from "../../components/Table";

const ReportedPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    aboutMe: "",
    profile_image: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchPosts();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchPosts = async () => {
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

      const response = await axios.get(
        `posts/getAllReportedPosts?${params.toString()}`
      );
      console.log("Response Data:", response.data);

      setPosts(response?.data?.data?.reportedPosts);
      setPagination({
        current_page: response?.data?.data?.current_page,
        total_page: response?.data?.data?.total_page,
        per_page: response?.data?.data?.per_page,
        total_records: response?.data?.data?.total_records,
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch posts");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPagination((prev) => ({ ...prev, current_page: 1 })); // Reset to first page
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 })); // Reset to first page
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

  const handleView = (index) => {
    setSelectedUserIndex(index);
    setFormData({
      name: posts[index].name,
      email: posts[index].email,
      mobile: posts[index].mobile,
      gender: posts[index].gender,
      country: posts[index].country,
      state: posts[index].state,
      city: posts[index].city,
      aboutMe: posts[index].aboutMe || "Not provided",
      profile_image: posts[index].profile_image || images.placeholder,
    });
    setModalType("view");
  };

  const handleEdit = (index) => {
    setSelectedUserIndex(index);
    setFormData({
      name: posts[index].name,
      email: posts[index].email,
      mobile: posts[index].mobile,
      gender: posts[index].gender,
      country: posts[index].country,
      state: posts[index].state,
      city: posts[index].city,
      aboutMe: posts[index].aboutMe || "",
      profile_image: posts[index].profile_image || images.placeholder,
    });
    setModalType("edit");
  };

  const handleCloseModal = () => {
    setSelectedUserIndex(null);
    setModalType(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      gender: "",
      country: "",
      state: "",
      city: "",
      aboutMe: "",
      profile_image: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlock = async (index, type) => {
    setSelectedUserIndex(index);
    const userId = posts[index].userId;
    Swal.fire({
      title: "Are you sure?",
      text:
        type === "activate"
          ? "Do you want to activate this user?"
          : "Do you want to block this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText:
        type === "activate" ? "Yes, activate it!" : "Yes, block it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`posts/update-user-status/${userId}`, {
            isDeleted: type === "activate" ? false : true,
          });
          setPosts((prev) =>
            prev.map((user) =>
              user.userId === userId
                ? { ...user, isDeleted: type === "activate" ? false : true }
                : user
            )
          );
          Swal.fire(
            type === "activate" ? "Activated!" : "Blocked!",
            type === "activate"
              ? "User has been activated."
              : "User has been blocked.",
            "success"
          );
        } catch (error) {
          Swal.fire("Error!", "Failed to block user.", "error");
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const userId = posts[selectedUserIndex].userId;
      await axios.put(`posts/update-user/${userId}`, formData);

      const updatedposts = [...posts];
      updatedposts[selectedUserIndex] = {
        ...updatedposts[selectedUserIndex],
        ...formData,
      };
      setPosts(updatedposts);

      handleCloseModal();
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error(err.response.data.message || "Failed to update user");
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
        PageTitle=" Reported Posts"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={posts?.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th
                children="Post Details"
                sortIcon={getSortIcon("post")}
                onClick={() => handleSort("name")}
              />
              <Th
                children="Total Reports"
                sortIcon={getSortIcon("totalReports")}
                onClick={() => handleSort("totalReports")}
              />
              <Th
                children="Last Reported At"
                sortIcon={getSortIcon("lastReportedAt")}
                onClick={() => handleSort("lastReportedAt")}
              />
              <Th children="Status" />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {console.log("Posts:", posts)}
            {posts?.length > 0 ? (
              posts.map((post, idx) => (
                <tr key={post._id}>
                  <td className="">
                    <div className="d-flex items-start gap-4 p-1">
                      <div className="relative flex-shrink-0">
                        {post?.post?.mediaType === "image" ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={
                                post?.post?.media || "/api/placeholder/64/64"
                              }
                              alt="Post media"
                              className="w-full h-full object-cover"
                              style={{
                                borderRadius: "0.5rem",
                                width: "100px",
                                height: "70px",
                              }}
                            />
                          </div>
                        ) : (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md bg-gray-900 flex items-center justify-center">
                            <video
                              src={post?.post?.media}
                              className="w-full h-full object-cover"
                              controls
                              style={{
                                borderRadius: "0.5rem",
                                width: "100px",
                                height: "70px",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="font-semibold text-gray-900 truncate mb-1">
                          {post?.post?.title || "No title"}
                        </h6>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post?.post?.description || "No description"}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                            {post?.post?.likes || 0} likes |
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            {post?.post?.comments.length || 0} comments |
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            {post?.post?.shares || 0} shares
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{post.totalReports}</td>
                  <td>{post.latestReportTime}</td>
                  <td>
                    {post.status === "removed" ? (
                      <span className="badge text-bg-danger">Blocked</span>
                    ) : post.status === "resolved" ? (
                      <span className="badge text-bg-success">Resolved</span>
                    ) : post.status === "rejected" ? (
                      <span className="badge text-bg-primary">Rejected</span>
                    ) : (
                      <span className="badge text-bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {/* View Button To Show Details */}
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View Post"
                    ></i>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  {searchTerm
                    ? "No posts found matching your search"
                    : "No posts found"}
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
                  {modalType === "view" ? "👁️ View User" : "✏️ Edit User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
                  <div className="row">
                    <div className="col-md-4 text-center">
                      <img
                        src={formData.profile_image || images.placeholder}
                        alt="profile"
                        className="img-fluid rounded-circle mb-3"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = images.placeholder;
                        }}
                      />
                    </div>
                    <div className="col-md-8">
                      <p>
                        <strong>Name:</strong> {formData.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {formData.mobile}
                      </p>
                      <p>
                        <strong>Gender:</strong> {formData.gender}
                      </p>
                      <p>
                        <strong>Country:</strong> {formData.country}
                      </p>
                      <p>
                        <strong>State:</strong> {formData.state}
                      </p>
                      <p>
                        <strong>City:</strong> {formData.city}
                      </p>
                      <p>
                        <strong>About Me:</strong> {formData.aboutMe}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile</label>
                          <input
                            type="text"
                            name="mobile"
                            className="form-control"
                            value={formData.mobile}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Gender</label>
                          <select
                            name="gender"
                            className="form-select"
                            value={formData.gender}
                            onChange={handleChange}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            name="country"
                            className="form-control"
                            value={formData.country}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            name="state"
                            className="form-control"
                            value={formData.state}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Profile Image{" "}
                            <Link to={formData.profile_image} target="_blank">
                              View
                            </Link>
                          </label>
                          <input
                            type="file"
                            name="profile_image"
                            className="form-control"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">About Me</label>
                      <textarea
                        name="aboutMe"
                        className="form-control"
                        rows="3"
                        value={formData.aboutMe}
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
                {modalType === "edit" && (
                  <button
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

export default ReportedPost;
