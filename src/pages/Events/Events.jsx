import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import { dateTimeFormat } from "../../service/event/event";
import { CapitalizeFirstLetter } from "../../service/helper";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchevents();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  const fetchevents = async () => {
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

      const response = await axios.get(`virtual-events/getAllEvents?${params}`);
      if (response.data.success) {
        setEvents(response.data.data.events);
        setPagination({
          current_page: response.data.data.current_page,
          total_page: response.data.data.total_page,
          per_page: response.data.data.per_page,
          total_records: response.data.data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch events");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch events");
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

  const handleStatusChange = async (id, status) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${status === "approved" ? "approve" : "reject"} this event!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status === "approved" ? "approve" : "reject"} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`virtual-events/updateEvent/${id}`, {
            status,
          });
          if (response.data.success) {
            toast.success(
              `Event ${status === "approved" ? "approved" : "rejected"} successfully`
            );
            fetchevents();
          } else {
            toast.error(response.data.message || "Operation failed");
          }
        } catch (error) {
          toast.error("Failed to update event status");
        }
      }
    });
  };

  const handleView = (event) => {
    setModalType("view");
    setSelectedEvent(event);
  };
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedEvent(null);
  };

  return (
    <>
      <Table
        PageTitle="🏢 All Events"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={events.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Event Image & Name"
                sortIcon={getSortIcon("eventName")}
                onClick={() => handleSort("eventName")}
              />
              <Th
                children="Event Location"
                sortIcon={getSortIcon("eventLocation")}
                onClick={() => handleSort("eventLocation")}
              />
              <Th
                children="Event Start Date & Time"
                sortIcon={getSortIcon("eventStartDate")}
                onClick={() => handleSort("eventStartDate")}
              />
              <Th
                children="Event End Date & Time"
                sortIcon={getSortIcon("eventEndDate")}
                onClick={() => handleSort("eventEndDate")}
              />
              <Th
                children="Organized By"
                sortIcon={getSortIcon("user.name")}
                onClick={() => handleSort("user.name")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Action" />
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event._id}>
                  <td className="d-flex align-items-center gap-2 justify-content-start">
                    <img
                      src={event.eventImage || images.placeholder}
                      alt={event.eventName}
                      className="rounded-circle"
                      width="40"
                      height="40"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = images.placeholder;
                      }}
                    />
                    <span>{event.eventName}</span>
                  </td>
                  <td>
                    {event.eventLocation.charAt(0).toUpperCase() +
                      event.eventLocation.slice(1)}
                  </td>
                  <td>
                    {dateTimeFormat(event.eventStartDate, event.eventTimeStart)}
                  </td>
                  <td>
                    {dateTimeFormat(event.eventEndDate, event.eventTimeEnd)}
                  </td>
                  <td>{event?.user?.name}</td>
                  <td>
                    {event.status === "approved" ? (
                      <span className="badge bg-success">Approved</span>
                    ) : 
                    event.status === "rejected" ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {/* View All Events Details */}
                    <i
                      className="bi bi-eye text-primary fs-5 me-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(event)}
                      title="View Details"
                    ></i>
                    {/* Approve / Block Event */}
                    {event.status !== "approved" ? (
                      <i
                        className="bi bi-check2-circle text-success fs-5 me-3"
                        title="Activate User"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleStatusChange(event._id, "approved")}
                      ></i>
                    ) : (
                      <i
                        className="bi bi-ban text-danger fs-5 me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleStatusChange(event._id, "rejected")}
                        title="Block User"
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  {loading ? (
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  ) : (
                    "No events found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

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
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">🎟️ Event Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" && selectedEvent && (
                  <div className="container-fluid">
                    {/* Ticket Header */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card border-0 bg-light">
                          <div className="card-body text-center">
                            <h4 className="card-title text-primary mb-1">
                              {CapitalizeFirstLetter(selectedEvent?.eventName)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-uppercase text-muted mb-3">
                          📅 Event Information
                        </h6>
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              {selectedEvent?.eventImage && (
                                <div className="col-md-4 mb-3">
                                  <img
                                    src={selectedEvent?.eventImage}
                                    alt="Event"
                                    className="img-fluid rounded"
                                    style={{
                                      maxHeight: "150px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              )}
                              <div className="col-md-8">
                                <h5 className="text-primary mb-2">
                                  {CapitalizeFirstLetter(
                                    selectedEvent?.eventName
                                  )}
                                </h5>
                                <p className="mb-2">
                                  <i className="bi bi-pin-map-fill text-danger me-2"></i>
                                  <strong>Location:</strong>{" "}
                                  {CapitalizeFirstLetter(
                                    selectedEvent?.eventLocation
                                  )}
                                </p>
                                <p className="mb-2">
                                  <i className="bi bi-calendar-event text-success me-2"></i>
                                  <strong>Start:</strong>{" "}
                                  {dateTimeFormat(
                                    selectedEvent?.eventStartDate,
                                    selectedEvent?.eventTimeStart
                                  )}
                                </p>
                                <p className="mb-0">
                                  <i className="bi bi-calendar-check text-warning me-2"></i>
                                  <strong>End:</strong>{" "}
                                  {dateTimeFormat(
                                    selectedEvent?.eventEndDate,
                                    selectedEvent?.eventTimeEnd
                                  )}
                                </p>
                                <p className="mb-0">
                                  <i className="bi bi-card-text text-info me-2"></i>
                                  <strong>Description:</strong>{" "}
                                  {CapitalizeFirstLetter(
                                    selectedEvent?.eventDescription
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted mb-3">
                          👤 Organizer Information
                        </h6>
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              {selectedEvent?.user?.profile_image && (
                                <img
                                  src={selectedEvent.user.profile_image}
                                  alt="Profile"
                                  className="rounded-circle me-3"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <div>
                                <h6 className="mb-0">
                                  {selectedEvent?.user?.name}
                                </h6>
                                <small className="text-muted">Organizer</small>
                              </div>
                            </div>
                            <div className="mb-2">
                              <i className="bi bi-envelope text-primary me-2"></i>
                              <small>{selectedEvent?.user?.email}</small>
                            </div>
                            <div className="mb-2">
                              <i className="bi bi-phone text-success me-2"></i>
                              <small>{selectedEvent?.user?.mobile}</small>
                            </div>
                            <div>
                              <i className="bi bi-person text-info me-2"></i>
                              <small>ID: {selectedEvent?.user?.userId}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-3">
                              🎟️ Event Managers
                            </h6>
                            <table className="table table-bordered table-striped">
                              <thead className="table-dark">
                                <tr>
                                  <th>Manager Name</th>
                                  <th>Email</th>
                                  <th>UserName</th>
                                  <th>Password</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedEvent?.eventManager?.length > 0 ? (
                                  selectedEvent.eventManager.map(
                                    (manager, idx) => (
                                      <tr key={idx}>
                                        <td>{manager.name}</td>
                                        <td>{manager.email}</td>
                                        <td>{manager.username}</td>
                                        <td>{manager.password}</td>
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan="4">No managers assigned</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
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

export default Events;
