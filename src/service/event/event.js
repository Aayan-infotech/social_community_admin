import axios from "axios";

export const getAllEvents = async (token, page = 1, limit = 10, searchKeyword = "", type = "all") => {
    try {
        const { data } = await axios.get(
            `virtual-events/my-events?page=${page}&limit=${limit}&searchKeyword=${searchKeyword}&type=${type}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
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
        console.log("Token", token);
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
        console.log("Event dropdown options fetched successfully:", data);

        return data?.data || [];
    } catch (error) {
        console.error("Error fetching event dropdown options:", error);
        throw error;
    }
};

export const getBookedTicketsByEventId = async (token, eventId, page = 1, limit = 10) => {
    try {
        const { data } = await axios.get(`virtual-events/getAllTickets/${eventId}?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Booked tickets fetched successfully:", data);
        return data?.data || [];

    } catch (error) {
        console.error("Error fetching booked tickets by event ID:", error);
        throw error;
    }
};

export const getCancelTickets = async (token, eventId) => { 
    try {
        const { data } = await axios.get(`virtual-events/getCancelledTickets/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Cancelled tickets fetched successfully:", data);
        return data?.data || [];
    } catch (error) {
        console.error("Error fetching cancelled tickets by event ID:", error);
        throw error;
    }
}
