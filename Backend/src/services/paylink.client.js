// src/services/paylink.client.js
import fetch from "node-fetch";

let tokenCache = { token: null, expAt: 0 }; // epoch ms

function baseUrl() {
  // prefer explicit; fallback to env selector
  if (process.env.PAYLINK_BASE_URL) return process.env.PAYLINK_BASE_URL;
  const env = String(process.env.PAYLINK_ENV || "pilot").toLowerCase();
  return env === "prod" ? "https://restapi.paylink.sa" : "https://restpilot.paylink.sa";
}

async function auth() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expAt - now > 60_000) {
    console.log("[Paylink][auth] Using cached token. ExpiresAt:", new Date(tokenCache.expAt).toISOString());
    return tokenCache.token;
  }
  const url = `${baseUrl()}/api/auth`;
  const body = {
    apiId: process.env.PAYLINK_API_ID,
    secretKey: process.env.PAYLINK_SECRET,
    persistToken: true, // longer-lived token
  };
  try {
    console.log("[Paylink][auth] Requesting new token", {
      url,
      apiIdSuffix: String(body.apiId || "").slice(-4) || null,
      persistToken: body.persistToken,
    });
  } catch {}
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    throw new Error(`paylink auth failed: ${r.status} ${await r.text()}`);
  }
  const j = await r.json();
  if (!j?.id_token) throw new Error("paylink auth: id_token missing");
  // docs: token lifetime is returned in expires_in (seconds). Fallback to 30 min.
  const ttlSec = Number(j.expires_in || 1800);
  tokenCache = { token: j.id_token, expAt: now + ttlSec * 1000 };
  console.log("[Paylink][auth] Received token. TTL(s):", ttlSec);
  return tokenCache.token;
}

export async function paylinkCreateInvoice(payload) {
  const token = await auth();
  const url = `${baseUrl()}/api/addInvoice`;
  try {
    console.log("[Paylink][createInvoice] Request", {
      url,
      payload,
      hasAuthHeader: true,
    });
  } catch {}
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.log("[Paylink][createInvoice] Error Response", { status: r.status, body: j });
    throw new Error(`addInvoice ${r.status}: ${JSON.stringify(j)}`);
  }
  // j: { url, transactionNo, invoiceId, ... }
  try {
    console.log("[Paylink][createInvoice] Success", {
      status: r.status,
      transactionNo: j?.transactionNo || null,
      invoiceId: j?.invoiceId || null,
      url: j?.url || null,
    });
  } catch {}
  return j;
}

export async function paylinkGetInvoice(transactionNo) {
  const token = await auth();
  const url = `${baseUrl()}/api/getInvoice/${encodeURIComponent(transactionNo)}`;
  try {
    console.log("[Paylink][getInvoice] Request", { url, transactionNo });
  } catch {}
  const r = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.log("[Paylink][getInvoice] Error Response", { status: r.status, body: j });
    throw new Error(`getInvoice ${r.status}: ${JSON.stringify(j)}`);
  }
  try {
    console.log("[Paylink][getInvoice] Success", {
      status: r.status,
      orderStatus: j?.orderStatus || null,
      amount: j?.amount || null,
      paymentErrorsCount: Array.isArray(j?.paymentErrors) ? j.paymentErrors.length : 0,
      hasReceipt: Boolean(j?.paymentReceipt?.url),
    });
  } catch {}
  return j; // contains orderStatus, amount, paymentErrors[], paymentReceipt, ...
}
