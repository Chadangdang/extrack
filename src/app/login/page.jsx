"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import { getAllUsers } from "@/lib/api"; // 👈 NEW

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Temporary fake login (until real /auth/login is added)
  // Match by username (or email) and store the real userId
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill in username and password");
      return;
    }

    try {
      // 1) Load all users from the backend
      const users = await getAllUsers();

      const input = username.trim().toLowerCase();

      // 2) Find a user with matching username OR email
      const matchedUser =
        users.find(
          (u) =>
            (typeof u.username === "string" &&
              u.username.toLowerCase() === input) ||
            (typeof u.email === "string" &&
              u.email.toLowerCase() === input)
        ) || null;

      if (!matchedUser) {
        alert("User not found. Please check your username.");
        return;
      }

      // 3) Save session data
      //    username for display, userId for backend (X-User-Id header)
      localStorage.setItem(
        "username",
        matchedUser.username || username
      );
      localStorage.setItem("userId", matchedUser.userId); // 👈 IMPORTANT

      // 4) Redirect to dashboard with the display username
      const displayName = matchedUser.username || username;
      router.push(`/dashboard?user=${encodeURIComponent(displayName)}`);
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4e6d6] flex flex-col items-center">
      {/* Top beige strip */}
      <div className="w-full h-12 bg-[#ead7c2] shadow-sm"></div>

      <div className="w-full flex-1 flex items-start justify-center pt-6 pb-12 px-4">
        <div className="w-full max-w-sm bg-[#fbf7f3] rounded-2xl p-8 shadow-md text-center border border-transparent">
          {/* Logo */}
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
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
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
              className="w-full bg-[#e39a46] text-white font-semibold py-2 rounded-md hover:bg-[#c57b2b] transition"
            >
              LOGIN
            </button>
          </form>

          <p className="text-sm text-[#6b3e1f] mt-5">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#8b4f21] font-semibold hover:underline"
            >
              SIGN UP here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}