const User = require("../models/User");
const AdminUser = require("../models/AdminUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 LOGIN (Admin, HR, User — )
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣  AdminUser check 
    let user = await AdminUser.findOne({ email });

    // 2️⃣  AdminUser 
    if (!user) {
      user = await User.findOne({ email });
    }

    // if user not found
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4️⃣ JWT token generate
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Response
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 GET ALL USERS (Admin/HR )
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 REGISTER (User create karne ke liye)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role, // 'user' only (admin/hr alag table me hai)
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { name, email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// authController.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

