// ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { logout } from "../store/actions/user";

const ProtectedRoute = ({ children }) => {
  // const token = localStorage.getItem('authToken');
  // const role = localStorage.getItem('userRole');
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.accessToken;
  const role = userInfo?.role;

  if (
    !token ||
    !role ||
    !Array.isArray(role) ||
    (!role.includes("admin") &&
      !role.includes("event_manager") &&
      !role.includes("vendor"))
  ) {
    // Clear any existing auth data
    logout();
    localStorage.removeItem("userInfo");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
