"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

import { getLookups, getTransactionsByMonth } from "@/lib/api";

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}฿`;
}

function formatDateLabel(iso) {
  const d = new Date(iso ?? "");
  if (Number.isNaN(d.getTime())) return iso ?? "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(yyyy, mm) {
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

function shiftMonth({ yyyy, mm }, delta) {
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  d.setMonth(d.getMonth() + delta);
  return {
    yyyy: String(d.getFullYear()),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
  };
}

function parseMonthParams(searchParams) {
  const now = new Date();
  const fallback = {
    yyyy: String(now.getFullYear()),
    mm: String(now.getMonth() + 1).padStart(2, "0"),
  };

  const yearParam = searchParams?.get("yyyy");
  const monthParam = searchParams?.get("mm");

  if (!yearParam || !monthParam) return fallback;

  const normalizedMonth = String(monthParam).padStart(2, "0");
  const monthValue = Number(normalizedMonth);

  const yearValid = /^\d{4}$/.test(yearParam);
  const monthValid = monthValue >= 1 && monthValue <= 12;

  if (yearValid && monthValid) {
    return { yyyy: yearParam, mm: normalizedMonth };
  }

  return fallback;
}

function SeeMorePage() {
  const router = useRouter();
  const params = useSearchParams();
  const searchString = params?.toString();

  const [selectedMonth, setSelectedMonth] = useState(() =>
    parseMonthParams(params)
  );
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setSelectedMonth(parseMonthParams(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [lookups, txs] = await Promise.all([
          getLookups(),
          getTransactionsByMonth(selectedMonth.yyyy, selectedMonth.mm),
        ]);

        if (!active) return;

        setCategories(lookups?.categories || []);
        setTransactions(Array.isArray(txs) ? txs : []);
      } catch (err) {
        console.error("See more error:", err);
        if (!active) return;
        setCategories([]);
        setTransactions([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [selectedMonth]);

  const colorMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.key, cat.color));
    return map;
  }, [categories]);

  const categoryNameMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.key, cat.name));
    return map;
  }, [categories]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aDate = new Date(a.createdAt || a.date || 0).getTime();
      const bDate = new Date(b.createdAt || b.date || 0).getTime();
      return aDate - bDate;
    });
  }, [transactions]);

  const currLabel = monthLabel(selectedMonth.yyyy, selectedMonth.mm);

  const goPrevMonth = () => setSelectedMonth((prev) => shiftMonth(prev, -1));
  const goNextMonth = () => setSelectedMonth((prev) => shiftMonth(prev, 1));

  const handleLogout = () => {
    try {
      localStorage.removeItem("username");
    } catch {}
    setMenuOpen(false);
    router.replace("/login");
  };

  const handleCardClick = (tx) => {
    try {
      const payload = {
        ...tx,
        categoryName: categoryNameMap.get(tx.category) || tx.category,
      };
      sessionStorage.setItem("selectedTransaction", JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to cache transaction", err);
    }

    const key = tx.sk || tx.id || tx._id || "";
    const query = key ? `?tx=${encodeURIComponent(key)}` : "";
    router.push(`/details${query}`);
  };

  return (
    <div className="flex flex-col items-center bg-[#f9f3ec] min-h-screen text-[#6b3e1f]">
      <div className="relative flex justify-between items-center bg-[#ead7c2] px-4 w-full h-12">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 font-semibold text-[#6b3e1f] text-sm hover:underline"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="hover:bg-[#e3cdb4] p-2 rounded"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {menuOpen && (
          <div
            className="z-10 fixed inset-0"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {menuOpen && (
          <div className="top-12 right-2 z-20 absolute bg-white shadow-md border border-[#cbb89d] rounded-md w-44">
            <button
              className="hover:bg-[#f6efe6] px-3 py-2 w-full text-left text-sm"
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
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

      <div className="flex justify-center items-center space-x-2 mt-3">
        <button type="button" onClick={goPrevMonth} aria-label="Previous month">
          <ChevronLeft className="text-[#6b3e1f]" size={18} />
        </button>
        <h1 className="font-semibold text-[#5F5F5F] text-lg">{currLabel}</h1>
        <button type="button" onClick={goNextMonth} aria-label="Next month">
          <ChevronRight className="text-[#5F5F5F]" size={18} />
        </button>
      </div>

      <div className="mt-6 px-4 pb-8 w-full max-w-md">
        <h2 className="mb-3 font-semibold text-lg">All Transactions</h2>
        <div className="grid grid-cols-[1.5fr_1fr_1fr] mb-3 px-2 pb-2 border-[#cbb89d] border-b font-semibold text-[#8b4f21] text-xs">
          <span>Details</span>
          <span className="text-center">Date</span>
          <span className="text-right">Amount</span>
        </div>

        {loading ? (
          <p className="text-[#8b4f21] text-center text-sm">Loading...</p>
        ) : sortedTransactions.length === 0 ? (
          <p className="text-[#8b4f21] text-center text-sm">
            No transactions for this month.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sortedTransactions.map((tx) => {
              return (
                <li
                  key={tx.sk || tx.id}
                  onClick={() => handleCardClick(tx)}
                  className="items-center gap-3 grid grid-cols-[1.5fr_1fr_1fr] bg-white shadow-sm hover:shadow-md px-2 py-2 rounded transition cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{tx.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[#6b3e1f]/70 text-[11px]">
                      <span
                        className="px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: colorMap.get(tx.category) || "#b08d6d" }}
                      >
                        {categoryNameMap.get(tx.category) || tx.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          tx.type === "Income"
                            ? "bg-[#a8cbb1] text-[#2f5f2f]"
                            : "bg-[#d9a3a3] text-[#5f2f2f]"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                  </div>

                  <span className="text-center text-xs">
                    {formatDateLabel(tx.date || tx.createdAt)}
                  </span>

                  <span
                    className={`text-right font-semibold ${
                      tx.type === "Income" ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {tx.type === "Expense" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SeeMorePage />
    </Suspense>
  )
}