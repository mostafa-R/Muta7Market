import axios from 'axios';

const BASE = process.env.PAYLINK_BASE_URL || 'https://restapi.paylink.sa';
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const { data } = await axios.post(`${BASE}/api/auth`, {
    apiId: process.env.PAYLINK_API_ID,
    secretKey: process.env.PAYLINK_SECRET,
    persistToken: true
  }, { headers: { 'Content-Type': 'application/json' } });

  cachedToken = data.id_token;
  tokenExpiresAt = now + 29 * 60 * 60 * 1000; // refresh early
  return cachedToken;
}

async function paylinkRequest(method, path, body) {
  const token = await getToken();
  const res = await axios({
    method,
    url: `${BASE}${path}`,
    data: body,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 15000
  });
  return res.data;
}

export async function paylinkCreateInvoice(payload) {
  return paylinkRequest('POST', '/api/addInvoice', payload);
}

export async function paylinkGetInvoice(transactionNo) {
  return paylinkRequest('GET', `/api/getInvoice/${transactionNo}`);
}
