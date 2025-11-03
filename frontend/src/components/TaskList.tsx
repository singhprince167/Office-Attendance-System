import { useEffect, useState } from "react";
import axios from "axios";

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedText, setCompletedText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/tasks/my-tasks", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTasks(res.data))
      .catch(err => console.log(err));
  }, []);

  const completeTask = async (taskId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`http://localhost:5000/api/tasks/complete/${taskId}`, { report: completedText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task marked as complete");
      setCompletedText("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error completing task");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">My Tasks</h2>
      {tasks.map(task => (
        <div key={task._id} className="border p-3 rounded shadow">
          <h3 className="font-semibold">{task.title}</h3>
          <p>{task.description}</p>
          {task.completedReport ? (
            <p className="text-green-600 font-semibold">Completed: {task.completedReport}</p>
          ) : (
            <>
              <textarea placeholder="Enter completion report" value={completedText} onChange={e => setCompletedText(e.target.value)} className="w-full p-2 border rounded mt-2"/>
              <button onClick={() => completeTask(task._id)} className="bg-green-600 text-white px-3 py-1 rounded mt-2 hover:bg-green-700">Complete Task</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
