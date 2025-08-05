import axios from "axios";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { use, useEffect, useState } from "react";
import { getEventDashboard } from "../../service/event/event";

export default function Page() {
  const [data, setData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      const response = await getEventDashboard();
      setData(response);
    };
    fetchData();
  }, []);
  console.log("Dashboard Data:", data);

  const metrics = [
    {
      title: "Total Events",
      value: data?.totalEvents || 0,
      icon: "bi-people-fill",
      color: "#4e73df",
    },
    { title: "Past Events", value: data?.pastEvents || 0, icon: "bi-building", color: "#1cc88a" },
    {
      title: "Upcoming Events",
      value: data?.upcomingEvents || 0,
      icon: "bi-grid-1x2-fill",
      color: "#36b9cc",
    },
  ];

  const barData = data?.barData || [];
  console.log("Bar Data:", barData);

  const pieData = [
    { name: "Retail", value: 40 },
    { name: "Services", value: 25 },
    { name: "Restaurants", value: 35 },
  ];

  const COLORS = ["#4e73df", "#1cc88a", "#36b9cc"];

  return (
    <>
      <h3 className="dashboard-title mb-4">Dashboard Overview</h3>

      {/* Metrics */}
      <div className="dashboard-metrics d-flex gap-3 mb-5">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="dashboard-card"
            style={{ borderLeft: `5px solid ${item.color}` }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted">{item.title}</h6>
                <h4 className="text-dark">{item.value}</h4>
              </div>
              <i
                className={`bi ${item.icon} fs-2`}
                style={{ color: item.color }}
              ></i>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts d-flex flex-wrap gap-4">
        {/* Bar Chart */}
        <div className="dashboard-chart-box">
          <h6 className="mb-3">Monthly Revenue</h6>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4e73df" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="dashboard-chart-box">
          <h6 className="mb-3">Business Types</h6>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
