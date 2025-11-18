"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import { useState } from "react";
import { getAdmins } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Fetch all admins from the table
      const admins = await getAdmins();

      // Find matching admin by username
      const admin = admins.find(
        (a) => a.username && a.username.toLowerCase() === username.toLowerCase()
      );

      if (!admin) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Check if admin is active
      if (admin.status && admin.status.toLowerCase() !== "active") {
        setError("Admin account is not active");
        setLoading(false);
        return;
      }

      // Verify password (assuming password is stored in the admin object)
      // If your table doesn't have password field, you can use a hardcoded password
      // or implement your own password verification logic
      const storedPassword = admin.password || "1234"; // Default password if not in table
      
      if (password !== storedPassword) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Login successful - store admin info
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminId", admin.adminId);
      localStorage.setItem("username", admin.username);
      localStorage.setItem("adminStatus", admin.status || "active");

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4e6d6] flex flex-col items-center">
      {/* Top beige strip (the "tab" across the top) */}
      <div className="w-full h-12 bg-[#ead7c2] shadow-sm"></div>

      {/* Main content area */}
      <div className="w-full flex-1 flex items-start justify-center pt-6 pb-12 px-4">
        <div className="w-full max-w-sm bg-[#fbf7f3] rounded-2xl p-8 shadow-md text-center border border-transparent">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center">
              <Image
                src="/orca.png"
                alt="Orca Logo"
                width={460}
                height={460}
                className="w-44 sm:w-52 md:w-64 h-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-[#6b3e1f] mt-4">
              ADMIN LOGIN
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-[#a06a3f]"
                size={20}
              />
              <input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#e7d3bd] text-[#6b3e1f] placeholder-[#a07a59] outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-[#a06a3f]"
                size={20}
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#e7d3bd] text-[#6b3e1f] placeholder-[#a07a59] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e39a46] text-white font-semibold py-2 rounded-md hover:bg-[#c57b2b] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}