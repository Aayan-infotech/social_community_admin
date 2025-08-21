// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import { useSelector } from "react-redux";
// import {
//   getEventDropdownOptions,
//   getCancelledTicketsByEventId,
// } from "../../../service/event/event";
// import { useDataTable } from "../../../hook/useDataTable";
// import DataTable from "../../../components/admin/DataTable";

// function CancelledTickets() {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const userState = useSelector((state) => state.user);

//   const {
//     currentPage,
//     searchKeyword,
//     data: cancelledTicketsData,
//     isLoading,
//     isFetching,
//     setCurrentPage,
//     queryClient,
//   } = useDataTable({
//     enabled: !!selectedEvent,
//     dataQueryFn: () =>
//       getCancelledTicketsByEventId(
//         userState?.userInfo?.accessToken,
//         selectedEvent?.value,
//         currentPage
//       ),
//     dataQueryKey: [selectedEvent?.value],
//   });

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const data = await getEventDropdownOptions(
//           userState?.userInfo?.accessToken
//         );
//         const formatted = data.map((event) => ({
//           value: event._id,
//           label: event.eventName,
//         }));
//         setEvents(formatted);
//       } catch (err) {
//         toast.error("Failed to load event options");
//       }
//     };
//     fetchEvents();
//   }, []);

//   return (
//     <>
//       <div className="container">
//         <div className="row mb-3">
//           <div className="col-md-2">
//             <label htmlFor="eventSelect" className="h6">
//               Select Event
//             </label>
//           </div>
//           <div className="col-md-10">
//             <Select
//               inputId="eventSelect"
//               value={selectedEvent}
//               onChange={(e) => {
//                 setSelectedEvent(e);
//                 setCurrentPage(1); // reset pagination
//               }}
//               options={events}
//               placeholder="Select an event"
//               isClearable
//               noOptionsMessage={() => "No events available"}
//             />
//           </div>
//         </div>
//       </div>

//       {selectedEvent ? (
//         <DataTable
//           pageTitle={`Tickets for "${selectedEvent?.label}"`}
//           dataListName="Tickets"
//           searchInputPlaceHolder=""
//           hideSearch
//           tableHeaderTitleList={[
//             { label: "Ticket ID", field: "ticketId" },
//             { label: "Buyer Name", field: "userDetails.name" },
//             { label: "Email", field: "userDetails.email" },
//             { label: "Tickets", field: "ticketCount" },
//             { label: "Booking Time", field: "bookingDate" },
//             { label: "Status", field: "bookingStatus" },
//             { label: "Actions", field: null },
//           ]}
//           isLoading={isLoading}
//           isFetching={isFetching}
//           data={cancelledTicketsData?.tickets || []}
//           setCurrentPage={setCurrentPage}
//           currentPage={currentPage}
//           totalPageCount={cancelledTicketsData?.total_page}
//         >
//           {cancelledTicketsData?.tickets?.length > 0 ? (
//             cancelledTicketsData?.tickets.map((ticket) => (
//               <tr key={ticket?._id}>
//                 <td>{ticket?.ticketId}</td>
//                 <td>{ticket?.userDetails?.name}</td>
//                 <td>{ticket?.userDetails?.email}</td>
//                 <td>{ticket?.ticketCount}</td>
//                 <td>
//                   {new Date(ticket?.bookingDate).toLocaleDateString("en-US", {
//                     day: "numeric",
//                     month: "short",
//                     year: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     hour12: true,
//                   })}
//                 </td>
//                 <td>
//                   <span
//                     className={`badge ${
//                       ticket?.bookingStatus === "booked"
//                         ? "bg-success"
//                         : ticket?.bookingStatus === "pending"
//                         ? "bg-warning"
//                         : "bg-danger"
//                     }`}
//                   >
//                     {ticket?.bookingStatus}
//                   </span>
//                 </td>
//                 <td>
//                   <button
//                     className="btn btn-sm btn-primary"
//                     onClick={() => handleCancelTicket(ticket?._id)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={5} className="text-center py-2">
//                 No booked tickets found.
//               </td>
//             </tr>
//           )}
//         </DataTable>
//       ) : (
//         <div className="text-center text-muted mt-3">
//           Please select an event to view booked tickets.
//         </div>
//       )}
//     </>
//   );
// }

// export default CancelledTickets;


import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useDebounce } from "../../../hook/useDebounce";
import Table from "../../../components/Table";
import Th from "../../../components/Th";
import Modal from "../../../components/modal/Modal";
import { CapitalizeFirstLetter } from "../../../service/helper";
import Select from "react-select";
import {
  getEventDropdownOptions,
  getCancelledTicketsByEventId,
  formatTime,
} from "../../../service/event/event";

const CancelledTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "bookingDate",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const userState = useSelector((state) => state.user);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Fetch events dropdown options on component mount
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
  }, [userState?.userInfo?.accessToken]);

  useEffect(() => {
    if (selectedEvent) {
      fetchTickets();
    }
  }, [
    pagination.current_page,
    debouncedSearchTerm,
    sortConfig,
    selectedEvent,
    statusFilter,
  ]);

  const fetchTickets = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      const response = await getCancelledTicketsByEventId(
        selectedEvent,
        pagination.current_page,
        pagination.per_page,
        debouncedSearchTerm,
        sortConfig.key,
        sortConfig.direction,
        statusFilter
      );

      if (response?.success || response?.tickets) {
        setTickets(response.tickets || []);
        setPagination({
          current_page: response.current_page || 1,
          total_page: response.total_page || 1,
          per_page: response.per_page || 10,
          total_records: response.total_records || 0,
        });
      } else {
        toast.error(response?.message || "No tickets found");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to fetch booked tickets");
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

  const handleView = (ticket) => {
    setModalType("view");
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedTicket(null);
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

  const renderFilters = () => {
    return (
      <div className="d-flex gap-2 align-items-center">
        <div style={{ minWidth: "250px" }}>
          <Select
            value={selectedEvent}
            onChange={(selectedOption) => {
              setSelectedEvent(selectedOption);
              setPagination((prev) => ({ ...prev, current_page: 1 }));
              setTickets([]);
            }}
            options={events}
            placeholder="Search and select event..."
            isClearable
            isSearchable
            noOptionsMessage={() => "No events available"}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "38px",
                borderColor: state.isFocused ? "#0d6efd" : "#ced4da",
                boxShadow: state.isFocused
                  ? "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
                  : "none",
                "&:hover": {
                  borderColor: "#0d6efd",
                },
              }),
              placeholder: (base) => ({
                ...base,
                color: "#6c757d",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#0d6efd"
                  : state.isFocused
                  ? "#e9ecef"
                  : "white",
                color: state.isSelected ? "white" : "#212529",
                "&:hover": {
                  backgroundColor: state.isSelected ? "#0d6efd" : "#e9ecef",
                },
              }),
            }}
          />
        </div>
        <select
          className="form-select"
          style={{ width: "150px" }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, current_page: 1 }));
          }}
        >
          <option value="">Status</option>
          <option value="booked">Booked</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    );
  };

  const renderViewModal = () => (
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
                    {CapitalizeFirstLetter(
                      selectedTicket?.eventDetails?.eventName
                    )}
                  </h5>
                  <p className="mb-2">
                    <i className="bi bi-pin-map-fill text-danger me-2"></i>
                    <strong>Location:</strong>{" "}
                    {CapitalizeFirstLetter(
                      selectedTicket?.eventDetails?.eventLocation
                    )}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar-event text-success me-2"></i>
                    <strong>Start:</strong>{" "}
                    {formatDateTime(
                      selectedTicket?.eventDetails?.eventStartDate
                    )}{" "}
                    {formatTime(selectedTicket?.eventDetails?.eventStartTime)}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-calendar-check text-warning me-2"></i>
                    <strong>End:</strong>{" "}
                    {formatDateTime(selectedTicket?.eventDetails?.eventEndDate)}{" "}
                    {formatTime(selectedTicket?.eventDetails?.eventEndTime)}
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
                    {CapitalizeFirstLetter(selectedTicket?.userDetails?.name)}
                  </h6>
                  <small className="text-muted">Customer</small>
                </div>
              </div>
              <div className="mb-2">
                <i className="bi bi-envelope text-primary me-2"></i>
                <small>{selectedTicket?.userDetails?.email}</small>
              </div>
              <div className="mb-2">
                <i className="bi bi-phone text-success me-2"></i>
                <small>{selectedTicket?.userDetails?.mobile}</small>
              </div>
              <div>
                <i className="bi bi-person text-info me-2"></i>
                <small>ID: {selectedTicket?.userDetails?.userId}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="col-md-6">
          <h6 className="text-uppercase text-muted mb-3">📋 Booking Details</h6>
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
                    <small className="text-muted">Total Price</small>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <i className="bi bi-calendar text-primary me-2"></i>
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
                      : selectedTicket?.bookingStatus === "pending"
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
                      : selectedTicket?.paymentStatus === "pending"
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
                    <i className="bi bi-hash text-primary fs-4"></i>
                  </div>
                  <h6 className="mb-1">Booking ID</h6>
                  <small className="text-muted">{selectedTicket?._id}</small>
                </div>
                <div className="col-md-3">
                  <div className="mb-2">
                    <i className="bi bi-calendar-plus text-success fs-4"></i>
                  </div>
                  <h6 className="mb-1">Event ID</h6>
                  <small className="text-muted">
                    {selectedTicket?.eventId}
                  </small>
                </div>
                <div className="col-md-3">
                  <div className="mb-2">
                    <i className="bi bi-person-badge text-info fs-4"></i>
                  </div>
                  <h6 className="mb-1">User ID</h6>
                  <small className="text-muted">{selectedTicket?.userId}</small>
                </div>
                <div className="col-md-3">
                  <div className="mb-2">
                    <i className="bi bi-receipt text-warning fs-4"></i>
                  </div>
                  <h6 className="mb-1">Per Ticket</h6>
                  <small className="text-muted">
                    {formatCurrency(
                      selectedTicket?.totalPrice / selectedTicket?.ticketCount
                    )}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Table
        PageTitle="🎟️ Cancelled Tickets Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={tickets.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        handleAdd={null}
        filters={renderFilters()}
      >
        {selectedEvent ? (
          <table className="table table-bordered align-middle text-center table-striped text-nowrap">
            <thead className="table-dark">
              <tr>
                <Th
                  children="Ticket ID"
                  sortIcon={getSortIcon("ticketId")}
                  onClick={() => handleSort("ticketId")}
                />
                <Th
                  children="Buyer Name"
                  sortIcon={getSortIcon("userDetails.name")}
                  onClick={() => handleSort("userDetails.name")}
                />
                <Th
                  children="Email"
                  sortIcon={getSortIcon("userDetails.email")}
                  onClick={() => handleSort("userDetails.email")}
                />
                <Th
                  children="Tickets"
                  sortIcon={getSortIcon("ticketCount")}
                  onClick={() => handleSort("ticketCount")}
                />
                <Th
                  children="Booking Date"
                  sortIcon={getSortIcon("bookingDate")}
                  onClick={() => handleSort("bookingDate")}
                />
                <Th
                  children="Status"
                  sortIcon={getSortIcon("bookingStatus")}
                  onClick={() => handleSort("bookingStatus")}
                />
                <Th children="Actions" />
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.ticketId}</td>
                    <td>{CapitalizeFirstLetter(ticket.userDetails?.name)}</td>
                    <td>{ticket.userDetails?.email}</td>
                    <td>{ticket.ticketCount}</td>
                    <td>
                      {new Date(ticket.bookingDate).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}{" "}
                      - {formatTime(ticket.bookingTime)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ticket.bookingStatus === "booked"
                            ? "bg-success"
                            : ticket.bookingStatus === "pending"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {ticket.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <i
                          className="bi bi-eye text-primary fs-5"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleView(ticket)}
                          title="View Details"
                        ></i>
                      </div>
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
                      "No booked tickets found"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-muted mt-5 mb-5">
            <i className="bi bi-ticket-perforated display-1 text-muted"></i>
            <h5 className="mt-3">
              Please select an event to view cancelled tickets
            </h5>
            <p className="text-muted">
              Choose an event from the dropdown above to see its cancelled tickets.
            </p>
          </div>
        )}
      </Table>

      <Modal
        isOpen={isModalOpen}
        type={modalType}
        title="Ticket Details"
        onClose={handleCloseModal}
        footerButtons={[
          {
            text: "Close",
            variant: "secondary",
            onClick: handleCloseModal,
            icon: "bi-x",
          },
          {
            text: "Print Ticket",
            variant: "primary",
            onClick: () => window.print(),
            icon: "bi-printer",
          },
        ]}
      >
        {renderViewModal()}
      </Modal>
    </>
  );
};

export default CancelledTickets;
