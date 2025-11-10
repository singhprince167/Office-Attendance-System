// src/pages/AdminHRDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface IAttendance {
  _id: string;
  user: IUser;
  date: string;
  entryTime?: string | Date;
  exitTime?: string | Date;
  totalHours?: string;
  entryLocation?: { lat: number; lng: number };
  exitLocation?: { lat: number; lng: number };
}

interface ITask {
  _id: string;
  title: string;
  description: string;
  assignee: IUser;
  report?: string;
  status?: string;
}

/** ReadMore component to truncate long text */
const ReadMore: React.FC<{ text?: string; limit?: number }> = ({
  text = "-",
  limit = 80,
}) => {
  const [open, setOpen] = useState(false);
  if (!text) return <span>-</span>;
  if (text.length <= limit) return <span>{text}</span>;
  return (
    <span className="whitespace-normal break-words">
      {open ? text : text.slice(0, limit) + "... "}
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 underline ml-1 text-sm"
      >
        {open ? "Show less" : "Read more"}
      </button>
    </span>
  );
};

export default function AdminHRDashboard() {
  // State variables
  const [users, setUsers] = useState<IUser[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("");
  const [editItem, setEditItem] = useState<IAttendance | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [viewTask, setViewTask] = useState<ITask | null>(null);

  const token = localStorage.getItem("token");

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://office-attendance-system-backend.onrender.com";


  const fetchAll = useCallback(async () => {
    try {
      const resUsers = await axios.get(`${BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(resUsers.data || []);

      const resAttendance = await axios.get(`${BASE_URL}/api/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(resAttendance.data || []);

      const resTasks = await axios.get(`${BASE_URL}/api/tasks/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(resTasks.data || []);
    } catch (err) {
      console.error("fetchAll error:", err);
    }
  }, [BASE_URL, token]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("You have been logged out due to inactivity.");
        handleLogout();
      }, 2 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const registerUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword)
      return alert("All fields required");
    try {
      await axios.post(
        `${BASE_URL}/api/auth/register`,
        {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: "user",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User registered successfully!");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setShowUserModal(false);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to register user");
    }
  };

  const assignTask = async () => {
    if (!title || !desc || !assignee) return alert("Fill all fields!");
    try {
      await axios.post(
        `${BASE_URL}/api/tasks/assign`,
        { title, description: desc, assignee },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task assigned!");
      setTitle("");
      setDesc("");
      setAssignee("");
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign task.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Task deleted!");
      fetchAll();
    } catch (err) {
      console.error("delete task error:", err);
      alert("Failed to delete task.");
    }
  };

  // Attendance helpers
  const toTimeInputValue = (t?: string | Date | null) => {
    if (!t) return "";
    if (typeof t === "string") {
      const d = new Date(t);
      return isNaN(d.getTime()) ? "" : d.toISOString().substring(11, 16);
    }
    if (t instanceof Date)
      return isNaN(t.getTime()) ? "" : t.toISOString().substring(11, 16);
    return "";
  };

  const combineDateAndTimeToISO = (dateStr: string, timeStr?: string) => {
    if (!timeStr) return undefined;
    const iso = new Date(`${dateStr}T${timeStr}`);
    return isNaN(iso.getTime()) ? undefined : iso.toISOString();
  };

  const handleEdit = (item: IAttendance) => {
    setEditItem({
      ...item,
      date: item.date.includes("T") ? item.date.split("T")[0] : item.date,
      entryTime: toTimeInputValue(item.entryTime),
      exitTime: toTimeInputValue(item.exitTime),
    });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      const entryISO = combineDateAndTimeToISO(
        editItem.date,
        editItem.entryTime as string
      );
      const exitISO = combineDateAndTimeToISO(
        editItem.date,
        editItem.exitTime as string
      );
      let totalHours = editItem.totalHours || "";
      if (entryISO && exitISO) {
        const diffHours =
          (new Date(exitISO).getTime() - new Date(entryISO).getTime()) /
          (1000 * 60 * 60);
        totalHours = diffHours >= 0 ? diffHours.toFixed(2) : "";
      }
      await axios.put(
        `${BASE_URL}/api/attendance/${editItem._id}`,
        {
          date: editItem.date,
          entryTime: entryISO,
          exitTime: exitISO,
          totalHours,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Attendance updated!");
      setEditItem(null);
      fetchAll();
    } catch (err) {
      console.error("update error:", err);
      alert("Failed to update attendance.");
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this attendance?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Attendance deleted!");
      fetchAll();
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete attendance.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0 text-gray-800">
          Admin Dashboard
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition"
          >
            Add User
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Register New User</h2>
            <input
              type="text"
              placeholder="Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={registerUser}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg relative">
            <h2 className="text-xl font-semibold mb-2">{viewTask.title}</h2>
            <p className="mb-2"><strong>Description:</strong> {viewTask.description}</p>
            <p className="mb-4"><strong>Report:</strong> {viewTask.report || "-"}</p>
            <button
              onClick={() => setViewTask(null)}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Assign Task + Registered Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Assign Task */}
        <div className="bg-white p-4 rounded shadow flex flex-col gap-2">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Assign Task</h2>
          <input
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
          />
          <textarea
            placeholder="Task Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border p-2 w-full"
          />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select User</option>
            {users
              .filter((u) => u.role === "user")
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
          </select>
          <button
            onClick={assignTask}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Assign Task
          </button>
        </div>

        {/* All Registered Users */}
        <div className="bg-white p-4 rounded shadow overflow-auto max-h-[50vh]">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            All Registered Users
          </h2>
          <table className="min-w-[600px] w-full border text-sm sm:text-base">
            <thead className="bg-gray-200 sticky top-0 z-20">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          All Attendance Records
        </h2>

        {/* ✅ Only table content scroll karega */}
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="min-w-[800px] w-full border text-sm sm:text-base">
            <thead className="bg-gray-200 sticky top-0 z-20">
              <tr>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Entry</th>
                <th className="p-2 border">Exit</th>
                <th className="p-2 border">Hours</th>
                <th className="p-2 border">Entry Loc</th>
                <th className="p-2 border">Exit Loc</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{a.user?.name || "-"}</td>
                  <td className="p-2 border">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">
                    {a.entryTime
                      ? new Date(a.entryTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    {a.exitTime
                      ? new Date(a.exitTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="p-2 border">{a.totalHours || "-"}</td>

                  <td className="p-2 border text-center">
                    {a.entryLocation ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${a.entryLocation.lat},${a.entryLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-2 border text-center">
                    {a.exitLocation ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${a.exitLocation.lat},${a.exitLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-2 border flex gap-1">
                    {editItem?._id === a._id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditItem(null)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(a)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(a._id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {attendance.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Tasks Table */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          All Tasks (Pending & Completed)
        </h2>
        <div className="overflow-x-auto overflow-y-auto max-h-[50vh] border rounded">
          <table className="w-full border-collapse table-auto text-sm sm:text-base min-w-[900px]">
            <thead className="bg-gray-200 sticky top-0 z-20">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Assignee</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Report</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const status = (t.status || "pending").toLowerCase().trim();
                const statusColor =
                  status === "completed" ? "text-green-600" : "text-orange-600";

                return (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="p-2 border break-words">{t.title}</td>
                    <td className="p-2 border break-words whitespace-normal">
                      <ReadMore text={t.description} />
                    </td>
                    <td className="p-2 border break-words">{t.assignee?.name || "-"}</td>
                    <td className={`p-2 border capitalize break-words font-semibold ${statusColor}`}>
                      {status}
                    </td>
                    <td className="p-2 border break-words whitespace-normal">
                      <ReadMore text={t.report} />
                    </td>
                    <td className="p-2 border flex gap-1">
                      <button
                        onClick={() => setViewTask(t)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
