import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Topbar.css";

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({
    name: "User",
    avatar: "./placeholder/person.png",
  });
  const navigate = useNavigate();
  

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const avatar =
      localStorage.getItem("profileImage") || "./placeholder/person.png";
    setUser({ name, avatar });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout successful!");

    setTimeout(() => {
      navigate("/");
    }, 1600);
  };

  return (
    <>
      <div className="custom-topbar">
        <input className="topbar-search" type="text" placeholder="Search..." />

        <div className="topbar-right">
          <i className="bi bi-bell fs-5 me-3 topbar-icon"></i>

          <div
            className="topbar-avatar-container"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img src={user.avatar} alt="avatar" className="topbar-avatar" />
            <span className="topbar-user-name">
              {user.name}
              <i
                className={`bi bi-chevron-down ${
                  dropdownOpen ? "rotate-icon" : ""
                }`}
              ></i>
            </span>
            {dropdownOpen && (
              <ul className="topbar-dropdown">
                <li className="topbar-dropdown-item">My Profile</li>
                <li className="topbar-dropdown-item" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}
