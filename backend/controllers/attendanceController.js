const Attendance = require("../models/Attendance");
const User = require("../models/User");
require("dotenv").config();

// Haversine distance (meters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Read office coords & radius from env with defaults
const OFFICE_LAT = parseFloat(process.env.OFFICE_LAT || "26.881061");
const OFFICE_LNG = parseFloat(process.env.OFFICE_LNG || "80.982332");
const GEOFENCE_METERS = parseFloat(process.env.GEOFENCE_METERS || "50");

// Helper to get YYYY-MM-DD string
function todayDateString() {
  return new Date().toISOString().split("T")[0];
}

// Mark Entry
exports.markEntry = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user; // be safe
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const distance = getDistanceMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
    if (distance > GEOFENCE_METERS) {
      return res.status(400).json({ message: `You are ${Math.round(distance)}m away from office. Must be within ${GEOFENCE_METERS}m.` });
    }

    const dateStr = todayDateString();

    let attendance = await Attendance.findOne({ userId, date: dateStr });
    if (attendance && attendance.entryTime) {
      return res.status(400).json({ message: "Entry already marked" });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: dateStr,
        entryTime: new Date(),
        entryLocation: { lat, lng },
      });
    } else {
      attendance.entryTime = new Date();
      attendance.entryLocation = { lat, lng };
    }

    await attendance.save();
    res.json({ message: "Entry marked successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark Exit
exports.markExit = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user;
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const distance = getDistanceMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
    if (distance > GEOFENCE_METERS) {
      return res.status(400).json({ message: `You are ${Math.round(distance)}m away from office. Must be within ${GEOFENCE_METERS}m.` });
    }

    const dateStr = todayDateString();

    const attendance = await Attendance.findOne({ userId, date: dateStr });
    if (!attendance || !attendance.entryTime) {
      return res.status(400).json({ message: "Entry not marked yet" });
    }
    if (attendance.exitTime) {
      return res.status(400).json({ message: "Exit already marked" });
    }

    attendance.exitTime = new Date();
    attendance.exitLocation = { lat, lng };
    attendance.totalHours = (((attendance.exitTime - attendance.entryTime) / (1000 * 60 * 60))).toFixed(2);

    await attendance.save();
    res.json({ message: "Exit marked successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Today's Attendance (User)
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user;
    const dateStr = todayDateString();
    const attendance = await Attendance.findOne({ userId, date: dateStr });
    res.json(attendance || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Attendance (Admin/HR)
exports.getAllAttendance = async (req, res) => {
  try {
    const allAttendance = await Attendance.find()
      .populate("userId", "name email role")
      .sort({ date: -1 });

    // send consistent shape for frontend
    const formatted = allAttendance.map((a) => ({
      _id: a._id,
      user: a.userId,
      date: a.date,
      entryTime: a.entryTime,
      exitTime: a.exitTime,
      totalHours: a.totalHours,
      entryLocation: a.entryLocation,
      exitLocation: a.exitLocation,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Attendance (optional, for HR/Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await Attendance.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Attendance not found" });
    res.json({ message: "Attendance updated", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Attendance (optional, for HR/Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Attendance not found" });
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update & Delete left as before (no change needed)
