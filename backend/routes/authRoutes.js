const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Login
router.post("/login", authController.login);

// Get all users
router.get("/users", auth.verifyToken, authController.getAllUsers);



// Register user (Admin/HR only)
router.post("/register", auth.verifyToken, (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, authController.registerUser);

// Current user info
router.get("/me", auth.verifyToken, async (req, res) => {
  try {
    const user = await require("../models/User")
      .findById(req.user.id)
      .select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
