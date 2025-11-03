import { useEffect, useState } from "react";
import axios from "axios";

// Define the Attendance type
interface Attendance {
  _id: string;
  user: { name: string; email: string };
  date: string;
  entryTime?: string;
  exitTime?: string;
  totalHours?: number;
}

// Define Props type with optional 'refresh' prop
interface Props {
  refresh?: boolean;
}

export default function AttendanceTable({ refresh }: Props) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const token = localStorage.getItem("token");

  // Function to fetch all attendance records from the backend
  const fetchAttendance = () => {
    axios
      .get("http://localhost:5000/api/attendance/all", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAttendance(res.data))
      .catch(err => console.log(err));
  };

  // useEffect runs when the component mounts or 'refresh' changes
  useEffect(() => {
    fetchAttendance();
  }, [refresh]); // Dependency on refresh ensures table updates after changes

  // Function to delete an attendance record
  const deleteAttendance = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAttendance(); // Re-fetch after deletion
    } catch (err: any) {
      alert(err.response?.data?.message || "Error deleting attendance");
    }
  };

  // Function to edit attendance record (entry/exit times)
  const editAttendance = async (id: string) => {
    const entry = prompt("Enter new entry time (yyyy-mm-ddThh:mm):"); // Prompt for new entry
    const exit = prompt("Enter new exit time (yyyy-mm-ddThh:mm):");   // Prompt for new exit

    try {
      await axios.put(
        `http://localhost:5000/api/attendance/${id}`,
        { entryTime: entry, exitTime: exit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAttendance(); // Re-fetch after update
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating attendance");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Attendance Records</h2>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>User</th>
            <th>Date</th>
            <th>Entry Time</th>
            <th>Exit Time</th>
            <th>Total Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map(a => (
            <tr key={a._id} className="text-center border-t">
              {/* Display user's name or "Unknown" if missing */}
              <td>{a.user?.name || "Unknown"}</td>
              {/* Format and display the date */}
              <td>{a.date ? new Date(a.date).toLocaleDateString() : "-"}</td>
              {/* Format and display entry time */}
              <td>{a.entryTime ? new Date(a.entryTime).toLocaleTimeString() : "-"}</td>
              {/* Format and display exit time */}
              <td>{a.exitTime ? new Date(a.exitTime).toLocaleTimeString() : "-"}</td>
              {/* Display total hours worked */}
              <td>{a.totalHours ? a.totalHours.toFixed(2) : "-"}</td>
              {/* Action buttons */}
              <td className="space-x-2">
                <button
                  onClick={() => editAttendance(a._id)} // Edit attendance
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAttendance(a._id)} // Delete attendance
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
