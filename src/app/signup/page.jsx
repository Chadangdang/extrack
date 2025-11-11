import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center">
      {/* Top beige header strip */}
      <div className="w-full h-12 bg-[#ead7c2] shadow-sm"></div>

      {/* Main signup box */}
      <div className="w-full flex-1 flex items-start justify-center pt-6 pb-12 px-4">
        <div className="w-full max-w-sm bg-[#f9f3ec] rounded-2xl p-8 shadow-md border border-transparent text-center">
          <h1 className="text-lg font-semibold text-[#8b4f21] mb-8">
            –CREATE AN ACCOUNT–
          </h1>

          <form className="space-y-5 text-left">
            {/* Name */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                NAME
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                required
              />
            </div>

            {/* Surname */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                SURNAME
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                required
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                DOB
              </label>
              <input
                type="date"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                USERNAME
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                required
              />
            </div>

            {/* Signup button */}
            <div className="flex justify-center pt-3">
              <button
                type="submit"
                className="bg-[#d5853c] text-white font-semibold py-2 px-6 rounded-md hover:bg-[#b96f2f] transition"
              >
                SIGNUP
              </button>
            </div>
          </form>

          {/* Back to Login link */}
          <p className="text-sm text-[#6b3e1f] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#8b4f21] font-semibold hover:underline">
              LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
