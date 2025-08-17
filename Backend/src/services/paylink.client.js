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
    return tokenCache.token;
  }
  const url = `${baseUrl()}/api/auth`;
  const body = {
    apiId: process.env.PAYLINK_API_ID,
    secretKey: process.env.PAYLINK_SECRET,
    persistToken: true, // longer-lived token
  };
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
  return tokenCache.token;
}

export async function paylinkCreateInvoice(payload) {
  const token = await auth();
  const r = await fetch(`${baseUrl()}/api/addInvoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`addInvoice ${r.status}: ${JSON.stringify(j)}`);
  }
  // j: { url, transactionNo, invoiceId, ... }
  return j;
}

export async function paylinkGetInvoice(transactionNo) {
  const token = await auth();
  const r = await fetch(`${baseUrl()}/api/getInvoice/${encodeURIComponent(transactionNo)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`getInvoice ${r.status}: ${JSON.stringify(j)}`);
  }
  return j; // contains orderStatus, amount, paymentErrors[], paymentReceipt, ...
}
