"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Menu, Camera } from "lucide-react";

export default function AddTransactionPage() {
  const router = useRouter();

  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // ESC closes menu
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    if (typeof window !== "undefined") window.addEventListener("keydown", onKey);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("keydown", onKey);
    };
  }, []);

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
    {/* Header - back to dashboard */}
    <div
      className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 cursor-pointer"
      onClick={() => router.push("/dashboard")}
    >
      <div className="flex items-center space-x-2">
        <ChevronLeft className="text-[#6b3e1f]" size={22} />
        <span className="font-semibold">Back</span>
      </div>
  
        {/* Hamburger */}
        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4] active:scale-95 transition"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
        )}

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute right-2 top-12 z-20 w-40 rounded-md border border-[#cbb89d] bg-white shadow-md overflow-hidden"
            role="menu"
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f6efe6]"
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
            >
              Profile
            </button>
            <div className="h-px bg-[#ead7c2]" />
            <button
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-[#fce9e9]"
              onClick={() => {
                setMenuOpen(false);
                goLogin();
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Title (same spacing as EditTransactionPage) */}
      <h1 className="text-lg font-semibold mt-6">Add Transaction</h1>

      {/* Form */}
      <div className="mt-4 w-72 space-y-3 text-sm">
        {/* Name */}
        <div>
          <label className="font-semibold">Name</label>
          <input
            type="text"
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="font-semibold">Amount</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
            />
            <span>Baht</span>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="font-semibold">Type</label>
          <div className="flex space-x-2 mt-1">
            <button
              type="button"
              aria-pressed={type === "Income"}
              onClick={() => setType("Income")}
              className={`font-semibold px-3 py-1 rounded transition ${
                type === "Income"
                  ? "bg-[#a8cbb1] text-[#2f5f2f] shadow-sm"
                  : "bg-[#e2efe6] text-[#2f5f2f]/70 hover:opacity-80"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              aria-pressed={type === "Expense"}
              onClick={() => setType("Expense")}
              className={`font-semibold px-3 py-1 rounded transition ${
                type === "Expense"
                  ? "bg-[#d9a3a3] text-[#5f2f2f] shadow-sm"
                  : "bg-[#f0e1e1] text-[#5f2f2f]/70 hover:opacity-80"
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="font-semibold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Bill">Bill</option>
            <option value="Travel">Travel</option>
            <option value="Salary">Salary</option>
            <option value="Others">Other</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="font-semibold">Date</label>
          <input
            type="date"
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="font-semibold">Payment Method</label>
          <select className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none">
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="font-semibold">Note</label>
          <textarea
            rows="2"
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          />
        </div>

        {/* Upload Receipt */}
        <div className="flex flex-col items-center mt-3">
          <label className="font-semibold mb-1">Upload receipt</label>
          <div className="bg-[#ead7c2] p-3 rounded-full shadow-md cursor-pointer hover:bg-[#d6c2a8]">
            <Camera className="text-[#6b3e1f]" size={28} />
          </div>
        </div>

        {/* Save Button */}
    <div className="mt-8 flex justify-center">
    <button className="bg-[#d5853c] text-white font-semibold rounded-md px-6 py-2 shadow-md hover:bg-[#b96f2f]">
    Save Transaction
    </button>
    </div>
      </div>
    </div>
  );
}