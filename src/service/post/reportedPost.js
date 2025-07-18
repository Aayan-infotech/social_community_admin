import axios from 'axios';

const getAllReportedPosts = async (token, page = 1, limit = 10) => {
    try {
        const { data } = await axios.get(`post/getAllReportedPosts?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data?.data || [];
    } catch (error) {
        console.error("Error fetching reported posts:", error);
        throw error;
    }
};

export { getAllReportedPosts };