const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr"], required: true }
}, { collection: "adminusers" }); // Explicit collection name

module.exports = mongoose.model("AdminUser", AdminUserSchema);
