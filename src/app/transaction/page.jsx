"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Menu, Camera } from "lucide-react";
import {
  getLookups,
  createTransaction,
  getReceiptUploadUrl,
} from "@/lib/api";

export default function AddTransactionPage() {
  const router = useRouter();

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [amountInt, setAmountInt] = useState("");
  const [amountCents, setAmountCents] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Receipt upload
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptName, setReceiptName] = useState("");
  const fileInputRef = useRef(null);

  // ESC closes menu
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKey);
      }
    };
  }, []);

  // Load categories + payment methods from API
  useEffect(() => {
    let cancelled = false;

    const loadLookups = async () => {
      try {
        setLoadingLookups(true);
        const data = await getLookups();
        if (cancelled) return;

        const cats = data.categories ?? [];
        const pms = data.paymentMethods ?? [];

        setCategories(cats);
        setPaymentMethods(pms);

        // Set defaults if empty
        if (!category && cats.length > 0) {
          setCategory(cats[0].name || "");
        }
        if (!paymentMethod && pms.length > 0) {
          setPaymentMethod(pms[0].name || "");
        }
      } catch (err) {
        console.error("Failed to load lookups", err);
        if (!cancelled) {
          setError("Failed to load categories and payment methods.");
        }
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    };

    loadLookups();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  // Helpers for amount inputs
  const handleAmountIntChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setAmountInt(digitsOnly);
  };

  const handleAmountCentsChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 2);
    setAmountCents(digitsOnly);
  };

  // File input handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setReceiptFile(null);
      setReceiptName("");
      return;
    }
    setReceiptFile(file);
    setReceiptName(file.name);
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Validate + normalize fields ---
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const formattedName =
      trimmedName.charAt(0).toUpperCase() +
      trimmedName.slice(1).toLowerCase();

    const intPart = parseInt(amountInt || "0", 10);
    const centsPart = parseInt(amountCents || "0", 10);
    const amount = intPart + centsPart / 100;

    if (!amount || amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!paymentMethod) {
      setError("Payment method is required.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    const safeNote = note.trim();
    let receiptKey = null;

    setIsSubmitting(true);
    try {
      // Upload receipt if present
      if (receiptFile) {
        const { uploadUrl, key } = await getReceiptUploadUrl(
          receiptFile.name,
          receiptFile.type
        );

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": receiptFile.type,
          },
          body: receiptFile,
        });

        if (!uploadRes.ok) {
          console.error("S3 upload error", await uploadRes.text());
          throw new Error("Failed to upload receipt");
        }

        receiptKey = key;
      }

      const payload = {
        name: formattedName,
        amount,
        category,
        date,
        paymentMethod,
        note: safeNote,
        type,
        receiptKey,
      };

      await createTransaction(payload);

      setSuccess("Transaction saved successfully.");
      // Option: redirect to dashboard after success
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to create transaction", err);
      setError("Failed to create transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f]">
      {/* Header - back to dashboard */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4">
        <button
          type="button"
          className="flex items-center space-x-2"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="text-[#6b3e1f]" size={22} />
          <span className="font-semibold">Back</span>
        </button>

        {/* Hamburger */}
        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4] active:scale-95 transition"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute right-2 top-12 z-20 w-40 rounded-md border border-[#cbb89d] bg-white shadow-md overflow-hidden"
            role="menu"
          >
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
              onClick={() => {
                setMenuOpen(false);
                goLogin();
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-lg font-semibold mt-6">Add Transaction</h1>

      {/* Error / Success */}
      {(error || success) && (
        <div className="mt-3 w-72 text-sm">
          {error && <p className="text-red-600">{error}</p>}
          {!error && success && <p className="text-green-700">{success}</p>}
        </div>
      )}

      {/* Form */}
      <form
        className="mt-4 w-72 space-y-3 text-sm mb-8"
        onSubmit={handleSubmit}
      >
        {/* Name */}
        <div>
          <label className="font-semibold">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
            placeholder="e.g. Water, Noodles"
          />
        </div>

        {/* Amount (int . cents) */}
        <div>
          <label className="font-semibold">Amount</label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="text"
              inputMode="numeric"
              value={amountInt}
              onChange={handleAmountIntChange}
              className="flex-1 border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none"
              placeholder="0"
            />
            <span className="font-semibold">.</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountCents}
              onChange={handleAmountCentsChange}
              maxLength={2}
              className="w-14 border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 focus:outline-none text-center"
              placeholder="00"
            />
            <span>Baht</span>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="font-semibold">Type</label>
          <div className="flex space-x-2 mt-1">
            <button
              type="button"
              aria-pressed={type === "Income"}
              onClick={() => setType("Income")}
              className={`font-semibold px-3 py-1 rounded transition ${
                type === "Income"
                  ? "bg-[#a8cbb1] text-[#2f5f2f] shadow-sm"
                  : "bg-[#e2efe6] text-[#2f5f2f]/70 hover:opacity-80"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              aria-pressed={type === "Expense"}
              onClick={() => setType("Expense")}
              className={`font-semibold px-3 py-1 rounded transition ${
                type === "Expense"
                  ? "bg-[#d9a3a3] text-[#5f2f2f] shadow-sm"
                  : "bg-[#f0e1e1] text-[#5f2f2f]/70 hover:opacity-80"
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="font-semibold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loadingLookups}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          >
            {loadingLookups && <option>Loading...</option>}
            {!loadingLookups && (
              <>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="font-semibold">Date</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="font-semibold">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loadingLookups}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none"
          >
            {loadingLookups && <option>Loading...</option>}
            {!loadingLookups && (
              <>
                <option value="">Select Method</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.name} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Note */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-semibold">Note</label>
            <span className="text-xs text-[#8b4f21]">
              {note.length}/100
            </span>
          </div>
          <textarea
            rows={2}
            value={note}
            maxLength={100}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-[#cbb89d] rounded-sm bg-[#f4e8d9] px-2 py-1 mt-1 focus:outline-none resize-none"
            placeholder="Optional note"
          />
        </div>

        {/* Upload Receipt */}
        <div className="flex flex-col items-center mt-3">
          <label className="font-semibold mb-1">Upload receipt</label>
          <button
            type="button"
            onClick={triggerFilePicker}
            className="bg-[#ead7c2] p-3 rounded-full shadow-md hover:bg-[#d6c2a8] active:scale-95 transition"
          >
            <Camera className="text-[#6b3e1f]" size={28} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {receiptName && (
            <p className="mt-2 text-xs text-[#6b3e1f]">
              Selected: {receiptName}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#d5853c] text-white font-semibold rounded-md px-6 py-2 shadow-md hover:bg-[#b96f2f] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}