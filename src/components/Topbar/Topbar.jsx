import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Topbar.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/actions/user";
import images from "../../contstants/images";

export default function Topbar() {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userState = useSelector((state) => state.user);
  const [user, setUser] = useState({
    name: "User",
    avatar: images.placeholder,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const name = userState.userInfo.name || "User";
    const avatar = userState.userInfo.profileImage || images.placeholder;
    setUser({ name, avatar });
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful!");

    navigate("/");
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
    </>
  );
}
