"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export default function SeeMorePage() {
  const router = useRouter();

  // Example transaction data
  const transactions = [
    {
      category: "Shopping",
      type: "Expense",
      date: "1/1/25",
      amount: "100฿",
      color: "#c5a3e8",
      typeColor: "#d9a3a3",
    },
    {
      category: "Bill",
      type: "Expense",
      date: "1/1/25",
      amount: "100฿",
      color: "#7b93ff",
      typeColor: "#d9a3a3",
    },
    {
      category: "Food",
      type: "Expense",
      date: "1/1/25",
      amount: "50฿",
      color: "#f3a7d3",
      typeColor: "#d9a3a3",
    },
    {
      category: "Salary",
      type: "Income",
      date: "1/1/25",
      amount: "1000฿",
      color: "#9cd89c",
      typeColor: "#a8cbb1",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
      {/* Header - back to dashboard */}
      <div
        className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        <div className="flex items-center space-x-2">
          <ChevronLeft className="text-[#6b3e1f]" size={22} />
          <span className="font-semibold">Back to Dashboard</span>
        </div>
        <Menu className="text-[#6b3e1f]" size={24} />
      </div>

      {/* Month title */}
      <div className="flex items-center justify-center space-x-2 mt-3">
        <ChevronLeft className="text-[#6b3e1f]" size={18} />
        <h1 className="text-lg font-semibold">NOVEMBER 2025</h1>
        <ChevronRight className="text-[#6b3e1f]" size={18} />
      </div>

      {/* Transaction list */}
      <div className="mt-6 w-72">
        <h2 className="text-lg font-semibold mb-3">Transaction List</h2>

        <div className="grid grid-cols-[1.6fr_1.2fr_1fr_1fr] gap-x-4 text-sm font-semibold border-b border-[#cbb89d] pb-1 mb-2">
          <span>Category</span>
          <span>Type</span>
          <span>Date</span>
          <span>Baht</span>
        </div>

        <ul className="space-y-2 text-sm">
          {transactions.map((item, idx) => (
            <li key={idx} className="grid grid-cols-[1.6fr_1.2fr_1fr_1fr] gap-x-4 items-center">
              <span
                className="px-2 py-0.5 rounded text-[#6b3e1f]"
                style={{ backgroundColor: item.color }}
              >
                {item.category}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[#6b3e1f]"
                style={{ backgroundColor: item.typeColor }}
              >
                {item.type}
              </span>
              <span>{item.date}</span>
              <span>{item.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
