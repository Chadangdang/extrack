"use client";

import { useRouter } from "next/navigation";
import {
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

export default function ChartDetail() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      yyyy: String(now.getFullYear()),
      mm: String(now.getMonth() + 1).padStart(2, "0"),
    };
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
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-[#6b3e1f] font-semibold"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4]"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {menuOpen && (
          <div className="absolute right-2 top-12 z-20 w-44 rounded-md border border-[#cbb89d] bg-white shadow-md">
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f6efe6]"
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
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

      {/* Month Title */}
      <div className="flex items-center justify-center space-x-2 mt-3">
        <button type="button" onClick={goPrevMonth}>
          <ChevronLeft className="text-[#6b3e1f]" size={18} />
        </button>
        <h1 className="text-lg font-semibold text-[#5F5F5F]">
          {monthLabel(selectedMonth.yyyy, selectedMonth.mm)}
        </h1>
        <button type="button" onClick={goNextMonth}>
          <ChevronRight className="text-[#5F5F5F]" size={18} />
        </button>
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={monthStartInput}
                  max={startInputMax}
                  onChange={(e) => handleStartChange(e.target.value)}
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
                  min={endInputMin}
                  max={monthEndInput}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-[#6b3e1f]/70 mt-1">
              Selected: <span className="font-semibold">{rangeLabel}</span>
            </p>

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
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

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
                {paymentMethods.map((method) => (
                  <option key={method.key || method.id} value={method.key || method.id}>
                    {method.name || method.label || method.title}
                  </option>
                ))}
              </select>
            </div>

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
      <div className="mt-3 border border-[#8b6b49] p-3 rounded-md w-72 flex flex-col items-center">
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
      <div className="mt-4 w-72 mb-4">
        <div className="grid grid-cols-[1.5fr_0.5fr_1fr] text-sm font-semibold border-b border-[#cbb89d] pb-1 mb-2">
          <span>Category</span>
          <span className="text-center">(%)</span>
          <span className="text-right">Baht</span>
        </div>

        {categoryRows.length === 0 ? (
          <p className="text-center text-sm text-[#6b3e1f]/70">
            No transactions found.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {categoryRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[1.5fr_0.5fr_1fr] items-center gap-2 rounded px-2 py-1 cursor-pointer hover:bg-[#ead7c2]/60"
                onClick={() => goCategory(row.key)}
              >
                <span
                  className="text-[#6b3e1f] px-2 py-0.5 rounded"
                  style={{ backgroundColor: row.color || "#ead7c2" }}
                >
                  {row.name}
                </span>
                <span className="text-center font-semibold text-[#6b3e1f]">
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
