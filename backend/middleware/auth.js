const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id and role
    next();
  } catch (err) {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }
  return res.status(401).json({ message: "Invalid token" });
}

};
