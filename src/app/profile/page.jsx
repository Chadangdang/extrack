"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const user = {
    username: "ChadangInwza1234",
    fullName: "Chadang Phummarin",
  };

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f9f3ec] text-[#6b3e1f] flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        {/* Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 hover:opacity-80"
        >
          <ChevronLeft className="text-[#6b3e1f]" size={22} />
          <span className="font-semibold">Back</span>
        </button>

        {/* Centered Page Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-md font-semibold">
          Profile
        </h1>

        {/* Right spacer to keep layout balanced (since no hamburger) */}
        <div className="w-[22px]" aria-hidden />
      </div>
      {/* 👆 make sure this header div is CLOSED before content */}

      {/* Content */}
      <div className="w-full max-w-sm px-6 py-6 flex flex-col items-center">
        {/* User Icon */}
        <div className="w-36 h-36 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
          <User size={72} className="opacity-60" />
        </div>

        {/* Info Fields */}
        <div className="w-full space-y-4">
          <div>
            <div className="text-lg font-semibold mb-2">Username</div>
            <div className="w-full rounded-lg bg-[#eae0d1] px-4 py-3">
              {user.username}
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold mb-2">Full Name</div>
            <div className="w-full rounded-lg bg-[#eae0d1] px-4 py-3">
              {user.fullName}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Log Out Button */}
      <div className="mt-auto w-full bg-[#ead7c2] py-3 flex justify-center">
        <button
          onClick={goLogin}
          className="bg-[#d5853c] text-white rounded-full px-5 py-3 shadow-md hover:bg-[#74481f] active:scale-95 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
