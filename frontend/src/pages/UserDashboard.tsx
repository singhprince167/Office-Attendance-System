import React, { useEffect, useState } from "react";
import axios from "axios";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface IAttendance {
  _id: string;
  entryTime?: string;
  exitTime?: string;
  totalHours?: string;
  entryLocation?: { lat: number; lng: number };
  exitLocation?: { lat: number; lng: number };
}

interface ITask {
  _id: string;
  title: string;
  description: string;
  report?: string;
  status?: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<IUser | null>(null);
  const [attendance, setAttendance] = useState<IAttendance | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [reportTexts, setReportTexts] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired! Please login again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch user's tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchTodayAttendance();
    fetchTasks();
  }, []);

  // Mark entry
  const markEntry = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post(
          `${BASE_URL}/api/attendance/entry`,
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Entry marked!");
        fetchTodayAttendance();
      } catch (err: any) {
        alert(err.response?.data?.message || "Error marking entry");
      }
    });
  };

  // Mark exit
  const markExit = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post(
          `${BASE_URL}/api/attendance/exit`,
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Exit marked!");
        fetchTodayAttendance();
      } catch (err: any) {
        alert(err.response?.data?.message || "Error marking exit");
      }
    });
  };

  // Submit task report
  const submitReport = async (taskId: string) => {
    const report = reportTexts[taskId];
    if (!report) return alert("Please enter your report!");
    try {
      await axios.post(
        `${BASE_URL}/api/tasks/submit/${taskId}`,
        { report },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Report submitted successfully!");
      setReportTexts({ ...reportTexts, [taskId]: "" });
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error submitting report");
    }
  };

  // Logout user
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
           {user?.name || ""} 
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 transition duration-150"
        >
          Logout
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Section */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 md:h-[450px] h-auto flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Today's Attendance
            </h2>
            <div className="space-y-2 mb-4 text-gray-600">
              <p>
                <strong className="text-gray-800">Entry:</strong>{" "}
                {attendance?.entryTime
                  ? new Date(attendance.entryTime).toLocaleTimeString()
                  : "Pending"}
              </p>
              <p>
                <strong className="text-gray-800">Exit:</strong>{" "}
                {attendance?.exitTime
                  ? new Date(attendance.exitTime).toLocaleTimeString()
                  : "Pending"}
              </p>
              <p>
                <strong className="text-gray-800">Total Hours:</strong>{" "}
                {attendance?.totalHours
                  ? parseFloat(attendance.totalHours).toFixed(2) + " hrs"
                  : "-"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={markEntry}
                disabled={!!attendance?.entryTime}
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 disabled:opacity-50 transition duration-150"
              >
                Mark Entry
              </button>
              <button
                onClick={markExit}
                disabled={!attendance?.entryTime || !!attendance?.exitTime}
                className="bg-red-500 text-white px-4 py-2 rounded shadow-sm hover:bg-red-600 disabled:opacity-50 transition duration-150"
              >
                Mark Exit
              </button>
            </div>

            {(attendance?.entryLocation || attendance?.exitLocation) && (
              <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Location Details
                </h2>
                <div className="space-y-2 text-gray-600">
                  {attendance.entryLocation && (
                    <p>
                      <strong className="text-gray-800">Entry:</strong>{" "}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${attendance.entryLocation.lat},${attendance.entryLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline transition duration-150"
                      >
                        View on Map
                      </a>
                    </p>
                  )}
                  {attendance.exitLocation && (
                    <p>
                      <strong className="text-gray-800">Exit:</strong>{" "}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${attendance.exitLocation.lat},${attendance.exitLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline transition duration-150"
                      >
                        View on Map
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 md:h-[450px] h-auto flex flex-col">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            My Pending Tasks
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">No pending tasks.</p>
          ) : (
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className="border-b border-gray-100 pb-3 mb-4 last:border-b-0"
                >
                  <p className="font-semibold text-gray-800">{t.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{t.description}</p>
                  <textarea
                    placeholder="Write your task report here..."
                    value={reportTexts[t._id] || ""}
                    onChange={(e) =>
                      setReportTexts({ ...reportTexts, [t._id]: e.target.value })
                    }
                    className="border border-gray-300 p-2 w-full rounded mb-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => submitReport(t._id)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-blue-700 text-sm transition duration-150"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
