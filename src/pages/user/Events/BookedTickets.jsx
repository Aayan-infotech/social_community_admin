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

  const {
    currentPage,
    searchKeyword,
    data: bookedTicketsData,
    isLoading,
    isFetching,
    setCurrentPage,
    queryClient,
  } = useDataTable({
    enabled: !!selectedEvent, // only fetch when event is selected
    dataQueryFn: () =>
      getBookedTicketsByEventId(
        userState?.userInfo?.accessToken,
        selectedEvent?.value,
        currentPage
      ),
    dataQueryKey: ["booked-tickets", selectedEvent?.value],
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

  return (
    <>
      <div className="container">
        <div className="row mb-3">
          <div className="col-md-2">
            <label htmlFor="eventSelect" className="h6">Select Event</label>
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
            "Ticket ID",
            "Buyer Name",
            "Email",
            "Tickets",
            "Booking Time",
            "Status",
            "Actions",
          ]}
          isLoading={isLoading}
          isFetching={isFetching}
          data={bookedTicketsData?.tickets || []}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPageCount={bookedTicketsData?.total_page}
        >
          {bookedTicketsData?.tickets?.length > 0 ? (
            bookedTicketsData?.tickets.map((ticket) => (
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
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
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
                    onClick={() => handleCancelTicket(ticket?._id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-2">
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
    </>
  );
}

export default BookedTickets;
