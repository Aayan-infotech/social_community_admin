import axios from "axios";

export const getAllEvents = async (token, page = 1, limit = 10, searchKeyword = "") => {
    try {
        const { data } = await axios.get(
            `virtual-events/my-events?page=${page}&limit=${limit}&searchKeyword=${searchKeyword}`,
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
        console.log("Event updated successfully:", data);
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
