"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Attendance {
  _id: string;
  date: string;
  entryTime?: string;
  exitTime?: string;
  totalHours?: number;
}

export default function AttendanceEntry() {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch today's attendance
    axios.get("http://localhost:5000/api/attendance/today", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAttendance(res.data))
    .catch(err => console.log(err));
  }, []);

  // Mark entry
  const markEntry = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/entry", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error marking entry");
    }
  };

  // Mark exit
  const markExit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/exit", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error marking exit");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-3">My Attendance</h2>

      <p>Date: {attendance ? new Date(attendance.date).toLocaleDateString() : "-"}</p>
      <p>Entry Time: {attendance?.entryTime ? new Date(attendance.entryTime).toLocaleTimeString() : "-"}</p>
      <p>Exit Time: {attendance?.exitTime ? new Date(attendance.exitTime).toLocaleTimeString() : "-"}</p>
      <p>Total Hours: {attendance?.totalHours?.toFixed(2) || "-"}</p>

      {/* Buttons */}
      <div className="mt-3 space-x-2">
        {!attendance?.entryTime && (
          <button
            onClick={markEntry}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Mark Entry
          </button>
        )}
        {attendance?.entryTime && !attendance.exitTime && (
          <button
            onClick={markExit}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Mark Exit
          </button>
        )}
      </div>
    </div>
  );
}
