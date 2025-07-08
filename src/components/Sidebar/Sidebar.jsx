import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";
import { useSelector } from "react-redux";

export default function Sidebar() {
  const userState = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openMarketPlace, setOpenMarketPlace] = useState(false);
  const [openInfoPages, setOpenInfoPages] = useState(false);
  const [openEventManagement, setOpenEventManagement] = useState(false);

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        className="sidebar-toggle d-md-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      <div className={`custom-sidebar ${isOpen ? "open" : ""}`}>
        <h4 className="sidebar-title">
          <i className="bi bi-globe2 me-2"></i>Social Community
        </h4>

        {userState?.userInfo?.role.includes("admin") && (
          <ul className="sidebar-nav">
            <li className="sidebar-item">
              <Link to="/admin/dashboard" className="sidebar-link-dash">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
            </li>

            {/* Users Dropdown */}
            <li className="sidebar-item">
              <div
                className="sidebar-link"
                onClick={() => setOpenUsers(!openUsers)}
              >
                <span>
                  <i className="bi bi-people-fill me-2"></i>User Management
                </span>
                <i
                  className={`bi ${
                    openUsers ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </div>
              {openUsers && (
                <ul className="sidebar-submenu">
                  <li>
                    <Link to="/admin/users" className="sidebar-sublink">
                      All Users
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/deleteUser" className="sidebar-sublink">
                      Delete User
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* NearBy Business Dropdown */}
            <li className="sidebar-item">
              <div
                className="sidebar-link"
                onClick={() => setOpenCategories(!openCategories)}
              >
                <span>
                  <i className="bi bi-grid-1x2-fill me-2"></i>NearBy Business
                </span>
                <i
                  className={`bi ${
                    openCategories ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </div>
              {openCategories && (
                <ul className="sidebar-submenu">
                  <li>
                    <Link
                      to="/admin/nearby-categories"
                      className="sidebar-sublink"
                    >
                      All Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/all-businesses"
                      className="sidebar-sublink"
                    >
                      Nearby Businesses
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Marketplace Dropdown */}
            <li className="sidebar-item">
              <div
                className="sidebar-link"
                onClick={() => setOpenMarketPlace(!openMarketPlace)}
              >
                <span>
                  <i className="bi bi-grid-1x2-fill me-2"></i>MarketPlace
                </span>
                <i
                  className={`bi ${
                    openMarketPlace ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </div>
              {openMarketPlace && (
                <ul className="sidebar-submenu">
                  <li>
                    <Link to="/admin/categories" className="sidebar-sublink">
                      All Categories
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/subcategories" className="sidebar-sublink">
                      Sub Categories
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Event Management */}
            <li className="sidebar-item">
              <div
                className="sidebar-link"
                onClick={() => setOpenEventManagement(!openEventManagement)}
              >
                <span>
                  <i className="bi bi-calendar-event me-2"></i>Event Management
                </span>
                <i
                  className={`bi ${
                    openEventManagement ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </div>
              {openEventManagement && (
                <ul className="sidebar-submenu">
                  <li>
                    <Link to="/admin/events" className="sidebar-sublink">
                      All Events
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/create-event" className="sidebar-sublink">
                      Create Event
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Info Pages Dropdown */}
            <li className="sidebar-item">
              <div
                className="sidebar-link"
                onClick={() => setOpenInfoPages(!openInfoPages)}
              >
                <span>
                  <i className="bi bi-file-earmark-text me-2"></i>Info Pages
                </span>
                <i
                  className={`bi ${
                    openInfoPages ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </div>
              {openInfoPages && (
                <ul className="sidebar-submenu">
                  <li>
                    <Link to="/admin/pages" className="sidebar-sublink">
                      All Pages
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/faqs" className="sidebar-sublink">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/contact" className="sidebar-sublink">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        )}

        {userState?.userInfo?.role.includes("event_manager") && (
          <ul className="sidebar-nav">
            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-date me-2"></i> Current Events
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar4-event me-2"></i> Upcoming Events
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-check me-2"></i> Booked Tickets
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-x me-2"></i> Cancelled Tickets
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar2-heart me-2"></i> My Events
              </Link>
            </li>
          </ul>
        )}

        {userState?.userInfo?.role.includes("vendor") && (
          <ul className="sidebar-nav">
            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-date me-2"></i> Orders
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar4-event me-2"></i> Place Orders
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-check me-2"></i> Completed Orders
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/user/events" className="sidebar-link-dash">
                <i className="bi bi-calendar-x me-2"></i> Cancelled Orders
              </Link>
            </li>
          </ul>
        )}
      </div>
    </>
  );
}
