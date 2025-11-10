import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; // ✅ Loader import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://office-attendance-system-backend.onrender.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return alert("Please enter email and password");

    setLoading(true); // ✅ Show loader

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      setTimeout(() => {
        setLoading(false); // ✅ Stop loader
        if (res.data.role === "admin") navigate("/admin/dashboard");
        else if (res.data.role === "hr") navigate("/hr/dashboard");
        else navigate("/user/dashboard");
      }, 1500); // ✅ Smooth transition

    } catch (err: any) {
      setLoading(false);
      if (err.response) alert(err.response.data.message || "Login failed");
      else if (err.request) alert("Server not responding");
      else alert("Error: " + err.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1622126807280-9b5b32b28e77?auto=format&fit=crop&q=80&w=1460")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {loading && <Loader />} {/* ✅ Loader visible above form */}

      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3 focus:outline-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-3 focus:outline-blue-500"
        />

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
