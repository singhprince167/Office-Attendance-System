const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Fetch only normal users for task assignment
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("_id name email");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
