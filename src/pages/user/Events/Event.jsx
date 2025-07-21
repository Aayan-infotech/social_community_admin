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

function Event({ type }) {
  const [userSelectedEvent, setUserSelectedEvent] = useState(null);
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
    setUserSelectedEvent(eventsData?.data[index]);
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
    setUserSelectedEvent(eventsData?.data[index]);
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
    setUserSelectedEvent(null);
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
        userSelectedEvent?._id,
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
                {(() => {
                  const currentDate = new Date();
                  const eventEndDateTime = combineDateAndTime(event?.eventEndDate, event?.eventTimeEnd);
                  if (currentDate > eventEndDateTime) {
                    return <span className="badge text-bg-danger">Ended</span>;
                  } else {
                    return (
                      <span className="badge text-bg-success">Ongoing</span>
                    );
                  }
                })()}
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
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Event Name:</strong>{" "}
                        {userSelectedEvent?.eventName}
                      </p>
                      <p>
                        <strong>Event Location:</strong>{" "}
                        {userSelectedEvent?.eventLocation}
                      </p>
                      <p>
                        <strong>Event Start Date:</strong>{" "}
                        {new Date(
                          userSelectedEvent?.eventStartDate
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        - {formatTime(userSelectedEvent?.eventTimeStart)}
                      </p>
                      <p>
                        <strong>Event End Date:</strong>{" "}
                        {new Date(
                          userSelectedEvent?.eventEndDate
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        - {formatTime(userSelectedEvent?.eventTimeEnd)}
                      </p>

                      <p>
                        <strong>Event Status:</strong>{" "}
                        {new Date(userSelectedEvent?.eventEndDate) <
                        new Date() ? (
                          <span className="badge text-bg-danger">Ended</span>
                        ) : (
                          <span className="badge text-bg-success">Ongoing</span>
                        )}
                      </p>
                      <p>
                        <strong>Ticket Price:</strong>{" "}
                        {userSelectedEvent?.ticketPrice}
                      </p>
                      <p>
                        <strong>Event Description:</strong>{" "}
                        {userSelectedEvent?.eventDescription}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <img
                          src={
                            userSelectedEvent?.eventImage ||
                            images.defaultEventImage
                          }
                          alt="Event"
                          className="img-fluid rounded"
                        />
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
