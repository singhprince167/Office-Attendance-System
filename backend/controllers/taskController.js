const Task = require("../models/Task");
const User = require("../models/User");

// ✅ Assign Task (Admin/HR)
exports.assignTask = async (req, res) => {
  try {
    const { title, description, assignee } = req.body; // frontend se assignee bheja jaa raha

    if (!title || !description || !assignee) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(assignee);
    if (!user) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    const task = new Task({
      title,
      description,
      assignee,
      status: "pending", // Default
    });

    await task.save();
    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get My Tasks (User) — Only pending/in-progress
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignee: req.user.id,
      status: { $ne: "completed" },
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching user tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Submit Task Report (User)
exports.submitReport = async (req, res) => {
  try {
    const { report } = req.body;
    const { id } = req.params;

    if (!report) return res.status(400).json({ message: "Report is required" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignee.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    task.report = report;
    task.status = "completed"; // mark completed
    await task.save();

    res.json({ message: "Report submitted successfully", task });
  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Tasks (Admin/HR)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignee", "name email role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching all tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};
