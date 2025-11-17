"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, User } from "lucide-react";
import { getCurrentUser } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from API using X-User-Id header
  useEffect(() => {
    const loadUser = async () => {
      try {
        // If no userId in localStorage, treat as not logged in
        const storedUserId =
          typeof window !== "undefined"
            ? localStorage.getItem("userId")
            : null;

        if (!storedUserId) {
          router.replace("/login");
          return;
        }

        const data = await getCurrentUser(); // calls /users/me
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile", err);
        // If backend says user not found, just send them to login
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  const username = user?.username || "";
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "";

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

        {/* Right spacer to keep layout balanced */}
        <div className="w-[22px]" aria-hidden />
      </div>

      {/* Content */}
      <div className="w-full max-w-sm px-6 py-6 flex flex-col items-center">
        {/* User Icon */}
        <div className="w-36 h-36 rounded-full bg:white bg-white shadow-sm flex items-center justify-center mb-6">
          <User size={72} className="opacity-60" />
        </div>

        {/* Info Fields */}
        <div className="w-full space-y-4">
          <div>
            <div className="text-lg font-semibold mb-2">Username</div>
            <div className="w-full rounded-lg bg-[#eae0d1] px-4 py-3">
              {loading ? "Loading..." : username || "-"}
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold mb-2">Full Name</div>
            <div className="w-full rounded-lg bg-[#eae0d1] px-4 py-3">
              {loading ? "Loading..." : fullName || "-"}
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
