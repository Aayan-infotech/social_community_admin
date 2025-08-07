import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import images from "../../contstants/images";
import { dateTimeFormat } from "../../service/event/event";
import { DatetimeFormatUTC } from "../../service/helper";

const ReportedPost = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalType, setModalType] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchReportedPosts();
  }, [pagination.current_page, sortConfig, debouncedSearchTerm]);

  const fetchReportedPosts = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
      });

      if (sortConfig.key) {
        params.append("sortBy", sortConfig.key);
        params.append("sortOrder", sortConfig.direction);
      }

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }

      const response = await axios.get(`posts/getAllReportedPosts?${params}`);
      const data = response.data.data;

      setPosts(data.reportedPosts || []);
      setPagination({
        current_page: data.current_page,
        total_page: data.total_page,
        per_page: data.per_page,
        total_records: data.total_records,
      });
    } catch (err) {
      toast.error("Failed to fetch reported posts");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    const isActive = sortConfig.key === key;
    const direction = sortConfig.direction;

    return (
      <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
        <i className={`bi bi-caret-up-fill ${isActive && direction === "asc" ? "text-white" : "text-secondary"}`} style={{ marginBottom: "-8px" }}></i>
        <i className={`bi bi-caret-down-fill ${isActive && direction === "desc" ? "text-white" : "text-secondary"}`}></i>
      </div>
    );
  };

  const handleView = (post) => {
    setSelectedPost(post);
    setModalType("view");
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setModalType(null);
  };

  return (
    <>
      <Table
        PageTitle="Reported Posts"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={posts.length}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <Th children="Post Details" sortIcon={getSortIcon("name")} onClick={() => handleSort("name")} />
              <Th children="Total Reports" sortIcon={getSortIcon("totalReports")} onClick={() => handleSort("totalReports")} />
              <Th children="Last Reported At" sortIcon={getSortIcon("latestReportTime")} onClick={() => handleSort("latestReportTime")} />
              {/* <Th children="Status" /> */}
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post._id}>
                  <td className="text-start">
                    <div className="d-flex gap-3 align-items-center">
                      <div>
                        {post?.post?.mediaType === "image" ? (
                          <img
                            src={post?.post?.media || images.placeholder}
                            alt="Post"
                            width="100"
                            height="70"
                            className="rounded"
                          />
                        ) : (
                          <video
                            src={post?.post?.media}
                            controls
                            width="100"
                            height="70"
                            className="rounded"
                          />
                        )}
                      </div>
                      <div>
                        <strong>{post?.post?.title || "No Title"}</strong>
                        <p className="m-0 small text-muted">
                          {post?.post?.description || "No Description"}
                        </p>
                        <small>
                          👍 {post?.post?.likes || 0} | 💬 {post?.post?.comments?.length || 0} | 🔁{" "}
                          {post?.post?.shares || 0}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{post.totalReports}</td>
                  <td>{DatetimeFormatUTC(post.latestReportTime)}</td>
                  {/* <td>
                    <span className={`badge text-bg-${post.status === "removed"
                        ? "danger"
                        : post.status === "resolved"
                        ? "success"
                        : post.status === "rejected"
                        ? "primary"
                        : "warning"
                      }`}>
                      {post.status}
                    </span>
                  </td> */}
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5"
                      title="View"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(post)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  {searchTerm ? "No posts found for search" : "No reported posts available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {modalType === "view" && selectedPost && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">👁️ View Reported Post</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <h6>Title: {selectedPost.post?.title}</h6>
                <p>{selectedPost.post?.description}</p>
                <p>Likes: {selectedPost.post?.likes || 0}</p>
                <p>Comments: {selectedPost.post?.comments?.length || 0}</p>
                <p>Shares: {selectedPost.post?.shares || 0}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportedPost;
