import Image from "next/image";
import Link from "next/link";
import { User, Lock } from "lucide-react";

export default function LoginPage() {
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
        
          </div>

          {/* Form */}
          <form className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-3 text-[#a06a3f]" size={20} />
              <input
                type="text"
                placeholder="USERNAME"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#e7d3bd] text-[#6b3e1f] placeholder-[#a07a59] outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#a06a3f]" size={20} />
              <input
                type="password"
                placeholder="PASSWORD"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#e7d3bd] text-[#6b3e1f] placeholder-[#a07a59] outline-none"
                required
              />
            </div>

            <div className="text-right">
              <Link href="#" className="text-xs text-[#8b4f21] hover:underline">
                Forgot Password?
              </Link>
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
            <Link href="/signup" className="text-[#8b4f21] font-semibold hover:underline">
              SIGN UP here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
