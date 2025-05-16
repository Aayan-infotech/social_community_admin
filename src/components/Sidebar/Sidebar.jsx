import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

export default function Sidebar() {
  const [openUsers, setOpenUsers] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openMarketPlace, setOpenMarketPlace] = useState(false);
  const [openNearby, setOpenNearby] = useState(false);

  return (
    <div className="custom-sidebar">
      <h4 className="sidebar-title">
        <i className="bi bi-globe2 me-2"></i>Social Community
      </h4>

      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/dashboard" className="sidebar-link-dash">
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
                <Link to="/users" className="sidebar-sublink">
                  All Users
                </Link>
              </li>
              <li>
                <Link to="/deleteUser" className="sidebar-sublink">
                  Delete User
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Business Categories Dropdown */}
        <li className="sidebar-item">
          <div
            className="sidebar-link"
            onClick={() => setOpenNearby(!openNearby)}
          >
            <span>
              <i className="bi bi-grid-1x2-fill me-2"></i>NearBy Business
            </span>
            <i
              className={`bi ${
                openNearby ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {openNearby && (
            <ul className="sidebar-submenu">
              <li>
                <Link to="/nearby-categories" className="sidebar-sublink">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/all-businesses" className="sidebar-sublink">
                  Nearby Businesses
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* MarketPlace Dropdown */}
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
                <Link to="/categories" className="sidebar-sublink">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/categories/add" className="sidebar-sublink">
                  Add Category
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
