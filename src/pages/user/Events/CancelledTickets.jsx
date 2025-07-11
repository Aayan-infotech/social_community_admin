import React from "react";

function CancelledTickets() {
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

  return (
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
  );
}

export default CancelledTickets;
