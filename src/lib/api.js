import { API_BASE_URL } from "@/config";

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });
  return url.toString();
}

async function request(method, path, params = {}, body = null) {
  const url = buildUrl(path, params);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${text}`);
  }
  return res.json();
}

/* ============================
   HEALTH
============================ */
export function getHealth() {
  return request("GET", "/health");
}

/* ============================
   LOOKUPS
============================ */
export function getLookups() {
  return request("GET", "/lookups");
}

export function getCategories() {
  return request("GET", "/categories");
}

export function getPaymentMethods() {
  return request("GET", "/payment-methods");
}

/* ============================
   USERS
============================ */
export function getCurrentUser() {
  return request("GET", "/users/me");
}

/* ============================
   TRANSACTIONS
============================ */
export function getTransactions() {
  return request("GET", "/transactions");
}

export function getTransactionsByMonth(yyyy, mm) {
  return request("GET", "/transactions/month", { yyyy, mm });
}

export function createTransaction(data) {
  return request("POST", "/transactions", {}, data);
}

export function deleteTransaction(sk) {
  return request("POST", "/transactions/delete", {}, { sk });
}
