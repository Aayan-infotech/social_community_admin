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
import Events from "../pages/Events/Events";
import AdminLayout from "../components/AdminLayout";
import { useSelector } from "react-redux";
import NotFound from "../components/NotFound";
import Event from "../pages/user/Events/Event";
import BookedTickets from "../pages/user/Events/BookedTickets";
import CancelledTickets from "../pages/user/Events/CancelledTickets";
import KYCSuccessPage from "../pages/KYCSuccessPage";
import ReportedPost from "../pages/ReportedPost/ReportedPost";
import EventOrganizer from "../pages/Events/EventOrganizer";
import HealthWellness from "../pages/NearbyBussiness/HealthWellness";
import Vendors from "../pages/CategoryManagement/Vendors";
import AllProducts from "../pages/CategoryManagement/AllProducts";
import OrderList from "../pages/CategoryManagement/ProductOrder";
import ProductOrder from "../pages/CategoryManagement/ProductOrder";


export default function AppRoutes() {
  const userState = useSelector((state) => state.user);
  const userInfo = userState.userInfo;
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/info_pages/:pageURL" element={<FrontendInfoPages />} />
      <Route path="/kyc-success" element={<KYCSuccessPage />} />

      {userInfo?.role?.includes("admin") && (
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="deleteUser" element={<DeleteUser />} />

          <Route path="categories" element={<BusinessCategories />} />
          <Route path="subcategories" element={<BusinessSubCategories />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="all-products" element={<AllProducts />} />
          <Route path="product-orders" element={<ProductOrder />} />

          <Route path="nearby-categories" element={<NearByCategory />} />
          <Route path="all-businesses" element={<BusinessList />} />
          <Route path="pages" element={<InfoPages />} />
          <Route path="faqs" element={<FAQ />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="events" element={<Events />} />
          
          <Route path="reported-posts" element={<ReportedPost />} />
          <Route path="all-event-organizers" element={<EventOrganizer />} />
          <Route path="health-wellness" element={<HealthWellness />} />
          
        </Route>
      )}

      {userInfo?.role?.includes("vendor") && (
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="events" element={<Event />} /> */}
          <Route path="orders" element={<ProductOrder />} />
        </Route>
      )}

      {userInfo?.role?.includes("event_manager") && (
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Event />} />
          <Route path="upcoming-events" element={<Event type="upcoming" />} /> 
          <Route path="past-events" element={<Event type="past" />} />
          <Route path="booked-tickets" element={<BookedTickets />} />
          <Route path="cancelled-tickets" element={<CancelledTickets />} />
        </Route>
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
