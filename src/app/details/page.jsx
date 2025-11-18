"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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

function TransactionDetailPage() {
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
    <div className="flex flex-col items-center bg-[#f9f3ec] pb-24 min-h-screen text-[#6b3e1f]">
      {/* Header */}
      <div className="relative flex justify-between items-center bg-[#ead7c2] px-4 w-full h-12">
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
          className="hover:bg-[#e3cdb4] p-2 rounded transition active:scale-95"
        >
          <Menu className="text-[#6b3e1f]" size={22} />
        </button>

        {/* Overlay */}
        {menuOpen && (
          <div
            className="z-10 fixed inset-0"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="top-12 right-2 z-20 absolute bg-white shadow-md border border-[#cbb89d] rounded-md w-40 overflow-hidden"
            role="menu"
          >
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
      <div className="px-8 pt-6 w-full max-w-sm">
        {/* Receipt placeholder + trash */}
        <div className="relative flex justify-center mt-6">
          <div className="flex justify-center items-center bg-[#e8ddcf] border border-[#ead7c2] rounded-md w-60 h-60 overflow-hidden">
            {receiptUrl ? (
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="flex justify-center items-center w-full h-full"
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
            className="-top-3 -right-4 absolute hover:opacity-80 text-red-500 transition active:scale-95"
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={22} />
          </button>
        </div>

        {/* Info rows */}
        <div className="space-y-5 mt-10 text-base">
          {transaction ? (
            detailRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="font-semibold">{row.label}</span>
                {row.badge ? (
                  <span className="bg-[#c5a3e8] px-3 py-0.5 rounded text-[#6b3e1f]">
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
            <p className="text-[#8b4f21] text-center text-sm">
              No transaction selected. Please go back and pick one.
            </p>
          )}
        </div>
      </div>

      {/* Floating Edit button */}
      <button
        type="button"
        onClick={() => router.push("/edittrans")}
        className="bottom-10 left-1/2 fixed flex justify-center items-center bg-[#8b572a] hover:bg-[#74481f] shadow-md rounded-full w-16 h-16 text-white transition -translate-x-1/2 active:scale-95"
      >
        <Pencil size={22} />
      </button>

      {confirmDelete && (
        <div className="z-30 fixed inset-0 flex justify-center items-center bg-black/40 px-6">
          <div className="space-y-4 bg-white p-5 rounded-lg w-full max-w-sm text-center">
            <p className="font-semibold text-[#6b3e1f] text-lg">
              Do you wanna delete this transaction?
            </p>
            {deleteError && (
              <p className="text-red-600 text-sm">{deleteError}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="hover:bg-[#f9f3ec] px-4 py-2 border border-[#cbb89d] rounded text-[#6b3e1f]"
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
                className="bg-red-500 hover:bg-red-600 disabled:opacity-70 px-4 py-2 rounded font-semibold text-white"
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
        <div className="z-30 fixed inset-0 flex justify-center items-center bg-black/60 px-4">
          <div className="relative bg-white p-4 rounded-lg w-full max-w-2xl">
            <button
              type="button"
              aria-label="Close image"
              className="top-2 right-2 absolute text-[#6b3e1f] hover:text-black"
              onClick={() => setImageModalOpen(false)}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptUrl}
              alt="Transaction receipt preview"
              className="rounded-md w-full h-auto max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionDetailPage />
    </Suspense>
  )
}