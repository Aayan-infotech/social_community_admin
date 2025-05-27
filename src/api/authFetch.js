// src/api/authAxios.js
import axios from "axios";
import { refreshAccessToken } from "./refreshToken";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");

  try {
    const response = await axios({
      ...options,
      url,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response received:", response);

    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const newToken = await refreshAccessToken();
      console.log("New token received:", newToken);

      if (newToken) {
        // Retry the request with new token
        return axios({
          ...options,
          url,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }

    throw error;
  }
};
