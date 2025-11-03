const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    report: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
