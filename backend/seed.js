const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdminUser = require("./models/AdminUser");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const hashed = await bcrypt.hash("123456", 10);

  const adminUsers = [
    { name: "Admin", email: "admin@example.com", password: hashed, role: "admin" },
    { name: "HR", email: "hr@example.com", password: hashed, role: "hr" }
  ];

  await AdminUser.deleteMany({});
  await AdminUser.insertMany(adminUsers);

  console.log("Admin/HR seed data inserted");
  process.exit();
};

seedData();
