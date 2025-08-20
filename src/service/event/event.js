import axios from "axios";

export const getAllEvents = async (token, page = 1, limit = 10, searchKeyword = "", type = "all", sortField = "eventStartDate", // default sort
    sortOrder = "desc") => {
    try {
        const { data } = await axios.get(
            `virtual-events/my-events?page=${page}&limit=${limit}&searchKeyword=${searchKeyword}&type=${type}&sortField=${sortField}&sortOrder=${sortOrder}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
            }
        );

        const total_records = data?.data?.total_records;
        const total_pages = data?.data?.total_page;

        return { data: data?.data?.virtualEvents, total_pages };
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

export const formatTime = (timeStr) => {
    if (!timeStr) {
        return "--:--";
    }
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(+hours);
    date.setMinutes(+minutes);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};


export const updateEvent = async (token, id, formData) => {
    try {
        const { data } = await axios.put(
            `virtual-events/update/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(data, "data");

        return data;
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
};

export const dateFormatForInput = (dateString) => {
    if (!dateString) {
        return "";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};


export const getEventDropdownOptions = async (token) => {
    try {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const { data } = await axios.get(
            `virtual-events/getEventDropdown`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return data?.data || [];
    } catch (error) {
        console.error("Error fetching event dropdown options:", error);
        throw error;
    }
};

export const getBookedTicketsByEventId = async (token, eventId, page = 1, limit = 10, sortField = "createdAt", sortOrder = "desc") => {
    try {
        const { data } = await axios.get(`virtual-events/getAllTickets/${eventId}?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data?.data || [];

    } catch (error) {
        console.error("Error fetching booked tickets by event ID:", error);
        throw error;
    }
};

export const getCancelledTicketsByEventId = async (token, eventId, page = 1, limit = 10) => {
    try {
        // if (!eventId && eventId != 'undefined') {
        const { data } = await axios.get(`virtual-events/getCancelledTickets/${eventId}?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data?.data || [];
        // }
    } catch (error) {
        console.error("Error fetching cancelled tickets by event ID:", error);
        throw error;
    }
};


export const dateTimeFormat = (date, time) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
    const formattedTime = formatTime(time);
    return `${formattedDate} - ${formattedTime}`;
}

export const combineDateAndTime = (date, time) => {
    if (!date || !time) {
        return null;
    }
    const combinedDateTimeString = `${date.slice(0, 10)}T${time}`;
    const combinedDateTime = new Date(combinedDateTimeString);
    return combinedDateTime;
}

export const getEventDashboard = async () => {
    try {
        const { data } = await axios.get(`virtual-events/getEventDashboard`);
        return data?.data || {};
    } catch (error) {
        console.error("Error fetching event dashboard:", error);
        throw error;
    }
};



export const addEvent = async (formData) => {
    try {
        const { data } = await axios.post(`virtual-events/add`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}