let tokenCache = { token: null, expAt: 0 };

const baseUrl = process.env.PAYLINK_BASE_URL;

async function auth() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expAt - now > 60_000)
    return tokenCache.token;

  const r = await fetch(`${baseUrl}/api/auth`, {
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
  const r = await fetch(`${baseUrl}/api/addInvoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`addInvoice ${r.status}: ${JSON.stringify(j)}`);
  return j;
}

export async function paylinkGetInvoice(transactionNo) {
  const token = await auth();
  const r = await fetch(
    `${baseUrl}/api/getInvoice/${encodeURIComponent(transactionNo)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`getInvoice ${r.status}: ${JSON.stringify(j)}`);
  return j;
}
