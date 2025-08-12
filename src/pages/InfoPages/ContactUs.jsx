import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import { dateTimeFormat } from "../../service/event/event";

export default function ContactUs() {
  const [contactMessages, setContactMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch contact messages
  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/users/contact-us", {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
          search: debouncedSearch,
        },
      });
      setContactMessages(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, [page, limit, sortBy, sortOrder, debouncedSearch]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Contact Us Messages</h3>

      {/* Search input */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name, email, or subject"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
      >
        <thead>
          <tr>
            <Th onClick={() => handleSort("name")} sortBy={sortBy} sortOrder={sortOrder} field="name">Name</Th>
            <Th onClick={() => handleSort("email")} sortBy={sortBy} sortOrder={sortOrder} field="email">Email</Th>
            <Th onClick={() => handleSort("subject")} sortBy={sortBy} sortOrder={sortOrder} field="subject">Subject</Th>
            <Th onClick={() => handleSort("createdAt")} sortBy={sortBy} sortOrder={sortOrder} field="createdAt">Date</Th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contactMessages.length === 0 && !loading && (
            <tr>
              <td colSpan="5" className="text-center">No messages found</td>
            </tr>
          )}
          {contactMessages.map((msg) => (
            <tr key={msg._id}>
              <td>{msg.name}</td>
              <td>{msg.email}</td>
              <td>{msg.subject}</td>
              <td>{dateTimeFormat(msg.createdAt)}</td>
              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    setSelectedMessage(msg);
                    setShowModal(true);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* View Modal */}
      {showModal && selectedMessage && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Message Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Name:</strong> {selectedMessage.name}</p>
                <p><strong>Email:</strong> {selectedMessage.email}</p>
                <p><strong>Subject:</strong> {selectedMessage.subject}</p>
                <p><strong>Message:</strong> {selectedMessage.message}</p>
                <p><strong>Date:</strong> {dateTimeFormat(selectedMessage.createdAt)}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
