const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // store date as YYYY-MM-DD string for easy equality/search
  date: { type: String, required: true },
  entryTime: { type: Date },
  exitTime: { type: Date },
  entryLocation: {
    lat: Number,
    lng: Number,
  },
  exitLocation: {
    lat: Number,
    lng: Number,
  },
  totalHours: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
