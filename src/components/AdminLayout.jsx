import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="container-fluid d-flex flex-column flex-md-row p-0 outerContainer">
      <Sidebar />
      <div className="main-content flex-grow-1 bg-light">
        <Topbar />
        <div className="card m-3">
          <div className="card-body">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
