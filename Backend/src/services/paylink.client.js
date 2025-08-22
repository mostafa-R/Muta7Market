let tokenCache = { token: null, expAt: 0 }; // epoch ms

function baseUrl() {
  if (process.env.PAYLINK_BASE_URL) return process.env.PAYLINK_BASE_URL;
  const env = String(process.env.PAYLINK_ENV || "pilot").toLowerCase();
  return env === "prod"
    ? "https://restapi.paylink.sa"
    : "https://restpilot.paylink.sa";
}

async function auth() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expAt - now > 60_000)
    return tokenCache.token;

  const r = await fetch(`${baseUrl()}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiId: process.env.PAYLINK_API_ID,
      secretKey: process.env.PAYLINK_SECRET,
      persistToken: true,
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.id_token)
    throw new Error(`paylink auth failed: ${r.status} ${JSON.stringify(j)}`);

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
  if (!r.ok) throw new Error(`addInvoice ${r.status}: ${JSON.stringify(j)}`);
  return j; // { url, transactionNo, invoiceId, ... }
}

export async function paylinkGetInvoice(transactionNo) {
  const token = await auth();
  const r = await fetch(
    `${baseUrl()}/api/getInvoice/${encodeURIComponent(transactionNo)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`getInvoice ${r.status}: ${JSON.stringify(j)}`);
  return j;
}
