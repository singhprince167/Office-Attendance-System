import { useState } from "react";
import axios from "axios";

interface Props {
  attendance: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditAttendanceModal({ attendance, onClose, onUpdated }: Props) {
  const [entryTime, setEntryTime] = useState(attendance.entryTime ? new Date(attendance.entryTime).toISOString().slice(0,16) : "");
  const [exitTime, setExitTime] = useState(attendance.exitTime ? new Date(attendance.exitTime).toISOString().slice(0,16) : "");

  const updateAttendance = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/attendance/${attendance._id}`, 
        { entryTime, exitTime }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating attendance");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h2 className="text-lg font-bold mb-2">Edit Attendance</h2>
        <label>Entry Time:</label>
        <input type="datetime-local" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="w-full p-2 border rounded mb-2"/>
        <label>Exit Time:</label>
        <input type="datetime-local" value={exitTime} onChange={e => setExitTime(e.target.value)} className="w-full p-2 border rounded mb-4"/>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={updateAttendance} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Update</button>
        </div>
      </div>
    </div>
  );
}
