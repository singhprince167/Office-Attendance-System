import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface Attendance {
  entryTime?: string;
  exitTime?: string;
  _id?: string;
}

interface User {
  username: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function UserDashboard() {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  // ✅ Fetch User Profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Session expired! Please login again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
  }, [BASE_URL, token]);

  // ✅ Fetch Today's Attendance
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [BASE_URL, token]);

  // ✅ Fetch Tasks
  const fetchTasks = useCallback(async () => {
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
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchUserProfile();
    fetchTodayAttendance();
    fetchTasks();
  }, [fetchUserProfile, fetchTodayAttendance, fetchTasks]);

  // ✅ Mark Entry & Exit
  const markAttendance = async (type: "entry" | "exit") => {
    try {
      await axios.post(
        `${BASE_URL}/api/attendance/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodayAttendance();
    } catch {
      alert("Error marking attendance!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const timeDiff = () => {
    if (!attendance?.entryTime || !attendance?.exitTime) return "0.00 hrs";
    const entry = new Date(attendance.entryTime).getTime();
    const exit = new Date(attendance.exitTime).getTime();
    return ((exit - entry) / (1000 * 60 * 60)).toFixed(2) + " hrs";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gray-200 p-4 overflow-y-auto">
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Welcome, {user?.username} 👋</h2>
          <button
            onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold text-blue-600 mb-2">
            Today's Attendance
          </h3>
          <p>
            Entry:{" "}
            <b>
              {attendance?.entryTime
                ? new Date(attendance.entryTime).toLocaleTimeString()
                : "--"}
            </b>
          </p>
          <p>
            Exit:{" "}
            <b>
              {attendance?.exitTime
                ? new Date(attendance.exitTime).toLocaleTimeString()
                : "--"}
            </b>
          </p>
          <p>Total Hours: {timeDiff()}</p>

          <div className="mt-3 flex gap-4">
            <button
              onClick={() => markAttendance("entry")}
              disabled={attendance?.entryTime !== undefined}
              className={`px-4 py-2 rounded ${
                attendance?.entryTime
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white"
              }`}
            >
              Mark Entry
            </button>

            <button
              onClick={() => markAttendance("exit")}
              disabled={!attendance?.entryTime || attendance?.exitTime !== undefined}
              className={`px-4 py-2 rounded ${
                !attendance?.entryTime || attendance?.exitTime
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-600 text-white"
              }`}
            >
              Mark Exit
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Your Tasks</h3>
          {tasks.length === 0 ? (
            <p>No tasks assigned</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="bg-gray-100 p-3 rounded-lg flex justify-between"
                >
                  <span>{task.title}</span>
                  <span className="text-sm text-gray-500">{task.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
