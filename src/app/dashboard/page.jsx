"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Menu, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import {
  getLookups,
  getTransactionsByMonth,
  getCurrentUser,
} from "@/lib/api";

// Utility: format currency
function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}฿`;
}

// Utility: date -> label like "10 Nov"
function formatDateLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Utility: month name
function monthLabel(yyyy, mm) {
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

// Move +1 / -1 month
function shiftMonth({ yyyy, mm }, delta) {
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  d.setMonth(d.getMonth() + delta);
  return {
    yyyy: String(d.getFullYear()),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Safe username state
const [loginUsername, setLoginUsername] = useState("");

// Read from URL + localStorage on client ONLY
useEffect(() => {
  const urlUser = params.get("user");
  const saved = typeof window !== "undefined"
    ? localStorage.getItem("username")
    : "";

  setLoginUsername(urlUser || saved || "");
}, [params]);

  // Dropdown state
  const [menuOpen, setMenuOpen] = useState(false);

  // Month state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      yyyy: String(now.getFullYear()),
      mm: String(now.getMonth() + 1).padStart(2, "0"),
    };
  });

  // API state
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);

  // Close menu using ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetch data whenever month changes
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [lookups, txs, profile] = await Promise.all([
          getLookups(),
          getTransactionsByMonth(selectedMonth.yyyy, selectedMonth.mm),
          getCurrentUser(),
        ]);

        if (!active) return;

        setCategories(lookups.categories || []);
        setTransactions(txs || []);
        setUser(profile || null);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [selectedMonth]);

  // Category color mapping
  const colorMap = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.key, c.color));
    return m;
  }, [categories]);

  // Compute monthly totals
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === "Income") acc.income += amount;
        else if (tx.type === "Expense") acc.expense += amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  // Compute pie chart by category
  const pieData = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      const key = tx.category;
      grouped.set(key, (grouped.get(key) || 0) + amount);
    });

    return Array.from(grouped.entries()).map(([key, value]) => ({
      name:
        categories.find((c) => c.key === key)?.name ??
        key,
      value,
      color: colorMap.get(key) ?? "#d5cbbb",
    }));
  }, [transactions, categories, colorMap]);

  // Total for % calculation
  const totalValue = pieData.reduce((s, d) => s + d.value, 0);

  // Latest 4 transactions
  const recent = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  }, [transactions]);

  // Use username from login OR backend
  const username = loginUsername || user?.username || "";

  const goPrevMonth = () =>
    setSelectedMonth((prev) => shiftMonth(prev, -1));
  const goNextMonth = () =>
    setSelectedMonth((prev) => shiftMonth(prev, 1));

  const handleLogout = () => {
    localStorage.removeItem("username");
    setMenuOpen(false);
    router.replace("/login");
  };

  const currLabel = monthLabel(
    selectedMonth.yyyy,
    selectedMonth.mm
  );

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        <div className="flex items-center space-x-2">
          <ChevronLeft
            className="text-[#6b3e1f] cursor-pointer"
            size={20}
            onClick={goPrevMonth}
          />
          <h1 className="text-md font-semibold">
            {currLabel}
          </h1>
          <ChevronRight
            className="text-[#6b3e1f] cursor-pointer"
            size={20}
            onClick={goNextMonth}
          />
        </div>

        {/* Hamburger */}
        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4]"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Click-away */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-2 top-12 z-20 w-44 rounded-md border border-[#cbb89d] bg-white shadow-md">
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f6efe6]"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>
            <div className="h-px bg-[#ead7c2]" />
            <button
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-[#fce9e9]"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div
        onClick={() => router.push("/chart")}
        className="w-full max-w-xs mt-6 cursor-pointer active:scale-95 transition-transform"
      >
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center border border-dashed border-[#cbb89d] rounded">
            <p>No data for this month</p>
          </div>
        )}

        {/* Percent tags */}
        <div className="flex justify-center flex-wrap gap-3 text-xs mt-2">
          {pieData.map((d) => (
            <span
              key={d.name}
              className="font-semibold"
              style={{ color: d.color }}
            >
              {d.name}{" "}
              {totalValue
                ? Math.round((d.value / totalValue) * 100)
                : 0}
              %
            </span>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 w-64 border border-gray-400 text-center rounded-sm overflow-hidden">
        <div className="flex">
          <div className="flex-1 bg-[#cce5cc] p-2 font-semibold text-[#2f5f2f]">
            Income
            <br />
            {formatCurrency(totals.income)}
          </div>
          <div className="flex-1 bg-[#e7b3b3] p-2 font-semibold text-[#5f2f2f]">
            Expense
            <br />
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div className="bg-[#f4f4f4] p-2 font-semibold">
          Balance {formatCurrency(totals.balance)}
        </div>
      </div>

      {/* Recent */}
      <div className="mt-8 w-72 border border-[#cbb89d] bg-[#f9f3ec] rounded-md p-4 text-left">
        <h2 className="text-[#8b4f21] font-semibold mb-3">
          Recently Added
        </h2>

        {recent.length === 0 ? (
          <p>No recent transactions.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recent.map((tx) => (
              <li
                key={tx.sk}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="block font-semibold">
                    {tx.name}
                  </span>
                  <span className="text-xs text-[#6b3e1f]/70">
                    {formatDateLabel(tx.date)}
                  </span>
                </div>

                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    background:
                      colorMap.get(tx.category) || "#ccc",
                    color: "white",
                  }}
                >
                  {
                    categories.find(
                      (c) => c.key === tx.category
                    )?.name
                  }
                </span>
              </li>
            ))}
          </ul>
        )}

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