import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import store from "./store/index.js";
import links from "./contstants/links.js";
import { Provider } from "react-redux";
import axios from "axios";
import { userActions } from "./store/reducers/userReducers";


// Set base URL
axios.defaults.baseURL = links.BASE_URL;

// Request Interceptor
axios.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const refreshToken = userInfo?.refreshToken;

        if (!refreshToken) throw new Error("No refresh token found");

        const response = await axios.post("auth/refresh-token", {
          refreshToken,
        });
        console.log("Token refresh response:", response.data);

        const { accessToken, refreshToken: newRefreshToken } =
          response.data?.data;
        console.log("New access token:", accessToken);
        console.log("New refresh token:", newRefreshToken);

        const updatedAccount = {
          ...userInfo,
          accessToken: accessToken,
          refreshToken: newRefreshToken,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedAccount));
        store.dispatch(userActions.setUserInfo(updatedAccount));

        // Update the authorization header for the original request
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Render App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
