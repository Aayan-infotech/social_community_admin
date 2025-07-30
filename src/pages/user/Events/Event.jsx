import React, { useState } from "react";
import DataTable from "../../../components/admin/DataTable";
import images from "../../../contstants/images";
import { useDataTable } from "../../../hook/useDataTable";
import {
  combineDateAndTime,
  dateFormatForInput,
  dateTimeFormat,
  formatTime,
  getAllEvents,
  updateEvent,
} from "../../../service/event/event";
import { toast } from "react-toastify";
import { CapitalizeFirstLetter } from "../../../service/helper";
import axios from "axios";

function Event({ type }) {
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [showAddManagerForm, setShowAddManagerForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    eventName: "",
    eventLocation: "",
    eventStartDate: "",
    eventEndDate: "",
    eventTimeStart: "",
    eventTimeEnd: "",
    ticketPrice: "",
    eventImage: null,
    eventDescription: "",
  });

  const handleView = (index) => {
    setSelectedEvent(eventsData?.data[index]);
    setFormData({
      eventName: eventsData?.data[index]?.eventName || "",
      eventLocation: eventsData?.data[index]?.eventLocation || "",
      eventStartDate: eventsData?.data[index]?.eventStartDate || "",
      eventEndDate: eventsData?.data[index]?.eventEndDate || "",
      eventTimeStart: eventsData?.data[index]?.eventTimeStart || "",
      eventTimeEnd: eventsData?.data[index]?.eventTimeEnd || "",
      ticketPrice: eventsData?.data[index]?.ticketPrice || "",
      eventImage: eventsData?.data[index]?.eventImage || null,
      eventDescription: eventsData?.data[index]?.eventDescription || "",
    });
    setModalType("view");
  };

  const handleEdit = (index) => {
    setSelectedEvent(eventsData?.data[index]);
    setFormData({
      eventName: eventsData?.data[index]?.eventName || "",
      eventLocation: eventsData?.data[index]?.eventLocation || "",
      eventStartDate:
        dateFormatForInput(eventsData?.data[index]?.eventStartDate) || "",
      eventEndDate:
        dateFormatForInput(eventsData?.data[index]?.eventEndDate) || "",
      eventTimeStart: eventsData?.data[index]?.eventTimeStart || "",
      eventTimeEnd: eventsData?.data[index]?.eventTimeEnd || "",
      ticketPrice: eventsData?.data[index]?.ticketPrice || "",
      eventImage: eventsData?.data[index]?.eventImage || null,
      eventDescription: eventsData?.data[index]?.eventDescription || "",
    });
    setModalType("edit");
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setFormData({
      _id: "",
      eventName: "",
      eventLocation: "",
      eventStartDate: "",
      eventEndDate: "",
      eventTimeStart: "",
      eventTimeEnd: "",
      ticketPrice: "",
      eventImage: null,
      eventDescription: "",
    });
    setModalType(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        eventImage: file,
      }));
    }
  };

  const handleUpdateEvent = async () => {
    try {
      const updatedEvent = await updateEvent(
        userState?.userInfo?.accessToken,
        selectedEvent?._id,
        formData
      );
      toast.success("Event updated successfully");
      queryClient.invalidateQueries(["events"]);
      handleCloseModal();
      setFormData({
        _id: "",
        eventName: "",
        eventLocation: "",
        eventStartDate: "",
        eventEndDate: "",
        eventTimeStart: "",
        eventTimeEnd: "",
        ticketPrice: "",
        eventImage: null,
        eventDescription: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update event";
      toast.error(errorMessage);
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!managerName) {
      toast.error("Manager name is required");
      return;
    }
    if (!managerEmail) {
      toast.error("Manager email is required");
      return;
    }
    setDisabled(true);
    try {
      const response = await axios.post(`virtual-events/registration`, {
        eventId: selectedEvent._id,
        name: managerName,
        email: managerEmail,
      });
      if (response?.data?.success) {
        console.log(response.data);
        setDisabled(false);
        toast.success("Event manager added successfully");
        setShowAddManagerForm(false);
        setManagerName("");
        setManagerEmail("");
        setSelectedEvent((prev) => ({
          ...prev,
          eventManager: [
            ...prev.eventManager,
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
      console.log(error);
      setDisabled(false);
      toast.error(
        error?.response?.data?.message || "Failed to add event manager"
      );
    }
  };

  const {
    userState,
    currentPage,
    searchKeyword,
    data: eventsData,
    isLoading,
    isFetching,
    isLoadingDeleteData,
    queryClient,
    searchKeywordHandler,
    submitSearchKeywordHandler,
    deleteDataHandler,
    setCurrentPage,
  } = useDataTable({
    dataQueryFn: () =>
      getAllEvents(
        userState?.userInfo?.accessToken,
        currentPage,
        10,
        searchKeyword,
        type
      ),
    dataQueryKey: ["events", type],
    deleteDataMessage: "Event is deleted",
    mutateDeleteFn: ({ slug, token }) => {
      return deleteEvent({
        slug,
        token,
      });
    },
  });

  return (
    <>
      <DataTable
        pageTitle={type ? type + " Events" : "My Events"}
        dataListName="Events"
        searchInputPlaceHolder="Event's name..."
        searchKeywordOnSubmitHandler={submitSearchKeywordHandler}
        searchKeywordOnChangeHandler={searchKeywordHandler}
        searchKeyword={searchKeyword}
        tableHeaderTitleList={[
          "Event Name",
          "Event Location",
          "Event Start",
          "Event End",
          "Event Status",
          "Actions",
        ]}
        isLoading={isLoading}
        isFetching={isFetching}
        data={eventsData?.data}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        totalPageCount={eventsData?.total_pages}
        userState={userState}
      >
        {eventsData?.data && eventsData.data.length > 0 ? (
          eventsData?.data.map((event, idx) => (
            <tr key={event._id}>
              <td className="border-b border-gray-200 bg-white px-1 py-1 text-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="whitespace-no-wrap text-gray-900">
                      {event?.eventName}
                    </p>
                  </div>
                </div>
              </td>
              <td className="border-b border-gray-200 bg-white px-1 py-1 text-sm">
                <p className="whitespace-no-wrap text-gray-900">
                  {event?.eventLocation}
                </p>
              </td>
              <td className="border-b border-gray-200 bg-white px-1 py-1 text-sm">
                <p className="whitespace-no-wrap text-gray-900">
                  {dateTimeFormat(event?.eventStartDate, event?.eventTimeStart)}
                </p>
              </td>
              <td className="border-b border-gray-200 bg-white px-1 py-1 text-sm">
                <p className="whitespace-no-wrap text-gray-900">
                  {dateTimeFormat(event?.eventEndDate, event?.eventTimeEnd)}
                </p>
              </td>
              <td className="space-x-5 border-b border-gray-200 bg-white px-1 py-1 text-sm">
                {event.status === "approved" ? (
                  <span className="badge bg-success">Approved</span>
                ) : event.status === "rejected" ? (
                  <span className="badge bg-danger">Rejected</span>
                ) : (
                  <span className="badge bg-warning">Pending</span>
                )}
              </td>
              <td className="border-b border-gray-200 bg-white px-1 py-1 text-sm">
                <i
                  className="bi bi-eye text-primary fs-5 me-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleView(idx)}
                  title="View Event"
                ></i>
                <i
                  className="bi bi-pencil text-warning fs-5"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(idx)}
                  title="Edit Event"
                ></i>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-2">
              No events found.
            </td>
          </tr>
        )}
      </DataTable>

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
                  {modalType === "view" ? "👁️ View Event" : "✏️ Edit Event"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
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

                    <div className="row">
                      <div className="col-12">
                        <div className="card bg-light">
                          <div className="card-body">
                            {/* Heading and Add Button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="text-uppercase text-muted mb-0">
                                🎟️ Event Managers
                              </h6>
                              {selectedEvent?.status === "approved" && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    setShowAddManagerForm((prev) => !prev)
                                  }
                                >
                                  {showAddManagerForm
                                    ? "Cancel"
                                    : "Add Manager"}
                                </button>
                              )}
                            </div>

                            {showAddManagerForm && (
                              <form
                                className="row row-cols-lg-2 align-items-center mb-2"
                                onSubmit={handleAddManager}
                              >
                                <div className="col-12">
                                  <label
                                    className="visually-hidden"
                                    htmlFor="inlineFormInputGroupName"
                                  >
                                    Name
                                  </label>
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="inlineFormInputGroupName"
                                      placeholder="Name"
                                      value={managerName}
                                      onChange={(e) =>
                                        setManagerName(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="col-12">
                                  <label
                                    className="visually-hidden"
                                    htmlFor="inlineFormInputGroupEmail"
                                  >
                                    Email
                                  </label>
                                  <div className="input-group">
                                    <input
                                      type="email"
                                      className="form-control"
                                      id="inlineFormInputGroupEmail"
                                      placeholder="Email"
                                      value={managerEmail}
                                      onChange={(e) =>
                                        setManagerEmail(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="col-12 mt-2">
                                  <button
                                    disabled={disabled}
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </form>
                            )}
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
                ) : (
                  <form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event Name</label>
                          <input
                            type="text"
                            name="eventName"
                            className="form-control"
                            value={formData?.eventName || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event Location</label>
                          <input
                            type="text"
                            name="eventLocation"
                            className="form-control"
                            value={formData?.eventLocation || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event Start Date</label>
                          <input
                            type="date"
                            name="eventStartDate"
                            className="form-control"
                            value={formData?.eventStartDate || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event End Date</label>
                          <input
                            type="date"
                            name="eventEndDate"
                            className="form-control"
                            value={formData?.eventEndDate || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event Start Time</label>
                          <input
                            type="time"
                            name="eventTimeStart"
                            className="form-control"
                            value={formData?.eventTimeStart || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event End Time</label>
                          <input
                            type="time"
                            name="eventTimeEnd"
                            className="form-control"
                            value={formData?.eventTimeEnd || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Ticket Price</label>
                          <input
                            type="number"
                            name="ticketPrice"
                            className="form-control"
                            value={formData?.ticketPrice || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Event Image</label>
                          <input
                            type="file"
                            name="eventImage"
                            className="form-control"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label htmlFor="eventDescription">
                            Event Description
                          </label>
                          <textarea
                            id="eventDescription"
                            name="eventDescription"
                            className="form-control"
                            value={formData?.eventDescription || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
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
                    onClick={handleUpdateEvent}
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
}

export default Event;
