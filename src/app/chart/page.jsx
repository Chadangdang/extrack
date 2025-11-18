"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  Filter,
} from "lucide-react";

export default function ChartDetail() {
  const router = useRouter();

  const data = [
    { name: "Bill", value: 25, color: "#a9bcd0" },
    { name: "Food", value: 25, color: "#f3a7d3" },
    { name: "Shopping", value: 50, color: "#c5a3e8" },
  ];

  // click category → go to Transaction Details (frontend only for now)
  const goCategory = (cat) => {
    router.push(`/transaction-detail?category=${encodeURIComponent(cat)}`);
  };

  // filter panel state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState("");     // yyyy-mm-dd

  // helper to format yyyy-mm-dd → "1 Nov 2025"
  const formatPrettyDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (Number.isNaN(date.getTime())) return iso;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // text under filter: month name by default, otherwise range
  const rangeLabel = (() => {
    if (!startDate && !endDate) {
      return "November 2025"; // default month name
    }
    if (startDate && endDate) {
      return `${formatPrettyDate(startDate)} - ${formatPrettyDate(endDate)}`;
    }
    if (startDate) return formatPrettyDate(startDate);
    if (endDate) return formatPrettyDate(endDate);
    return "November 2025";
  })();

  const handleApplyFilter = () => {
    const params = new URLSearchParams();
  
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
  
    if (!startDate && !endDate) {
      params.set("month", "2025-11"); // NOVEMBER 2025
    }
  
    if (categoryFilter) params.set("category", categoryFilter);
    if (methodFilter) params.set("method", methodFilter);
    if (typeFilter) params.set("type", typeFilter);
  
    const qs = params.toString();

    router.push(qs ? `/category?${qs}` : "/category");
  
    setFiltersOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f] pb-24 overflow-y-auto">
      {/* Header - back to dashboard */}
      <div
        className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        <div className="flex items-center space-x-2">
          <ChevronLeft className="text-[#6b3e1f]" size={22} />
          <span className="font-semibold">Back</span>
        </div>
        <Menu className="text-[#6b3e1f]" size={24} />
      </div>

      {/* Month Title */}
      <div className="flex items-center justify-center space-x-2 mt-3">
        <ChevronLeft className="text-[#6b3e1f]" size={18} />
        <h1 className="text-lg font-semibold text-[#5F5F5F]">NOVEMBER 2025</h1>
        <ChevronRight className="text-[#5F5F5F]" size={18} />
      </div>

      {/* Filter bar */}
      <div className="w-72 mt-3">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg bg-[#c0a88d] px-4 py-3 shadow-sm hover:opacity-95 active:scale-95 transition"
        >
          <span className="text-lg font-semibold text-white/95">Filter</span>
          <Filter className="text-white/95" size={20} />
        </button>

        {filtersOpen && (
          <div className="mt-2 border border-[#cbb89d] rounded-md p-3 bg-[#fff9f0] space-y-2 text-sm">
            {/* Date range (calendar inputs) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
                />
              </div>
            </div>

            {/* Display current selection */}
            <p className="text-xs text-[#6b3e1f]/70 mt-1">
              Selected: <span className="font-semibold">{rangeLabel}</span>
            </p>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
              >
                <option value="">All</option>
                <option value="Food">Food</option>
                <option value="Shopping">Shopping</option>
                <option value="Bill">Bill</option>
                <option value="Food">Travel</option>
                <option value="Food">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
              <div className="flex gap-2">
                {["", "Income", "Expense"].map((t) => (
                  <button
                    key={t || "All"}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded transition ${
                      typeFilter === t
                        ? t === "Income"
                          ? "bg-[#a8cbb1] text-[#2f5f2f]"
                          : t === "Expense"
                          ? "bg-[#d9a3a3] text-[#5f2f2f]"
                          : "bg-[#ead7c2] text-[#6b3e1f]"
                        : "bg-[#f4e8d9] text-[#6b3e1f]/70 hover:opacity-80"
                    }`}
                  >
                    {t || "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-4 py-1.5 rounded bg-[#d5853c] text-white text-sm font-semibold hover:bg-[#b96f2f] active:scale-95 transition"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="mt-3 border border-[#8b6b49] p-2 rounded-md">
        <ResponsiveContainer width={200} height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown (rows clickable → transaction-detail) */}
      <div className="mt-4 w-64 mb-4">
        <div className="flex justify-between text-sm font-semibold border-b border-[#cbb89d] pb-1 mb-2">
          <span>Category</span>
          <span>(%)</span>
          <span>Baht</span>
        </div>

        <div className="space-y-2 text-sm">
          <div
            className="flex justify-between items-center rounded px-2 py-1 cursor-pointer hover:bg-[#ead7c2]/60"
            onClick={() => goCategory("Shopping")}
          >
            <span className="bg-[#c5a3e8] text-[#6b3e1f] px-2 py-0.5 rounded">
              Shopping
            </span>
            <span>50%</span>
            <span>100.00฿</span>
          </div>

          <div
            className="flex justify-between items-center rounded px-2 py-1 cursor-pointer hover:bg-[#ead7c2]/60"
            onClick={() => goCategory("Bill")}
          >
            <span className="bg-[#a9bcd0] text-[#6b3e1f] px-2 py-0.5 rounded">
              Bill
            </span>
            <span>25%</span>
            <span>100.00฿</span>
          </div>

          <div
            className="flex justify-between items-center rounded px-2 py-1 cursor-pointer hover:bg-[#ead7c2]/60"
            onClick={() => goCategory("Food")}
          >
            <span className="bg-[#f3a7d3] text-[#6b3e1f] px-2 py-0.5 rounded">
              Food
            </span>
            <span>25%</span>
            <span>50.00฿</span>
          </div>

          <div
            className="flex justify-between items-center rounded px-2 py-1 cursor-pointer hover:bg-[#ead7c2]/60"
            onClick={() => goCategory("Other")}
          >
            <span className="bg-[#d6b999] text-[#6b3e1f] px-2 py-0.5 rounded">
              Other
            </span>
            <span>0%</span>
            <span>00.00฿</span>
          </div>
        </div>
      </div>

      {/* Bottom Add Button */}
      <div className="w-full bg-[#ead7c2] py-3 flex justify-center fixed bottom-0 left-0 z-20">
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
