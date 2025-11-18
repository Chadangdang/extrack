"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  Filter,
} from "lucide-react";

import { getLookups, getTransactionsByMonth } from "@/lib/api";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}฿`;
}

function formatPrettyDate(iso) {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
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

function getMonthBounds({ yyyy, mm }) {
  const start = new Date(Number(yyyy), Number(mm) - 1, 1);
  const end = new Date(Number(yyyy), Number(mm), 0);
  const now = new Date();
  const sameMonth =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth();
  const effectiveEnd = sameMonth
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : end;
  return { start, end: effectiveEnd };
}

function formatInputDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ChartDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(() => {
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
  });

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const lookups = await getLookups();
        if (!active) return;
        setCategories(lookups?.categories || []);
        const methods =
          lookups?.paymentMethods ||
          lookups?.payment_methods ||
          lookups?.methods ||
          [];
        setPaymentMethods(methods);
      } catch (err) {
        console.error("Chart lookups error:", err);
        if (!active) return;
        setCategories([]);
        setPaymentMethods([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const txs = await getTransactionsByMonth(
        selectedMonth.yyyy,
        selectedMonth.mm
      );
      setTransactions(Array.isArray(txs) ? txs : []);
    } catch (err) {
      console.error("Chart transactions error:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setStartDate("");
    setEndDate("");
  }, [selectedMonth]);

  const monthBounds = useMemo(
    () => getMonthBounds(selectedMonth),
    [selectedMonth]
  );

  const monthStartInput = formatInputDate(monthBounds.start);
  const monthEndInput = formatInputDate(monthBounds.end);

  const handleStartChange = (value) => {
    if (value && (value < monthStartInput || value > monthEndInput)) {
      return;
    }
    setStartDate(value);
    setEndDate((prev) => (value && prev && prev < value ? value : prev));
  };

  const handleEndChange = (value) => {
    if (value && (value < monthStartInput || value > monthEndInput)) {
      return;
    }
    setEndDate(value);
    setStartDate((prev) => (value && prev && prev > value ? value : prev));
  };

  const effectiveStart = startDate || endDate || "";
  const effectiveEnd = endDate || startDate || "";

  const rangeLabel = useMemo(() => {
    if (!effectiveStart && !effectiveEnd) {
      return monthLabel(selectedMonth.yyyy, selectedMonth.mm);
    }
    if (effectiveStart === effectiveEnd) {
      return formatPrettyDate(effectiveStart);
    }
    return `${formatPrettyDate(effectiveStart)} - ${formatPrettyDate(
      effectiveEnd
    )}`;
  }, [effectiveEnd, effectiveStart, selectedMonth]);

  const colorMap = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.key, c.color));
    return m;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    const startTs = effectiveStart ? new Date(effectiveStart).setHours(0, 0, 0, 0) : null;
    const endTs = effectiveEnd ? new Date(effectiveEnd).setHours(23, 59, 59, 999) : null;

    return transactions.filter((tx) => {
      if (typeFilter && tx.type !== typeFilter) return false;
      if (categoryFilter && tx.category !== categoryFilter) return false;

      const txPayment =
        tx.paymentMethod ||
        tx.paymentMethodKey ||
        tx.payment_method;
      if (methodFilter && txPayment !== methodFilter) return false;

      if (startTs || endTs) {
        const dateValue = tx.date || tx.createdAt || tx.updatedAt;
        if (!dateValue) return false;
        const normalizedDate = new Date(dateValue);
        if (Number.isNaN(normalizedDate.getTime())) return false;
        const dayStart = normalizedDate.setHours(0, 0, 0, 0);
        if (startTs && dayStart < startTs) return false;
        if (endTs && dayStart > endTs) return false;
      }
      return true;
    });
  }, [
    transactions,
    categoryFilter,
    methodFilter,
    typeFilter,
    effectiveStart,
    effectiveEnd,
  ]);

  const pieData = useMemo(() => {
    const grouped = new Map();
    filteredTransactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      const key = tx.category;
      grouped.set(key, (grouped.get(key) || 0) + amount);
    });

    return Array.from(grouped.entries()).map(([key, value]) => ({
      key,
      name: categories.find((c) => c.key === key)?.name || key,
      value,
      color: colorMap.get(key) || "#d5cbbb",
    }));
  }, [filteredTransactions, categories, colorMap]);

  const totalValue = useMemo(
    () => pieData.reduce((sum, entry) => sum + entry.value, 0),
    [pieData]
  );

  const categoryRows = useMemo(() => {
    return [...pieData].sort((a, b) => b.value - a.value);
  }, [pieData]);

  const goCategory = (cat) => {
    router.push(`/transaction-detail?category=${encodeURIComponent(cat)}`);
  };

  const goPrevMonth = () => setSelectedMonth((prev) => shiftMonth(prev, -1));
  const goNextMonth = () => setSelectedMonth((prev) => shiftMonth(prev, 1));

  const handleLogout = () => {
    try {
      localStorage.removeItem("username");
    } catch {}
    setMenuOpen(false);
    router.replace("/login");
  };

  const handleApplyFilter = () => {
    fetchTransactions();
    setFiltersOpen(false);
  };

  const startInputMax = monthEndInput;
  const endInputMin = startDate || monthStartInput;

  return (
    <div className="flex flex-col items-center bg-[#f9f3ec] pb-24 min-h-screen text-[#6b3e1f] overflow-y-auto">
      {/* Header */}
      <div className="relative flex justify-between items-center bg-[#ead7c2] px-4 w-full h-12">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 font-semibold text-[#6b3e1f]"
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

      {/* Month Title */}
      <div className="flex justify-center items-center space-x-2 mt-3">
        <button type="button" onClick={goPrevMonth}>
          <ChevronLeft className="text-[#6b3e1f]" size={18} />
        </button>
        <h1 className="font-semibold text-[#5F5F5F] text-lg">
          {monthLabel(selectedMonth.yyyy, selectedMonth.mm)}
        </h1>
        <button type="button" onClick={goNextMonth}>
          <ChevronRight className="text-[#5F5F5F]" size={18} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-3 w-72">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex justify-between items-center bg-[#c0a88d] hover:opacity-95 shadow-sm px-4 py-3 rounded-lg w-full transition active:scale-95"
        >
          <span className="font-semibold text-lg text-white/95">Filter</span>
          <Filter className="text-white/95" size={20} />
        </button>

        {filtersOpen && (
          <div className="space-y-2 bg-[#fff9f0] mt-2 p-3 border border-[#cbb89d] rounded-md text-sm">
            <div className="gap-2 grid grid-cols-2">
              <div>
                <label className="block mb-1 font-semibold text-xs">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={monthStartInput}
                  max={startInputMax}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="bg-[#f4e8d9] px-2 py-1 border border-[#cbb89d] rounded-sm w-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-xs">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={endInputMin}
                  max={monthEndInput}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="bg-[#f4e8d9] px-2 py-1 border border-[#cbb89d] rounded-sm w-full focus:outline-none"
                />
              </div>
            </div>

            <p className="mt-1 text-[#6b3e1f]/70 text-xs">
              Selected: <span className="font-semibold">{rangeLabel}</span>
            </p>

            <div>
              <label className="block mb-1 font-semibold text-xs">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#f4e8d9] px-2 py-1 border border-[#cbb89d] rounded-sm w-full focus:outline-none"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-xs">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-[#f4e8d9] px-2 py-1 border border-[#cbb89d] rounded-sm w-full focus:outline-none"
              >
                <option value="">All</option>
                {paymentMethods.map((method) => (
                  <option key={method.key || method.id} value={method.key || method.id}>
                    {method.name || method.label || method.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-xs">Type</label>
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

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="bg-[#d5853c] hover:bg-[#b96f2f] px-4 py-1.5 rounded font-semibold text-sm text-white transition active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="flex flex-col items-center mt-3 p-3 border border-[#8b6b49] rounded-md w-72">
        {loading ? (
          <p>Loading chart...</p>
        ) : pieData.length === 0 ? (
          <p>No data for this selection.</p>
        ) : (
          <ResponsiveContainer width={200} height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="mt-4 mb-4 w-72">
        <div className="grid grid-cols-[1.5fr_0.5fr_1fr] mb-2 pb-1 border-[#cbb89d] border-b font-semibold text-sm">
          <span>Category</span>
          <span className="text-center">(%)</span>
          <span className="text-right">Baht</span>
        </div>

        {categoryRows.length === 0 ? (
          <p className="text-[#6b3e1f]/70 text-center text-sm">
            No transactions found.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {categoryRows.map((row) => (
              <div
                key={row.key}
                className="items-center gap-2 grid grid-cols-[1.5fr_0.5fr_1fr] hover:bg-[#ead7c2]/60 px-2 py-1 rounded cursor-pointer"
                onClick={() => goCategory(row.key)}
              >
                <span
                  className="px-2 py-0.5 rounded text-[#6b3e1f]"
                  style={{ backgroundColor: row.color || "#ead7c2" }}
                >
                  {row.name}
                </span>
                <span className="font-semibold text-[#6b3e1f] text-center">
                  {totalValue
                    ? Math.round((row.value / totalValue) * 100)
                    : 0}
                  %
                </span>
                <span className="text-right">{formatCurrency(row.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Add Button */}
      <div className="bottom-0 left-0 z-20 fixed flex justify-center bg-[#ead7c2] py-3 w-full">
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
      <ChartDetail />
    </Suspense>
  )
}