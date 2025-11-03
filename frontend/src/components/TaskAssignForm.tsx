"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Props {
  onTaskAssigned?: () => void;
}

export default function TaskAssignForm({ onTaskAssigned }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const token = localStorage.getItem("token");

  // Fetch normal users for dropdown
  useEffect(() => {
    axios.get("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setUsers(res.data))
    .catch(err => console.log(err));
  }, []);

  const assignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) return alert("Select a user to assign task");

    try {
      await axios.post(
        "http://localhost:5000/api/tasks/assign",
        { title, description, assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task assigned successfully!");
      setTitle(""); setDescription(""); setAssignedTo("");
      if (onTaskAssigned) onTaskAssigned();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error assigning task");
    }
  };

  return (
    <div className="p-4 border rounded shadow my-4">
      <h3 className="text-xl font-bold mb-2">Assign Task</h3>
      <form onSubmit={assignTask} className="space-y-2">
        <input
          type="text"
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <select
          className="w-full p-2 border rounded"
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          required
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Assign Task
        </button>
      </form>
    </div>
  );
}
