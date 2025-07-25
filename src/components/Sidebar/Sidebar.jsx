import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";
import { useSelector } from "react-redux";
import { sidebarConfig, getChildUrls, getMenuItemsForRoles } from "./sidebarConfig";

export default function Sidebar() {
  const userState = useSelector((state) => state.user);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Get user roles
  const userRoles = userState?.userInfo?.role || [];
  
  // Get menu items based on user roles
  const menuItems = getMenuItemsForRoles(userRoles);

  // Check if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Check if any submenu item is active
  const isActiveParent = (menuItem) => {
    if (menuItem.type === 'dropdown' && menuItem.children) {
      const childUrls = getChildUrls(menuItem);
      return childUrls.some(url => location.pathname === url);
    }
    return false;
  };

  // Toggle dropdown state
  const toggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Auto-expand parent menu if child is active
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenState = { ...openDropdowns };

    menuItems.forEach(menuItem => {
      if (menuItem.type === 'dropdown') {
        const childUrls = getChildUrls(menuItem);
        if (childUrls.includes(currentPath)) {
          newOpenState[menuItem.id] = true;
        }
      }
    });

    setOpenDropdowns(newOpenState);
  }, [location.pathname]);

  // Render single menu item
  const renderSingleItem = (item) => (
    <li key={item.id} className="sidebar-item">
      <Link
        to={item.url}
        className={`sidebar-link-dash ${
          isActiveLink(item.url) ? "active" : ""
        }`}
      >
        <i className={`bi ${item.icon} me-2`}></i> {item.label}
      </Link>
    </li>
  );

  // Render dropdown menu item
  const renderDropdownItem = (item) => (
    <li key={item.id} className="sidebar-item">
      <div
        className={`sidebar-link ${
          isActiveParent(item) ? "active" : ""
        }`}
        onClick={() => toggleDropdown(item.id)}
      >
        <span>
          <i className={`bi ${item.icon} me-2`}></i>{item.label}
        </span>
        <i
          className={`bi ${
            openDropdowns[item.id] ? "bi-chevron-up" : "bi-chevron-down"
          }`}
        ></i>
      </div>
      {openDropdowns[item.id] && (
        <ul className="sidebar-submenu">
          {item.children.map(child => (
            <li key={child.id}>
              <Link
                to={child.url}
                className={`sidebar-sublink ${
                  isActiveLink(child.url) ? "active" : ""
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  // Render menu item based on type
  const renderMenuItem = (item) => {
    if (item.type === 'single') {
      return renderSingleItem(item);
    } else if (item.type === 'dropdown') {
      return renderDropdownItem(item);
    }
    return null;
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      <div className={`custom-sidebar ${isOpen ? "open" : ""}`}>
        <h4 className="sidebar-title">
          <i className="bi bi-globe2 me-2"></i>Social Community
        </h4>

        {menuItems.length > 0 && (
          <ul className="sidebar-nav">
            {menuItems.map(renderMenuItem)}
          </ul>
        )}
      </div>
    </>
  );
}