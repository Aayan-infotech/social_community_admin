import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getEventDropdownOptions,
  getBookedTicketsByEventId,
  formatTime,
} from "../../../service/event/event";
import { useDataTable } from "../../../hook/useDataTable";
import DataTable from "../../../components/admin/DataTable";

function BookedTickets() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const userState = useSelector((state) => state.user);
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState({});

  const {
    currentPage,
    setCurrentPage,
    data: bookedTicketsData,
    isLoading,
    isFetching,
  } = useDataTable({
    enabled: !!selectedEvent?.value,
    dataQueryFn: () =>
      getBookedTicketsByEventId(
        userState?.userInfo?.accessToken,
        selectedEvent?.value,
        currentPage
      ),
    dataQueryKey: ["bookedTickets", selectedEvent?.value],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEventDropdownOptions(
          userState?.userInfo?.accessToken
        );
        const formatted = data.map((event) => ({
          value: event._id,
          label: event.eventName,
        }));
        setEvents(formatted);
      } catch (err) {
        toast.error("Failed to load event options");
      }
    };
    fetchEvents();
  }, []);

  const handleView = (idx) => {
    const ticket = bookedTicketsData?.tickets[idx];
    setModalType("view");
    setSelectedTicket(ticket);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTicket({});
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="container">
        <div className="row mb-3">
          <div className="col-md-2">
            <label htmlFor="eventSelect" className="h6">
              Select Event
            </label>
          </div>
          <div className="col-md-10">
            <Select
              inputId="eventSelect"
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e);
                setCurrentPage(1); // reset pagination
              }}
              options={events}
              placeholder="Select an event"
              isClearable
              noOptionsMessage={() => "No events available"}
            />
          </div>
        </div>
      </div>
      {selectedEvent ? (
        <DataTable
          pageTitle={`Tickets for "${selectedEvent?.label}"`}
          dataListName="Tickets"
          searchInputPlaceHolder=""
          hideSearch
          tableHeaderTitleList={[
            { label: "Ticket ID", field: "ticketId" },
            { label: "Buyer Name", field: "userDetails.name" },
            { label: "Email", field: "userDetails.email" },
            { label: "Tickets", field: "ticketCount" },
            { label: "Booking Time", field: "bookingDate" },
            { label: "Status", field: "bookingStatus" },
            { label: "Actions", field: null },
          ]}
          isLoading={isLoading}
          isFetching={isFetching}
          data={bookedTicketsData?.tickets || []}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPageCount={bookedTicketsData?.total_page}
        >
          {bookedTicketsData?.tickets?.length > 0 ? (
            bookedTicketsData?.tickets.map((ticket, idx) => (
              <tr key={ticket?._id}>
                <td>{ticket?.ticketId}</td>
                <td>{ticket?.userDetails?.name}</td>
                <td>{ticket?.userDetails?.email}</td>
                <td>{ticket?.ticketCount}</td>
                <td>
                  {new Date(ticket?.bookingDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  - {formatTime(ticket?.bookingTime)}
                </td>
                <td>
                  <span
                    className={`badge ${
                      ticket?.bookingStatus === "booked"
                        ? "bg-success"
                        : ticket?.bookingStatus === "pending"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  >
                    {ticket?.bookingStatus}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleView(idx)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-2">
                No booked tickets found.
              </td>
            </tr>
          )}
        </DataTable>
      ) : (
        <div className="text-center text-muted mt-3">
          Please select an event to view booked tickets.
        </div>
      )}

      {/* Show Modal for Ticket Details */}
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
                <h5 className="modal-title">🎟️ Ticket Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" && selectedTicket && (
                  <div className="container-fluid">
                    {/* Ticket Header */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card border-0 bg-light">
                          <div className="card-body text-center">
                            <h4 className="card-title text-primary mb-1">
                              {selectedTicket?.ticketId}
                            </h4>
                            <p className="text-muted mb-0">Booking Reference</p>
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
                              {selectedTicket?.eventDetails?.eventImage && (
                                <div className="col-md-4 mb-3">
                                  <img
                                    src={selectedTicket.eventDetails.eventImage}
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
                                  {selectedTicket?.eventDetails?.eventName}
                                </h5>
                                <p className="mb-2">
                                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                                  <strong>Location:</strong>{" "}
                                  {selectedTicket?.eventDetails?.eventLocation}
                                </p>
                                <p className="mb-2">
                                  <i className="fas fa-calendar-alt text-success me-2"></i>
                                  <strong>Start:</strong>{" "}
                                  {formatDateTime(
                                    selectedTicket?.eventDetails?.eventStartDate
                                  )}{" "}
                                  {formatTime(
                                    selectedTicket?.eventDetails?.eventStartTime
                                  )}
                                </p>
                                <p className="mb-0">
                                  <i className="fas fa-calendar-check text-warning me-2"></i>
                                  <strong>End:</strong>{" "}
                                  {formatDateTime(
                                    selectedTicket?.eventDetails?.eventEndDate
                                  )}{" "}
                                  {formatTime(
                                    selectedTicket?.eventDetails?.eventEndTime
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-uppercase text-muted mb-3">
                          👤 Customer Information
                        </h6>
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              {selectedTicket?.userDetails?.profile_image && (
                                <img
                                  src={selectedTicket.userDetails.profile_image}
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
                                  {selectedTicket?.userDetails?.name}
                                </h6>
                                <small className="text-muted">Customer</small>
                              </div>
                            </div>
                            <div className="mb-2">
                              <i className="fas fa-envelope text-primary me-2"></i>
                              <small>
                                {selectedTicket?.userDetails?.email}
                              </small>
                            </div>
                            <div className="mb-2">
                              <i className="fas fa-phone text-success me-2"></i>
                              <small>
                                {selectedTicket?.userDetails?.mobile}
                              </small>
                            </div>
                            <div>
                              <i className="fas fa-user text-info me-2"></i>
                              <small>
                                ID: {selectedTicket?.userDetails?.userId}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="col-md-6">
                        <h6 className="text-uppercase text-muted mb-3">
                          📋 Booking Details
                        </h6>
                        <div className="card">
                          <div className="card-body">
                            <div className="row mb-3">
                              <div className="col-6">
                                <div className="text-center">
                                  <h4 className="text-primary mb-1">
                                    {selectedTicket?.ticketCount}
                                  </h4>
                                  <small className="text-muted">Tickets</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="text-center">
                                  <h4 className="text-success mb-1">
                                    {formatCurrency(selectedTicket?.totalPrice)}
                                  </h4>
                                  <small className="text-muted">
                                    Total Price
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div className="mb-2">
                              <i className="fas fa-calendar text-primary me-2"></i>
                              <small>
                                <strong>Booked:</strong>{" "}
                                {formatDateTime(selectedTicket?.bookingDate)}{" "}
                                {formatTime(selectedTicket?.bookingTime)}
                              </small>
                            </div>
                            <div className="mb-2">
                              <span className="me-2">📊</span>
                              <small>
                                <strong>Booking Status:</strong>
                              </small>
                              <span
                                className={`badge ms-2 ${
                                  selectedTicket?.bookingStatus === "booked"
                                    ? "bg-success"
                                    : selectedTicket?.bookingStatus ===
                                      "pending"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {selectedTicket?.bookingStatus?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="me-2">💳</span>
                              <small>
                                <strong>Payment Status:</strong>
                              </small>
                              <span
                                className={`badge ms-2 ${
                                  selectedTicket?.paymentStatus === "paid"
                                    ? "bg-success"
                                    : selectedTicket?.paymentStatus ===
                                      "pending"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {selectedTicket?.paymentStatus?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="row">
                      <div className="col-12">
                        <div className="card bg-light">
                          <div className="card-body">
                            <div className="row text-center">
                              <div className="col-md-3">
                                <div className="mb-2">
                                  <i className="fas fa-hashtag text-primary fs-4"></i>
                                </div>
                                <h6 className="mb-1">Booking ID</h6>
                                <small className="text-muted">
                                  {selectedTicket?._id}
                                </small>
                              </div>
                              <div className="col-md-3">
                                <div className="mb-2">
                                  <i className="fas fa-calendar-plus text-success fs-4"></i>
                                </div>
                                <h6 className="mb-1">Event ID</h6>
                                <small className="text-muted">
                                  {selectedTicket?.eventId}
                                </small>
                              </div>
                              <div className="col-md-3">
                                <div className="mb-2">
                                  <i className="fas fa-user-tag text-info fs-4"></i>
                                </div>
                                <h6 className="mb-1">User ID</h6>
                                <small className="text-muted">
                                  {selectedTicket?.userId}
                                </small>
                              </div>
                              <div className="col-md-3">
                                <div className="mb-2">
                                  <i className="fas fa-receipt text-warning fs-4"></i>
                                </div>
                                <h6 className="mb-1">Per Ticket</h6>
                                <small className="text-muted">
                                  {formatCurrency(
                                    selectedTicket?.totalPrice /
                                      selectedTicket?.ticketCount
                                  )}
                                </small>
                              </div>
                            </div>
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
                  <i className="fas fa-times me-2"></i>Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print me-2"></i>Print Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookedTickets;
