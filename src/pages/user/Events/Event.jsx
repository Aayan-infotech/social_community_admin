import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useDebounce } from "../../../hook/useDebounce";
import Table from "../../../components/Table";
import Th from "../../../components/Th";
import Modal from "../../../components/modal/Modal";
import { CapitalizeFirstLetter } from "../../../service/helper";
import {
  addEvent,
  dateFormatForInput,
  dateTimeFormat,
  getAllEvents,
  updateEvent,
} from "../../../service/event/event";

const Event = ({ type }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manager form state
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [showAddManagerForm, setShowAddManagerForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Form state for add/edit event
  const [eventForm, setEventForm] = useState({
    eventName: "",
    eventLocation: "",
    eventStartDate: "",
    eventEndDate: "",
    eventTimeStart: "",
    eventTimeEnd: "",
    ticketPrice: "",
    eventImage: null,
    eventDescription: "",
    isFreeEvent: "",
    noOfSlots: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Fetch events on paging/search/sort
  useEffect(() => {
    fetchEvents();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig, type , statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents(
        pagination.current_page,
        pagination.per_page,
        debouncedSearchTerm,
        type,
        sortConfig.key,
        sortConfig.direction,
        statusFilter
      );
      if (response?.success) {
        setEvents(response.data || []);
        setPagination({
          current_page: response.current_page || 1,
          total_page: response.total_pages || 1,
          per_page: response.per_page || 10,
          total_records: response.total_records || 0,
        });
      } else {
        toast.error(response?.message || "Failed to fetch events");
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
  };

  const resetForm = () => {
    setEventForm({
      eventName: "",
      eventLocation: "",
      eventStartDate: "",
      eventEndDate: "",
      eventTimeStart: "",
      eventTimeEnd: "",
      ticketPrice: "",
      eventImage: null,
      eventDescription: "",
      isFreeEvent: "",
      noOfSlots: "",
    });
    setManagerName("");
    setManagerEmail("");
    setShowAddManagerForm(false);
  };

  const handleAdd = () => {
    if (type === "upcoming" || type === "past") return; // Restrict adding for certain types
    resetForm();
    setModalType("add");
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleView = (event) => {
    setModalType("view");
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setModalType("edit");
    setSelectedEvent(event);
    setEventForm({
      eventName: event.eventName || "",
      eventLocation: event.eventLocation || "",
      eventStartDate: dateFormatForInput(event.eventStartDate) || "",
      eventEndDate: dateFormatForInput(event.eventEndDate) || "",
      eventTimeStart: event.eventTimeStart || "",
      eventTimeEnd: event.eventTimeEnd || "",
      ticketPrice: event.ticketPrice || "",
      eventImage: event.eventImage || null,
      eventDescription: event.eventDescription || "",
      isFreeEvent: event.isFreeEvent,
      noOfSlots: event.noOfSlots || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedEvent(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "isFreeEvent") {
      setEventForm((prev) => ({
        ...prev,
        isFreeEvent: value,
        ticketPrice: value === "true" ? "0" : prev.ticketPrice,
      }));
    } else {
      setEventForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventForm((prev) => ({
        ...prev,
        eventImage: file,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!eventForm.eventName.trim()) {
        toast.error("Event name is required");
        return;
      }
      if (!eventForm.eventLocation.trim()) {
        toast.error("Event location is required");
        return;
      }
      if (!eventForm.eventStartDate) {
        toast.error("Event start date is required");
        return;
      }
      if (!eventForm.eventEndDate) {
        toast.error("Event end date is required");
        return;
      }
      if (!eventForm.eventTimeStart) {
        toast.error("Event start time is required");
        return;
      }
      if (!eventForm.eventTimeEnd) {
        toast.error("Event end time is required");
        return;
      }
      if (!eventForm.noOfSlots || eventForm.noOfSlots <= 0) {
        toast.error("Number of slots must be greater than 0");
        return;
      }
      if (
        eventForm.isFreeEvent === "false" &&
        (!eventForm.ticketPrice || eventForm.ticketPrice <= 0)
      ) {
        toast.error("Ticket price is required for paid events");
        return;
      }
      if (!eventForm.eventDescription.trim()) {
        toast.error("Event description is required");
        return;
      }

      let response;
      if (modalType === "add") {
        response = await addEvent(eventForm);
      } else if (modalType === "edit") {
        response = await updateEvent(
          selectedEvent._id,
          eventForm
        );
      }

      if (response?.success || response?.message) {
        toast.success(
          modalType === "add"
            ? "Event added successfully"
            : "Event updated successfully"
        );
        handleCloseModal();
        fetchEvents();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${modalType === "add" ? "add" : "update"} event`
      );
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!managerName.trim()) {
      toast.error("Manager name is required");
      return;
    }
    if (!managerEmail.trim()) {
      toast.error("Manager email is required");
      return;
    }

    try {
      const response = await axios.post(`virtual-events/registration`, {
        eventId: selectedEvent._id,
        name: managerName,
        email: managerEmail,
      });

      if (response?.data?.success) {
        toast.success("Event manager added successfully");
        setShowAddManagerForm(false);
        setManagerName("");
        setManagerEmail("");
        setSelectedEvent((prev) => ({
          ...prev,
          eventManager: [
            ...(prev.eventManager || []),
            {
              name: managerName,
              email: managerEmail,
              username: response?.data?.data?.username,
              password: response?.data?.data?.password,
            },
          ],
        }));
      } else {
        toast.error(response?.data?.message || "Failed to add event manager");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add event manager"
      );
    }
  };

  const renderEventForm = () => (
    <form>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="eventName" className="form-label">
            Event Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="eventName"
            name="eventName"
            value={eventForm.eventName}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="eventLocation" className="form-label">
            Event Location <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="eventLocation"
            name="eventLocation"
            value={eventForm.eventLocation}
            onChange={handleFormChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="eventStartDate" className="form-label">
            Start Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            id="eventStartDate"
            name="eventStartDate"
            value={eventForm.eventStartDate}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="eventEndDate" className="form-label">
            End Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            id="eventEndDate"
            name="eventEndDate"
            value={eventForm.eventEndDate}
            onChange={handleFormChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="eventTimeStart" className="form-label">
            Start Time <span className="text-danger">*</span>
          </label>
          <input
            type="time"
            className="form-control"
            id="eventTimeStart"
            name="eventTimeStart"
            value={eventForm.eventTimeStart}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="eventTimeEnd" className="form-label">
            End Time <span className="text-danger">*</span>
          </label>
          <input
            type="time"
            className="form-control"
            id="eventTimeEnd"
            name="eventTimeEnd"
            value={eventForm.eventTimeEnd}
            onChange={handleFormChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="isFreeEvent" className="form-label">
            Free Event <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="isFreeEvent"
            name="isFreeEvent"
            value={eventForm.isFreeEvent ? "true" :  "false" }
            onChange={handleFormChange}
            required
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="ticketPrice" className="form-label">
            Ticket Price ($){" "}
            {eventForm.isFreeEvent === "false" && (
              <span className="text-danger">*</span>
            )}
          </label>
          <input
            type="number"
            className="form-control"
            id="ticketPrice"
            name="ticketPrice"
            value={eventForm.ticketPrice}
            onChange={handleFormChange}
            min="0"
            step="0.01"
            disabled={eventForm.isFreeEvent === "true"}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="noOfSlots" className="form-label">
            Number of Slots <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="noOfSlots"
            name="noOfSlots"
            value={eventForm.noOfSlots}
            onChange={handleFormChange}
            min="1"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="eventImage" className="form-label">
            Event Image
          </label>
          <input
            type="file"
            className="form-control"
            id="eventImage"
            name="eventImage"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="eventDescription" className="form-label">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          className="form-control"
          id="eventDescription"
          name="eventDescription"
          rows="4"
          value={eventForm.eventDescription}
          onChange={handleFormChange}
          required
        ></textarea>
      </div>
    </form>
  );

  const renderViewModal = () => (
    <div className="container-fluid">
      {/* Event Header */}
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
                    {CapitalizeFirstLetter(selectedEvent?.eventName)}
                  </h5>
                  <p className="mb-2">
                    <i className="bi bi-pin-map-fill text-danger me-2"></i>
                    <strong>Location:</strong>{" "}
                    {CapitalizeFirstLetter(selectedEvent?.eventLocation)}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar-event text-success me-2"></i>
                    <strong>Start:</strong>{" "}
                    {dateTimeFormat(
                      selectedEvent?.eventStartDate,
                      selectedEvent?.eventTimeStart
                    )}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar-check text-warning me-2"></i>
                    <strong>End:</strong>{" "}
                    {dateTimeFormat(
                      selectedEvent?.eventEndDate,
                      selectedEvent?.eventTimeEnd
                    )}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-currency-dollar text-info me-2"></i>
                    <strong>Ticket Price:</strong>{" "}
                    {selectedEvent?.isFreeEvent
                      ? "Free"
                      : `$${selectedEvent?.ticketPrice}`}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-people text-primary me-2"></i>
                    <strong>No of Slots:</strong> {selectedEvent?.noOfSlots}{" "}
                    slots
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    <strong>Status:</strong>{" "}
                    {selectedEvent?.status === "approved" ? (
                      <span className="badge bg-success">Approved</span>
                    ) : selectedEvent?.status === "rejected" ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-card-text text-info me-2"></i>
                    <strong>Description:</strong>{" "}
                    {CapitalizeFirstLetter(selectedEvent?.eventDescription)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedEvent?.status === "rejected" && (
          <div className="col-12">
            <div className="card mt-2">
              <div className="card-body">
                <h6 className="text-uppercase text-muted mb-0">
                  ❌ Rejection Reason
                </h6>
                {selectedEvent?.rejectionReason ? (
                  <p className="mb-0">
                    {CapitalizeFirstLetter(selectedEvent?.rejectionReason)}
                  </p>
                ) : (
                  <p className="mb-0 text-muted">
                    No rejection reason provided.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Managers Section */}
      <div className="row">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-uppercase text-muted mb-0">
                  🎟️ Event Managers
                </h6>
                {selectedEvent?.status === "approved" && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddManagerForm((prev) => !prev)}
                  >
                    {showAddManagerForm ? "Cancel" : "Add Manager"}
                  </button>
                )}
              </div>

              {showAddManagerForm && (
                <form className="row mb-3" onSubmit={handleAddManager}>
                  <div className="col-md-6 mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Manager Name"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Manager Email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Add Manager
                    </button>
                  </div>
                </form>
              )}

              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Manager Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvent?.eventManager?.length > 0 ? (
                    selectedEvent.eventManager.map((manager, idx) => (
                      <tr key={idx}>
                        <td>{manager.name}</td>
                        <td>{manager.email}</td>
                        <td>{manager.username}</td>
                        <td>{manager.password}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No managers assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () =>{
    return (
      <select className="form-select me-2" style={{ width: "150px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    );
  }

  return (
    <>
      <Table
        PageTitle={`📅 ${
          type ? CapitalizeFirstLetter(type) + " Events" : "Event Management"
        }`}
        pagination={pagination}
        setPagination={setPagination}
        dataLength={events.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        handleAdd={type !== "upcoming" && type !== "past" ? handleAdd : null}
        filters={renderFilters()}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Event Name"
                sortIcon={getSortIcon("eventName")}
                onClick={() => handleSort("eventName")}
              />
              <Th
                children="Location"
                sortIcon={getSortIcon("eventLocation")}
                onClick={() => handleSort("eventLocation")}
              />
              <Th
                children="Start Date"
                sortIcon={getSortIcon("eventStartDate")}
                onClick={() => handleSort("eventStartDate")}
              />
              <Th
                children="End Date"
                sortIcon={getSortIcon("eventEndDate")}
                onClick={() => handleSort("eventEndDate")}
              />
              <Th
                children="Slots"
                sortIcon={getSortIcon("noOfSlots")}
                onClick={() => handleSort("noOfSlots")}
              />
              <Th
                children="Price"
                sortIcon={getSortIcon("ticketPrice")}
                onClick={() => handleSort("ticketPrice")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event._id}>
                  <td>{event.eventName}</td>
                  <td>{event.eventLocation}</td>
                  <td>
                    {dateTimeFormat(event.eventStartDate, event.eventTimeStart)}
                  </td>
                  <td>
                    {dateTimeFormat(event.eventEndDate, event.eventTimeEnd)}
                  </td>
                  <td>{event.noOfSlots}</td>
                  <td>
                    {event.isFreeEvent ? "Free" : `$${event.ticketPrice}`}
                  </td>
                  <td>
                    {event.status === "approved" ? (
                      <span className="badge bg-success">Approved</span>
                    ) : event.status === "rejected" ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <i
                        className="bi bi-eye text-primary fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleView(event)}
                        title="View Details"
                      ></i>
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(event)}
                        title="Edit Event"
                      ></i>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
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

      <Modal
        isOpen={isModalOpen}
        type={modalType}
        title="Event"
        onClose={handleCloseModal}
        onSubmit={modalType !== "view" ? handleSubmit : undefined}
      >
        {modalType === "view" ? renderViewModal() : renderEventForm()}
      </Modal>
    </>
  );
};

export default Event;
