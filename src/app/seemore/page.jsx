"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export default function SeeMorePage() {
  const router = useRouter();

  // Example transaction data (added id)
  const transactions = [
    {
      id: "t1",
      category: "Shopping",
      type: "Expense",
      date: "1/1/25",
      amount: "100฿",
      color: "#c5a3e8",
      typeColor: "#d9a3a3",
    },
    {
      id: "t2",
      category: "Bill",
      type: "Expense",
      date: "1/1/25",
      amount: "100฿",
      color: "#7b93ff",
      typeColor: "#d9a3a3",
    },
    {
      id: "t3",
      category: "Food",
      type: "Expense",
      date: "1/1/25",
      amount: "50฿",
      color: "#f3a7d3",
      typeColor: "#d9a3a3",
    },
    {
      id: "t4",
      category: "Salary",
      type: "Income",
      date: "1/1/25",
      amount: "1000฿",
      color: "#9cd89c",
      typeColor: "#a8cbb1",
    },
  ];

  // navigate to transaction details page (frontend only)
  const openTx = (id) => {
    router.push("/details");
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
        <Menu className="text-[#6b3e1f]" size={24} />
      </div>

      {/* Month title */}
      <div className="flex items-center justify-center space-x-2 mt-3">
        <ChevronLeft className="text-[#5F5F5F]" size={18} />
        <h1 className="text-lg font-semibold text-[#5F5F5F]">NOVEMBER 2025</h1>
        <ChevronRight className="text-[#5F5F5F]" size={18} />
      </div>

      {/* Transaction list */}
      <div className="mt-6 w-80">
        <h2 className="text-lg font-semibold mb-3">Transaction List</h2>

        {/* Header row */}
        <div className="grid grid-cols-[2fr_1.4fr_1.2fr_1fr] gap-x-6 text-sm font-semibold border-b border-[#cbb89d] pb-2 mb-3 px-2">
          <span>Category</span>
          <span>Type</span>
          <span className="text-center">Date</span>
          <span className="text-right">Baht</span>
        </div>

        <ul className="space-y-3 text-sm">
          {transactions.map((item) => (
            <li
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => openTx(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openTx(item.id);
                }
              }}
              className="grid grid-cols-[2fr_1.4fr_1.2fr_1fr] gap-x-6 items-center rounded cursor-pointer hover:bg-[#ead7c2]/60 focus:outline-none focus:ring-2 focus:ring-[#cbb89d] px-2 py-2"
            >
              <span
                className="px-2 py-0.5 rounded text-[#6b3e1f] w-fit"
                style={{ backgroundColor: item.color }}
              >
                {item.category}
              </span>

              <span
                className="px-2 py-0.5 rounded text-[#6b3e1f] w-fit"
                style={{ backgroundColor: item.typeColor }}
              >
                {item.type}
              </span>

              <span className="text-center whitespace-nowrap">
                {item.date}
              </span>

              <span className="text-right whitespace-nowrap">
                {item.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
