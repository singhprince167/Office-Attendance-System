const mongoose = require("mongoose");

const workReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  report: { type: String, required: true },
});

module.exports = mongoose.model("WorkReport", workReportSchema);
