import { useState, useEffect } from "react";
import axios from "axios";

export default function MyTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [reportText, setReportText] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  const token = localStorage.getItem("token");

  // Fetch my tasks
  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks/my-tasks", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTasks(res.data))
      .catch(err => console.log(err));
  }, []);

  const submitReport = async () => {
    if (!selectedTask || !reportText) return alert("Select a task and write report");
    try {
      await axios.post("http://localhost:5000/api/tasks/submit-report", { taskId: selectedTask, report: reportText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Report submitted");
      setReportText(""); setSelectedTask("");
      const res = await axios.get("http://localhost:5000/api/tasks/my-tasks", { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error submitting report");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">My Tasks</h2>
      <select className="w-full p-2 border rounded" value={selectedTask} onChange={e => setSelectedTask(e.target.value)}>
        <option value="">Select Task</option>
        {tasks.map(t => <option key={t._id} value={t._id}>{t.title} ({t.status})</option>)}
      </select>
      <textarea placeholder="Write your report here" className="w-full p-2 border rounded" value={reportText} onChange={e => setReportText(e.target.value)} />
      <button onClick={submitReport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit Report</button>
    </div>
  );
}
