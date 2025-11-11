"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Menu, Camera } from "lucide-react";

export default function AddTransactionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f9f3ec] text-[#6b3e1f] flex flex-col items-center">
      {/* Header - Back to Dashboard */}
      <div
        onClick={() => router.push("/dashboard")}
        className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <ChevronLeft className="text-[#6b3e1f]" size={20} />
          <span className="font-semibold">Back to Dashboard</span>
        </div>
        <Menu className="text-[#6b3e1f]" size={24} />
      </div>

      {/* Title */}
      <h1 className="text-lg font-semibold mt-4">Add Transaction</h1>

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
            <span className="bg-[#a8cbb1] text-[#2f5f2f] font-semibold px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Income
            </span>
            <span className="bg-[#d9a3a3] text-[#5f2f2f] font-semibold px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Expense
            </span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="font-semibold">Category</label>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="bg-[#f3a7d3] px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Food
            </span>
            <span className="bg-[#c5a3e8] px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Shopping
            </span>
            <span className="bg-[#7b93ff] px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Bill
            </span>
            <span className="bg-[#f5e97d] px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Travel
            </span>
            <span className="bg-[#9cd89c] px-3 py-1 rounded cursor-pointer hover:opacity-80">
              Salary
            </span>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="font-semibold">Date</label>
          <div className="flex items-center">
            <input
              type="date"
              className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
            />
          </div>
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
          ></textarea>
        </div>

        {/* Upload Receipt */}
        <div className="flex flex-col items-center mt-3">
          <label className="font-semibold mb-1">Upload receipt</label>
          <div className="bg-[#ead7c2] p-3 rounded-full shadow-md cursor-pointer hover:bg-[#d6c2a8]">
            <Camera className="text-[#6b3e1f]" size={28} />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-4 flex justify-center">
          <button className="bg-[#d5853c] text-white font-semibold rounded-md px-6 py-2 shadow-md hover:bg-[#b96f2f]">
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
