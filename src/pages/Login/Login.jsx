import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";

const LoginPage = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("auth/login", form, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      console.log("Login response:", result);

      if (result.statusCode === 200) {
        // Save user data to localStorage
        const { user, accessToken, refreshToken } = result.data;

        const userInfo = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role || ["user"],
          profileImage: user.profile_image || "",
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        dispatch(userActions.setUserInfo(userInfo));
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        if (user.role.includes("admin")) {
          toast.success("Admin login successful!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else if (
          user.role.includes("event_manager") ||
          user.role.includes("vendor")
        ) {
          toast.success(" login successful!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else if (
          !user.role.includes("admin") &&
          !user.role.includes("event_manager") &&
          !user.role.includes("vendor")
        ) {
          localStorage.removeItem("userInfo");
          toast.error("You are not authorized to access this system");
        }

        // // Check user role and redirect accordingly
        // if (user.role === "admin") {
        //   toast.success("Admin login successful!");
        //   setTimeout(() => {
        //     navigate("/dashboard");
        //   }, 1500);
        // } else {
        //   // Clear sensitive data if not admin
        //   localStorage.removeItem("authToken");
        //   localStorage.removeItem("refreshToken");
        //   toast.error("You are not authorized to access this system");
        // }
      } else {
        toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("User state updated:", userState.userInfo);
    if (userState.userInfo) {
      console.log("User info:", userState.userInfo);
      console.log("User role:", userState.userInfo.role);
      if (userState.userInfo.role.includes("admin")) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else if (
        userState.userInfo.role.includes("event_manager") ||
        userState.userInfo.role.includes("vendor")
      ) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else if (
        !userState.userInfo.role.includes("admin") &&
        !userState.userInfo.role.includes("event_manager") &&
        !userState.userInfo.role.includes("vendor")
      ) {
        localStorage.removeItem("userInfo");
        toast.error("You are not authorized to access this system");
      }
    }
  }, [navigate, userState.userInfo]);

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="login-card p-4 shadow-lg rounded bg-white"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4 text-primary">🔐 Admin Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
