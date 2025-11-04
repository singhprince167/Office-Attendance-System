import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router v6

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Base API URL depending on environment
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!email || !password) return alert("Please enter email and password");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // Save token, role, and name to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      // Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin/dashboard"); // Admin dashboard
      } else if (res.data.role === "hr") {
        navigate("/hr/dashboard"); // HR dashboard (separate)
      } else {
        navigate("/user/dashboard"); // User dashboard
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        {/* Form title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3 focus:outline-blue-500"
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-3 focus:outline-blue-500"
        />

        {/* Login button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
