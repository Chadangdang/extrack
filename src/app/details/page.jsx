"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Menu, Trash2, Pencil, X } from "lucide-react";

import { deleteTransaction, getReceiptViewUrl } from "@/lib/api";

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

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const txParam = params?.get("tx") || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [imageFit, setImageFit] = useState("square");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ESC closes menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirmDelete(false);
        setImageModalOpen(false);
      }
    };
    if (typeof window !== "undefined") window.addEventListener("keydown", onKey);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadTransaction() {
      try {
        const raw = sessionStorage.getItem("selectedTransaction");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!active) return;
        setTransaction(parsed);

        if (parsed.receiptUrl) {
          setReceiptUrl(parsed.receiptUrl);
          return;
        }

        if (parsed.receiptKey) {
          try {
            const { url } = await getReceiptViewUrl(parsed.receiptKey);
            if (active) setReceiptUrl(url || "");
          } catch (err) {
            console.error("Failed to load receipt URL", err);
          }
        }
      } catch (err) {
        console.error("Failed to load transaction detail", err);
      }
    }

    loadTransaction();

    return () => {
      active = false;
    };
  }, [txParam]);

  const goLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    router.push("/login");
  };

  const detailRows = useMemo(() => {
    if (!transaction) return [];
    return [
      { label: "Name", value: transaction.name || "-" },
      {
        label: "Category",
        value: transaction.categoryName || transaction.category || "-",
        badge: true,
      },
      { label: "Type", value: transaction.type || "-", type: transaction.type },
      {
        label: "Date",
        value: formatDateLabel(transaction.date || transaction.createdAt),
      },
      {
        label: "Amount",
        value: formatCurrency(transaction.amount),
      },
      { label: "Note", value: transaction.note || "-" },
    ];
  }, [transaction]);

  const typeClasses = (type) =>
    type === "Income"
      ? "bg-[#a8cbb1] text-[#2f5f2f]"
      : "bg-[#d9a3a3] text-[#5f2f2f]";

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

  const imageSizingClass = {
    "fit-width": "w-full h-auto",
    "fit-height": "h-full w-auto",
    square: "w-full h-full",
  }[imageFit];

  const handleDeleteTransaction = async () => {
    if (!transaction) return;
    const key = transaction.sk || transaction.id || transaction._id;
    if (!key) {
      setDeleteError("Missing transaction identifier.");
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      await deleteTransaction(key);
      setConfirmDelete(false);
      router.push("/seemore");
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setDeleteError("Failed to delete this transaction. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f3ec] text-[#6b3e1f] flex flex-col items-center pb-24">
      {/* Header */}
      <div className="w-full h-12 bg-[#ead7c2] flex items-center justify-between px-4 relative">
        {/* Back */}
        <button
          onClick={() => router.push("/seemore")}
          className="flex items-center space-x-2 hover:opacity-80"
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

      {/* Content */}
      <div className="w-full max-w-sm px-8 pt-6">
        {/* Receipt placeholder + trash */}
        <div className="mt-6 relative flex justify-center">
          <div className="w-60 h-60 rounded-md border border-[#ead7c2] bg-[#e8ddcf] overflow-hidden flex items-center justify-center">
            {receiptUrl ? (
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="w-full h-full flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptUrl}
                  alt="Transaction receipt"
                  onLoad={handleImageLoad}
                  className={`${imageSizingClass} object-contain rounded-md pointer-events-none select-none`}
                />
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>

          {/* SMALLER TRASH ICON + POSITION FIX */}
          <button
            className="absolute -top-3 -right-4 text-red-500 hover:opacity-80 active:scale-95 transition"
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={22} />
          </button>
        </div>

        {/* Info rows */}
        <div className="mt-10 space-y-5 text-base">
          {transaction ? (
            detailRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="font-semibold">{row.label}</span>
                {row.badge ? (
                  <span className="bg-[#c5a3e8] text-[#6b3e1f] px-3 py-0.5 rounded">
                    {row.value}
                  </span>
                ) : row.type ? (
                  <span className={`${typeClasses(row.type)} px-3 py-0.5 rounded`}>
                    {row.value}
                  </span>
                ) : (
                  <span>{row.value}</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-[#8b4f21]">
              No transaction selected. Please go back and pick one.
            </p>
          )}
        </div>
      </div>

      {/* Floating Edit button */}
      <button
        type="button"
        onClick={() => router.push("/edittrans")}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#8b572a] text-white flex items-center justify-center shadow-md hover:bg-[#74481f] active:scale-95 transition"
      >
        <Pencil size={22} />
      </button>

      {confirmDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 text-center space-y-4">
            <p className="text-lg font-semibold text-[#6b3e1f]">
              Do you wanna delete this transaction?
            </p>
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 rounded border border-[#cbb89d] text-[#6b3e1f] hover:bg-[#f9f3ec]"
                onClick={() => {
                  setDeleteError("");
                  setConfirmDelete(false);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-70"
                onClick={handleDeleteTransaction}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModalOpen && receiptUrl && (
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
              className="w-full h-auto max-h-[75vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
