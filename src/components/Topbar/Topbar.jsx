import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Topbar.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { images, links } from "../../contstants";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState({
    name: "Admin",
    avatar: images.placeholder,
    email: "Not provided",
    mobile: "Not provided",
    username: "Not provided",
    address: "Not provided",
  });

  useEffect(() => {
    if (userState?.userInfo) {
      const { name, profile_image, email, mobile, username, address } =
        userState.userInfo;
      setUser({
        name: name || "Admin",
        avatar: profile_image || images.placeholder,
        email: email || "Not provided",
        mobile: mobile || "Not provided",
        address: address || "Not provided",
      });
    }
  }, [userState]);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(userActions.setUserInfo(null));
    toast.success("Logout successful!");
    navigate("/")
    // setTimeout(() => navigate("/"), 1600);
  };

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    const currentPassword = currentPasswordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    try {
      const res = await axios.post(
        `${links.BASE_URL}auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success("Password changed successfully!");
        setShowChangePasswordModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
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
                <li
                  className="topbar-dropdown-item"
                  onClick={() => setShowProfile(true)}
                >
                  My Profile
                </li>
                <li
                  className="topbar-dropdown-item"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  Change Password
                </li>
                <li className="topbar-dropdown-item" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        show={showChangePasswordModal}
        onHide={() => setShowChangePasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                type="text"
                id="currentPassword"
                className="form-control"
                ref={currentPasswordRef}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="text"
                id="newPassword"
                className="form-control"
                ref={newPasswordRef}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="text"
                id="confirmPassword"
                className="form-control"
                ref={confirmPasswordRef}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitPasswordChange}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* My Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)}>
        <Modal.Header closeButton>
          <Modal.Title>My Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <img
              src={user.avatar}
              alt="avatar"
              className="rounded-circle"
              style={{ width: "100px", height: "100px" }}
            />
          </div>
          <div className="row">
            <div className="col-md-12 col-12 mb-3">
              <label>Name</label>
              <input type="text" className="form-control" value={user.name} readOnly />
            </div>
            <div className="col-md-6 col-12 mb-3">
              <label>Email</label>
              <input type="email" className="form-control" value={user.email} readOnly />
            </div>
            {/* <div className="col-md-6 col-12 mb-3">
              <label>Username</label>
              <input type="text" className="form-control" value={user.username} readOnly />
            </div> */}
            <div className="col-md-6 col-12 mb-3">
              <label>Mobile</label>
              <input type="text" className="form-control" value={user.mobile} readOnly />
            </div>
            <div className="col-12 mb-3">
              <label>Address</label>
              <textarea className="form-control" rows="3" value={user.address} readOnly></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
