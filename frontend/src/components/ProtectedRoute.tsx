import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode; // ✅ covers single or multiple elements
  role: string; // expected role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem("token"); // JWT token
  const userRole = localStorage.getItem("role"); // role stored in localStorage

  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but wrong role
  if (userRole !== role) return <Navigate to="/login" replace />;

  // Logged in & correct role
  return <>{children}</>;
};

export default ProtectedRoute;
