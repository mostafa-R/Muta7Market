import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let tokenCache = { token: null, expAt: 0 };

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('paylink request timed out')), config.paylink.timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function isPaylinkConfigured() {
  return Boolean(config.paylink.apiId && config.paylink.secretKey);
}

async function auth() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expAt - now > 60_000) return tokenCache.token;

  const r = await withTimeout(
    fetch(`${config.paylink.baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiId: config.paylink.apiId,
        secretKey: config.paylink.secretKey,
        persistToken: config.paylink.persistToken,
      }),
    })
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.id_token) {
    throw new Error(`paylink auth failed: ${r.status} ${JSON.stringify(j)}`);
  }

  const ttlSec = Number(j.expires_in || (config.paylink.persistToken ? 30 * 3600 : 1800));
  tokenCache = { token: j.id_token, expAt: now + ttlSec * 1000 };
  return tokenCache.token;
}

export async function paylinkCreateInvoice(payload) {
  const token = await auth();
  const r = await withTimeout(
    fetch(`${config.paylink.baseUrl}/api/addInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    logger.error('paylink addInvoice failed:', r.status, JSON.stringify(j));
    throw new Error(`paylink addInvoice ${r.status}: ${JSON.stringify(j)}`);
  }
  return j;
}

export async function paylinkGetInvoice(transactionNo) {
  const token = await auth();
  const r = await withTimeout(
    fetch(`${config.paylink.baseUrl}/api/getInvoice/${encodeURIComponent(transactionNo)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`paylink getInvoice ${r.status}: ${JSON.stringify(j)}`);
  return j;
}