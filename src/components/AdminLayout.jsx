import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";
// import { useQuery } from "@tanstack/react-query";
// // import { getUserProfile } from "../../services/index/users";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { useEffect } from "react";
// import { logout } from "../../store/actions/user";
// import Loading from "../../components/Loading/Loading";

const AdminLayout = () => {
//   const navigate = useNavigate();
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
