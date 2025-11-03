import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface IUser { _id: string; name: string; email: string; role: string; }
interface IAttendance {
  _id: string;
  entryTime?: string;
  exitTime?: string;
  totalHours?: string;
  entryLocation?: { lat: number; lng: number };
  exitLocation?: { lat: number; lng: number };
}
interface ITask { _id: string; title: string; description: string; report?: string; }

export default function UserDashboard() {
  const [user, setUser] = useState<IUser | null>(null);
  const [attendance, setAttendance] = useState<IAttendance | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [reportText, setReportText] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Office location (your provided coordinates)
  const OFFICE_LOCATION = { lat: 26.881061, lng: 80.982332 };
  const GEOFENCE_METERS = 50;

  function getDistanceFromOffice(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      localStorage.setItem("name", res.data.name);
    } catch (err) { console.error(err); }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchTodayAttendance();
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const markEntry = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const distance = getDistanceFromOffice(
        pos.coords.latitude,
        pos.coords.longitude,
        OFFICE_LOCATION.lat,
        OFFICE_LOCATION.lng
      );

      if (distance <= GEOFENCE_METERS) {
        try {
          await axios.post(
            "http://localhost:5000/api/attendance/entry",
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Entry marked!");
          fetchTodayAttendance();
        } catch (err: any) {
          alert(err.response?.data?.message || "Error marking entry");
        }
      } else {
        alert(`You are ${Math.round(distance)}m away. Must be within ${GEOFENCE_METERS}m to mark entry.`);
      }
    }, (err) => {
      alert("Could not get location. Allow location access.");
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  };

  const markExit = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const distance = getDistanceFromOffice(
        pos.coords.latitude,
        pos.coords.longitude,
        OFFICE_LOCATION.lat,
        OFFICE_LOCATION.lng
      );

      if (distance <= GEOFENCE_METERS) {
        try {
          await axios.post(
            "http://localhost:5000/api/attendance/exit",
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Exit marked!");
          fetchTodayAttendance();
        } catch (err: any) {
          alert(err.response?.data?.message || "Error marking exit");
        }
      } else {
        alert(`You are ${Math.round(distance)}m away. Must be within ${GEOFENCE_METERS}m to mark exit.`);
      }
    }, (err) => {
      alert("Could not get location. Allow location access.");
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  };

  const submitReport = async (taskId: string) => {
    if (!reportText) return alert("Enter report text!");
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/report`,
        { report: reportText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Report submitted!");
      setReportText("");
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error submitting report");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || localStorage.getItem("name") || "User"} 👋</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Today's Attendance</h2>
        <p>Entry: {attendance?.entryTime ? new Date(attendance.entryTime).toLocaleTimeString() : "-"}</p>
        <p>Exit: {attendance?.exitTime ? new Date(attendance.exitTime).toLocaleTimeString() : "-"}</p>
        <p>Total Hours: {attendance?.totalHours || "-"}</p>
        <button onClick={markEntry} disabled={!!attendance?.entryTime} className="bg-green-600 text-white px-4 py-2 rounded mr-2">Mark Entry</button>
        <button onClick={markExit} disabled={!attendance?.entryTime || !!attendance?.exitTime} className="bg-blue-600 text-white px-4 py-2 rounded">Mark Exit</button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">My Tasks</h2>
        {tasks.map((t) => (
          <div key={t._id} className="border-b py-2 mb-2">
            <strong>{t.title}</strong> — {t.description}
            <br />
            <textarea placeholder="Submit your report..." value={reportText} onChange={(e) => setReportText(e.target.value)} className="border p-2 w-full mt-2 mb-2" />
            <button onClick={() => submitReport(t._id)} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}
