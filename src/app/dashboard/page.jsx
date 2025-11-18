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
import { useEffect, useState, useMemo, Suspense } from "react";

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

function DashboardPage() {
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
    <div className="flex flex-col items-center bg-[#f9f3ec] min-h-screen text-[#6b3e1f]">
      {/* Header */}
      <div className="relative flex justify-between items-center bg-[#ead7c2] px-4 w-full h-12">
        <div className="flex items-center space-x-2">
          <ChevronLeft
            className="text-[#6b3e1f] cursor-pointer"
            size={20}
            onClick={goPrevMonth}
          />
          <h1 className="font-semibold text-md">
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
          className="hover:bg-[#e3cdb4] p-2 rounded"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Click-away */}
        {menuOpen && (
          <div
            className="z-10 fixed inset-0"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown */}
        {menuOpen && (
          <div className="top-12 right-2 z-20 absolute bg-white shadow-md border border-[#cbb89d] rounded-md w-44">
            <button
              className="hover:bg-[#f6efe6] px-3 py-2 w-full text-left text-sm"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>
            <div className="bg-[#ead7c2] h-px" />
            <button
              className="hover:bg-[#fce9e9] px-3 py-2 w-full text-left text-red-600 text-sm"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div
        onClick={() =>
          router.push(
            `/chart?yyyy=${selectedMonth.yyyy}&mm=${selectedMonth.mm}`
          )
        }
        className="mt-6 w-full max-w-xs transition-transform cursor-pointer active:scale-95"
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
          <div className="flex justify-center items-center border border-[#cbb89d] border-dashed rounded h-[180px]">
            <p>No data for this month</p>
          </div>
        )}

        {/* Percent tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
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
      <div className="mt-6 border border-gray-400 rounded-sm w-64 text-center overflow-hidden">
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
      <div className="bg-[#f9f3ec] mt-8 p-4 border border-[#cbb89d] rounded-md w-72 text-left">
        <h2 className="mb-3 font-semibold text-[#8b4f21]">
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
                  <span className="text-[#6b3e1f]/70 text-xs">
                    {formatDateLabel(tx.date)}
                  </span>
                </div>

                <span
                  className="px-2 py-0.5 rounded font-semibold text-xs"
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
          className="text-right mt-2 text-[#8b4f21] text-xs hover:underline cursor-pointer"
          onClick={() =>
            router.push(
              `/seemore?yyyy=${selectedMonth.yyyy}&mm=${selectedMonth.mm}`
            )
          }
        >
          see more &gt;&gt;
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-center bg-[#ead7c2] mt-auto py-3 w-full">
        <button
          onClick={() => router.push("/transaction")}
          className="bg-[#d5853c] hover:bg-[#b96f2f] shadow-md p-3 rounded-full text-white"
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  )
}