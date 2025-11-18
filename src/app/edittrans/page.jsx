"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Menu, Camera, X } from "lucide-react";

import {
  getLookups,
  updateTransaction,
  getReceiptUploadUrl,
  getReceiptViewUrl,
} from "@/lib/api";

function toDateInput(value) {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const mdy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    let [_, m, d, y] = mdy;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const dt = new Date(value);
  if (!Number.isNaN(dt.getTime())) return toDateInput(dt);
  return "";
}

function deriveReceiptName(tx) {
  if (!tx) return "";
  return (
    tx.receiptFileName ||
    tx.receiptName ||
    (typeof tx.receiptKey === "string" && tx.receiptKey.split("/").pop()) ||
    ""
  );
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const txParam = params?.get("tx") || "";

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Data + form state
  const [transaction, setTransaction] = useState(null);
  const [loadingTransaction, setLoadingTransaction] = useState(true);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [amountInt, setAmountInt] = useState("");
  const [amountCents, setAmountCents] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Receipt state
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptName, setReceiptName] = useState("");
  const [receiptKey, setReceiptKey] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const [imageFit, setImageFit] = useState("square");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // ESC closes menu + modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setImageModalOpen(false);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKey);
      }
    };
  }, []);

  // Load categories + payment methods
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
      } catch (err) {
        console.error("Failed to load lookups", err);
        if (!cancelled) setError("Failed to load categories and payment methods.");
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    };

    loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load previously selected transaction from sessionStorage
  useEffect(() => {
    let active = true;

    const loadTransaction = async () => {
      setLoadingTransaction(true);
      try {
        const raw = sessionStorage.getItem("selectedTransaction");
        if (!raw) {
          if (active) setTransaction(null);
          return;
        }
        const parsed = JSON.parse(raw);
        if (!active) return;
        setTransaction(parsed);

        const amount = Number(parsed.amount) || 0;
        const [intPart, centsPart] = amount.toFixed(2).split(".");
        setName(parsed.name || "");
        setAmountInt(intPart);
        setAmountCents(centsPart);
        setType(parsed.type || "Expense");
        setCategory(parsed.categoryName || parsed.category || "");
        setPaymentMethod(parsed.paymentMethod || "");
        setDate(toDateInput(parsed.date || parsed.createdAt));
        setNote(parsed.note || "");
        setReceiptName(deriveReceiptName(parsed));
        setReceiptKey(parsed.receiptKey || null);

        if (parsed.receiptUrl) {
          setReceiptUrl(parsed.receiptUrl);
        } else if (parsed.receiptKey) {
          try {
            const { url } = await getReceiptViewUrl(parsed.receiptKey);
            if (active) setReceiptUrl(url || "");
          } catch (err) {
            console.error("Failed to load receipt URL", err);
          }
        } else {
          setReceiptUrl("");
        }
      } catch (err) {
        console.error("Failed to load transaction for editing", err);
        if (active) setError("Unable to load transaction data.");
      } finally {
        if (active) setLoadingTransaction(false);
      }
    };

    loadTransaction();

    return () => {
      active = false;
    };
  }, [txParam]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  const handleAmountIntChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountInt(digits);
  };

  const handleAmountCentsChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
    setAmountCents(digits);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setReceiptFile(null);
      setReceiptName(deriveReceiptName(transaction));
      setReceiptUrl(transaction?.receiptUrl || "");
      setLocalPreview("");
      return;
    }
    const preview = URL.createObjectURL(file);
    setReceiptFile(file);
    setReceiptName(file.name);
    setLocalPreview(preview);
    setReceiptUrl(preview);
  };

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget || {};
    if (!naturalWidth || !naturalHeight) return;
    if (naturalWidth === naturalHeight) {
      setImageFit("square");
    } else if (naturalWidth > naturalHeight) {
      setImageFit("fit-width");
    } else {
      setImageFit("fit-height");
    }
  };

  const imageSizingClass = useMemo(
    () =>
      (
        {
          "fit-width": "w-full h-auto",
          "fit-height": "h-full w-auto",
          square: "w-full h-full",
        }[imageFit]
      ),
    [imageFit]
  );

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!transaction) {
      setError("No transaction selected to edit.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const formattedName =
      trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

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

    setIsSubmitting(true);
    try {
      let nextReceiptKey = receiptKey;

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

        nextReceiptKey = key;
      }

      const txKey = transaction.sk || transaction.id || transaction._id;
      if (!txKey) {
        throw new Error("Missing transaction identifier");
      }

      const payload = {
        sk: txKey,
        name: formattedName,
        amount,
        category,
        date,
        paymentMethod,
        note: safeNote,
        type,
        receiptKey: nextReceiptKey,
      };

      await updateTransaction(payload);

      const updatedTx = {
        ...transaction,
        ...payload,
        amount,
        categoryName: category,
        paymentMethod,
        note: safeNote,
        receiptKey: nextReceiptKey,
        receiptUrl: receiptFile ? receiptUrl : transaction.receiptUrl,
      };

      sessionStorage.setItem("selectedTransaction", JSON.stringify(updatedTx));
      setTransaction(updatedTx);
      setReceiptKey(nextReceiptKey);
      setSuccess("Transaction updated successfully.");
      router.push("/details");
    } catch (err) {
      console.error("Failed to update transaction", err);
      setError("Failed to update transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => router.push("/details");

  const canPreviewReceipt = Boolean(receiptUrl);

  const displayCategories = useMemo(() => {
    if (!category) return categories;
    const exists = categories.some((cat) => cat.name === category);
    return exists ? categories : [...categories, { name: category }];
  }, [categories, category]);

  const displayPaymentMethods = useMemo(() => {
    if (!paymentMethod) return paymentMethods;
    const exists = paymentMethods.some((pm) => pm.name === paymentMethod);
    return exists ? paymentMethods : [...paymentMethods, { name: paymentMethod }];
  }, [paymentMethods, paymentMethod]);

  return (
    <div className="min-h-screen bg-[#f9f3ec] flex flex-col items-center text-[#6b3e1f] pb-10">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        <button
          type="button"
          className="flex items-center space-x-2"
          onClick={goBack}
        >
          <ChevronLeft className="text-[#6b3e1f]" size={22} />
          <span className="font-semibold">Back</span>
        </button>

        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded hover:bg-[#e3cdb4] active:scale-95 transition"
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

      <h1 className="text-lg font-semibold mt-6">Edit Transaction</h1>

      {(error || success) && (
        <div className="mt-3 w-72 text-sm">
          {error && <p className="text-red-600">{error}</p>}
          {!error && success && <p className="text-green-700">{success}</p>}
        </div>
      )}

      {loadingTransaction ? (
        <p className="mt-10 text-sm text-[#8b4f21]">Loading transaction...</p>
      ) : !transaction ? (
        <div className="mt-10 text-center text-sm space-y-3">
          <p>No transaction selected. Please go back and pick one.</p>
          <button
            type="button"
            className="text-[#8b4f21] underline"
            onClick={() => router.push("/seemore")}
          >
            Go to history
          </button>
        </div>
      ) : (
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

          {/* Amount */}
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
                  {displayCategories.map((cat) => (
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
                  {displayPaymentMethods.map((pm) => (
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
              <span className="text-xs text-[#8b4f21]">{note.length}/100</span>
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
            {receiptName ? (
              <button
                type="button"
                onClick={() => canPreviewReceipt && setImageModalOpen(true)}
                disabled={!canPreviewReceipt}
                className={`mt-2 text-xs underline ${
                  canPreviewReceipt
                    ? "text-[#6b3e1f] hover:text-[#8b4f21]"
                    : "text-[#b69c7b] cursor-not-allowed no-underline"
                }`}
              >
                {receiptName}
              </button>
            ) : (
              <p className="mt-2 text-xs text-[#8b4f21]">No receipt attached</p>
            )}
          </div>

          {/* Save */}
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
      )}

      {imageModalOpen && canPreviewReceipt && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
          <div className="relative bg-white p-4 rounded-lg max-w-2xl w-full">
            <button
              type="button"
              aria-label="Close image"
              className="absolute top-2 right-2 text-[#6b3e1f] hover:text-black"
              onClick={() => setImageModalOpen(false)}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptUrl}
              alt="Transaction receipt preview"
              onLoad={handleImageLoad}
              className={`${imageSizingClass} object-contain rounded-md max-h-[75vh] mx-auto`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
