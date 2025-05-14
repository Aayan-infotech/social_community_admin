import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/UserManagement/Users";
import NearbyBusinesses from "../pages/CategoryManagement/NearbyBusinesses";
import BusinessCategories from "../pages/CategoryManagement/BusinessCategories";
import ProtectedRoute from "./ProtectedRoute";
import DeleteUser from "../pages/UserManagement/DeleteUser";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deleteUser"
        element={
          <ProtectedRoute>
            <DeleteUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nearby"
        element={
          <ProtectedRoute>
            <NearbyBusinesses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <BusinessCategories />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}