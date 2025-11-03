import { useState } from "react";
import axios from "axios";

interface Props {
  task: any;
  users: any[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditTaskModal({ task, users, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);

  const updateTask = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, 
        { title, description, assignedTo }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h2 className="text-lg font-bold mb-2">Edit Task</h2>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Title"/>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Description"/>
        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select User</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={updateTask} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Update</button>
        </div>
      </div>
    </div>
  );
}
