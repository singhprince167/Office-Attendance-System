// middleware/geofence.js
exports.checkGeofence = (req, res, next) => {
  const officeLat = 26.8467; // Example: Lucknow office latitude
  const officeLng = 80.9462; // Example: Lucknow office longitude
  const maxDistance = 500000; // meters, allowed distance from office

  const { lat, lng } = req.body;

  if (!lat || !lng) return res.status(400).json({ message: "Location required" });

  const distance = getDistanceFromLatLonInMeters(lat, lng, officeLat, officeLng);
  console.log("Distance from office:", distance);

  if (distance > maxDistance) {
    return res.status(403).json({ message: "You are outside office premises" });
  }

  next();
};

// Helper: Calculate distance between two coordinates
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius of Earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
