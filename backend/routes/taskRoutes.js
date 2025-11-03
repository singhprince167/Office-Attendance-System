const express = require("express");
const router = express.Router();
const {
  assignTask,
  getMyTasks,
  submitReport,
  getAllTasks
} = require("../controllers/taskController");
const { verifyToken } = require("../middleware/auth"); // ✅ fixed import

// Routes
router.post("/assign", verifyToken, assignTask);
router.get("/my-tasks", verifyToken, getMyTasks);
router.post("/submit/:id", verifyToken, submitReport);
router.get("/all", verifyToken, getAllTasks);

module.exports = router;
