const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/auth");

router.get("/all", auth.verifyToken, attendanceController.getAllAttendance);
router.put("/:id", auth.verifyToken, attendanceController.updateAttendance);
router.delete("/:id", auth.verifyToken, attendanceController.deleteAttendance);
router.post("/entry", auth.verifyToken, attendanceController.markEntry);
router.post("/exit", auth.verifyToken, attendanceController.markExit);
router.get("/today", auth.verifyToken, attendanceController.getTodayAttendance);

module.exports = router;
