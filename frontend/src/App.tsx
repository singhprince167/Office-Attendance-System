import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import HrDashboard from "./pages/HrDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserAttendance from "./pages/UserAttendance";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* User routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/attendance" element={<UserAttendance />} />

        {/* HR & Admin routes */}
        <Route path="/hr/dashboard" element={<HrDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
