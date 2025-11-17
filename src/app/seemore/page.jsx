"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function SeeMorePage() {
  const router = useRouter();
  const params = useSearchParams();
  const searchString = params?.toString();

  const [selectedMonth, setSelectedMonth] = useState(() =>
    parseMonthParams(params)
  );
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

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

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-sm font-semibold text-[#6b3e1f] hover:underline"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goPrevMonth}
            className="p-1 rounded hover:bg-[#d8c3ab]"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-md font-semibold text-[#5F5F5F]">{currLabel}</h1>
          <button
            type="button"
            aria-label="Next month"
            onClick={goNextMonth}
            className="p-1 rounded hover:bg-[#d8c3ab]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md px-4 pb-8">
        <h2 className="text-lg font-semibold mb-3">All Transactions</h2>
        <div className="grid grid-cols-[1.5fr_1fr_1fr] text-xs font-semibold text-[#8b4f21] border-b border-[#cbb89d] pb-2 mb-3 px-2">
          <span>Details</span>
          <span className="text-center">Date</span>
          <span className="text-right">Amount</span>
        </div>

        {loading ? (
          <p className="text-center text-sm text-[#8b4f21]">Loading...</p>
        ) : sortedTransactions.length === 0 ? (
          <p className="text-center text-sm text-[#8b4f21]">
            No transactions for this month.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sortedTransactions.map((tx) => {
              const paymentLabel =
                tx.paymentMethod || tx.payment_method || tx.method;

              return (
                <li
                  key={tx.sk || tx.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr] gap-3 items-center rounded px-2 py-2 bg-white shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{tx.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6b3e1f]/70 mt-0.5">
                      <span
                        className="px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: colorMap.get(tx.category) || "#b08d6d" }}
                      >
                        {categoryNameMap.get(tx.category) || tx.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#ead7c2] text-[#6b3e1f]">
                        {tx.type}
                      </span>
                      {paymentLabel && (
                        <span className="px-2 py-0.5 rounded bg-[#f4e8da] text-[#6b3e1f]">
                          {paymentLabel}
                        </span>
                      )}
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
