import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/UserManagement/Users";
import BusinessCategories from "../pages/CategoryManagement/BusinessCategories";
import BusinessSubCategories from "../pages/CategoryManagement/BusinessSubCategories";
import ProtectedRoute from "./ProtectedRoute";
import DeleteUser from "../pages/UserManagement/DeleteUser";
import NearByCategory from "../pages/NearbyBussiness/NearByCategory";
import BusinessList from "../pages/NearbyBussiness/BusinessList";
import InfoPages from "../pages/InfoPages/InfoPages";
import FrontendInfoPages from "../pages/InfoPages/FrontendInfoPages";
import FAQ from "../pages/InfoPages/FAQ";
import ContactUs from "../pages/InfoPages/ContactUs";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Create a Dynamic Route for Info Pages */}
      <Route 
        path="/info_pages/:pageURL"
        element={
          <FrontendInfoPages />
        }
      />

      {/* Protected Routes */}
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
        path="/categories"
        element={
          <ProtectedRoute>
            <BusinessCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subcategories"
        element={
          <ProtectedRoute>
            <BusinessSubCategories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nearby-categories"
        element={
          <ProtectedRoute>
            <NearByCategory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/all-businesses"
        element={
          <ProtectedRoute>
            <BusinessList />
          </ProtectedRoute>
        }
      />

      <Route
       path="/pages"
       element={
        <ProtectedRoute>
          <InfoPages />
        </ProtectedRoute>
       }
      />
      <Route path="faqs" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
      <Route path="contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />

    </Routes>
  );
}
