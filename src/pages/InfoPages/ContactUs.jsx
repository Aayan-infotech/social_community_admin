import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

function ContactUs() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4 text-center text-danger">
            <h3>Contact Us</h3>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
