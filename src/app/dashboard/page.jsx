"use client";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Menu, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const data = [
    { name: "Bill", value: 25, color: "#7b93ff" },
    { name: "Food", value: 25, color: "#f3a7d3" },
    { name: "Shopping", value: 50, color: "#c5a3e8" },
  ];

  const handleChartClick = () => router.push("/chart");

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
      {/* Top beige header strip */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        <div className="flex items-center space-x-2">
          <ChevronLeft className="text-[#6b3e1f]" size={20} />
          <h1 className="text-md font-semibold">NOVEMBER 2025</h1>
          <ChevronRight className="text-[#6b3e1f]" size={20} />
        </div>

        {/* Hamburger button */}
        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4] active:scale-95 transition"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Click-away overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown panel */}
        {menuOpen && (
          <div
            className="absolute right-2 top-12 z-20 w-44 rounded-md border border-[#cbb89d] bg-white shadow-md overflow-hidden"
            role="menu"
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f6efe6]"
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              role="menuitem"
            >
              Profile
            </button>
            <div className="h-px bg-[#ead7c2]" />
            <button
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-[#fce9e9]"
              onClick={() => {
                setMenuOpen(false);
                router.push("/logout"); 
              }}
              role="menuitem"
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Clickable Pie Chart */}
      <div
        onClick={handleChartClick}
        className="w-full max-w-xs mt-6 cursor-pointer active:scale-95 transition-transform"
      >
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-3 text-xs mt-2">
          <span className="text-[#7b93ff] font-semibold">Bill 25%</span>
          <span className="text-[#f3a7d3] font-semibold">Food 25%</span>
          <span className="text-[#c5a3e8] font-semibold">Shopping 50%</span>
        </div>
      </div>

      {/* Income / Expense / Balance box */}
      <div className="mt-6 w-64 border border-gray-400 text-center rounded-sm overflow-hidden">
        <div className="flex">
          <div className="flex-1 bg-[#cce5cc] p-2 font-semibold text-[#2f5f2f]">
            Income
            <br />0.00฿
          </div>
          <div className="flex-1 bg-[#e7b3b3] p-2 font-semibold text-[#5f2f2f]">
            Expense
            <br />0.00฿
          </div>
        </div>
        <div className="bg-[#f4f4f4] p-2 font-semibold">Balance 0.00฿</div>
      </div>

      {/* Recently Added */}
      <div className="mt-8 w-72 border border-[#cbb89d] bg-[#f9f3ec] rounded-md p-4 text-left">
        <h2 className="text-[#8b4f21] font-semibold mb-3">Recently Added</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between items-center">
            <span>1 Water bill</span>
            <span className="bg-[#7b93ff] text-white text-xs px-2 py-0.5 rounded">Bill</span>
          </li>
          <li className="flex justify-between items-center">
            <span>2 Clothes</span>
            <span className="bg-[#c5a3e8] text-white text-xs px-2 py-0.5 rounded">Shopping</span>
          </li>
          <li className="flex justify-between items-center">
            <span>3 Noodles</span>
            <span className="bg-[#f3a7d3] text-white text-xs px-2 py-0.5 rounded">Food</span>
          </li>
          <li className="flex justify-between items-center">
            <span>4 Salary Oct25</span>
            <span className="bg-[#9cd89c] text-white text-xs px-2 py-0.5 rounded">Salary</span>
          </li>
        </ul>

        <div
          className="text-right text-[#8b4f21] text-xs mt-2 cursor-pointer hover:underline"
          onClick={() => router.push("/seemore")}
        >
          see more &gt;&gt;
        </div>
      </div>

      {/* Add Button */}
      <div className="mt-auto w-full bg-[#ead7c2] py-3 flex justify-center">
        <button
          onClick={() => router.push("/transaction")}
          className="bg-[#d5853c] text-white rounded-full p-3 shadow-md hover:bg-[#b96f2f]"
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
}
