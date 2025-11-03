const express = require("express");
const router = express.Router();
const WorkReport = require("../models/WorkReport");
const auth = require("../middleware/auth");

// 📝 Submit Work Report
router.post("/submit", auth.verifyToken, async (req, res) => {
  try {
    const { userId, report } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const existing = await WorkReport.findOne({ userId, date: today });
    if (existing) return res.status(400).json({ message: "Report already submitted today." });

    const newReport = new WorkReport({ userId, report, date: today });
    await newReport.save();

    res.json({ message: "Work report submitted successfully!", newReport });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
