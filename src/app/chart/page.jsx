"use client";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight, Menu, ArrowLeft, Plus } from "lucide-react";

export default function ChartDetail() {
  const router = useRouter();

  const data = [
    { name: "Bill", value: 25, color: "#a9bcd0" },
    { name: "Food", value: 25, color: "#f3a7d3" },
    { name: "Shopping", value: 50, color: "#c5a3e8" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f] relative">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <ArrowLeft
            className="text-[#6b3e1f] cursor-pointer"
            onClick={() => router.push("/")}
            size={22}
          />
          <span className="font-semibold">Back to Dashboard</span>
        </div>
        <Menu className="text-[#6b3e1f]" size={22} />
      </div>

      {/* Month Title */}
      <div className="flex items-center justify-center space-x-2 mt-3">
        <ChevronLeft className="text-[#6b3e1f]" size={18} />
        <h1 className="text-lg font-semibold">NOVEMBER 2025</h1>
        <ChevronRight className="text-[#6b3e1f]" size={18} />
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

      {/* Category Breakdown */}
      <div className="mt-4 w-64">
        <div className="flex justify-between text-sm font-semibold border-b border-[#cbb89d] pb-1 mb-2">
          <span>Category</span>
          <span>(%)</span>
          <span>Baht</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="bg-[#c5a3e8] text-[#6b3e1f] px-2 py-0.5 rounded">Shopping</span>
            <span>50%</span>
            <span>100.00฿</span>
          </div>
          <div className="flex justify-between">
            <span className="bg-[#a9bcd0] text-[#6b3e1f] px-2 py-0.5 rounded">Bill</span>
            <span>25%</span>
            <span>100.00฿</span>
          </div>
          <div className="flex justify-between">
            <span className="bg-[#f3a7d3] text-[#6b3e1f] px-2 py-0.5 rounded">Food</span>
            <span>25%</span>
            <span>50.00฿</span>
          </div>
          <div className="flex justify-between">
            <span className="bg-[#d6b999] text-[#6b3e1f] px-2 py-0.5 rounded">Other</span>
            <span>0%</span>
            <span>00.00฿</span>
          </div>
        </div>
      </div>

      {/* Bottom Add Button */}
      <div className="mt-auto w-full bg-[#ead7c2] py-3 flex justify-center">
        <button 
        onClick={() => router.push("/transaction")}
        className="bg-[#d5853c] text-white rounded-full p-3 shadow-md hover:bg-[#b96f2f]">
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
}
