"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/api";

const initialState = {
  firstName: "",
  lastName: "",
  dob: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      dob: formData.dob,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    if (trimmed.password !== trimmed.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!trimmed.dob) {
      setError("Date of birth is required.");
      return;
    }

    const dobDate = new Date(trimmed.dob);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (Number.isNaN(dobDate.getTime()) || dobDate > now) {
      setError("DOB must be today or earlier.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call your API Gateway via src/lib/api.js
      await createUser({
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        username: trimmed.username,
        email: trimmed.email,
        password: trimmed.password,
        dob: trimmed.dob,
        // confirmPassword is only for frontend validation, no need to send
      });

      setSuccess("Account created successfully! Redirecting...");
      setFormData(initialState);

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
  }
  };

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center">
      <div className="w-full h-12 bg-[#ead7c2] shadow-sm"></div>

      <div className="w-full flex-1 flex items-start justify-center pt-6 pb-12 px-4">
        <div className="w-full max-w-sm bg-[#f9f3ec] rounded-2xl p-8 shadow-md border border-transparent text-center">
          <h1 className="text-lg font-semibold text-[#8b4f21] mb-8">
            –CREATE AN ACCOUNT–
          </h1>

          <form className="space-y-5 text-left" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="firstName">
                NAME
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="First name"
                autoComplete="given-name"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="lastName">
                SURNAME
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="Last name"
                autoComplete="family-name"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="dob">
                DOB
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                max={today}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="username">
                USERNAME
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="Username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b4f21] text-sm font-semibold mb-1" htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-2 px-3 rounded-md bg-[#e7d3bd] text-[#6b3e1f] outline-none placeholder-[#a26b3c]"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>

            {(error || success) && (
              <p className={`text-sm ${error ? "text-red-600" : "text-green-700"}`}>
                {error || success}
              </p>
            )}

            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#d5853c] text-white font-semibold py-2 px-6 rounded-md hover:bg-[#b96f2f] transition disabled:opacity-60"
              >
                {isSubmitting ? "CREATING..." : "SIGNUP"}
              </button>
            </div>
          </form>

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