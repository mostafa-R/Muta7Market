import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { spawn } from "child_process";
import User from "./src/models/user.model.js";
import Player from "./src/models/player.model.js";
import Invoice from "./src/models/invoice.model.js";
import Entitlement from "./src/models/entitlement.model.js";
import Offer from "./src/models/offer.model.js";
import TransferOffer from "./src/models/transferOffer.model.js";

const MOCK_PORT = 9001;
const APP_PORT = 8003;
const TEST_DB = "muta7markt_pay_" + Date.now();
const BASE = `http://localhost:${APP_PORT}/api/v1`;
const MOCK_BASE = `http://localhost:${MOCK_PORT}`;
const MONGODB_URI = `mongodb://127.0.0.1:27017/${TEST_DB}`;
const WEBHOOK_AUTH = "test-webhook-secret";

let pass = 0;
let fail = 0;
const results = [];

function check(name, ok, extra = "") {
  if (ok) {
    pass++;
    results.push(`  PASS  ${name}${extra ? " | " + extra : ""}`);
  } else {
    fail++;
    results.push(`  FAIL  ${name}${extra ? " | " + extra : ""}`);
  }
}

async function req(method, path, token, body, headers = {}) {
  const h = { ...headers, "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${BASE}/test`);
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

const invoices = new Map();

function startMockPaylink() {
  const server = http.createServer(async (req0, res) => {
    const url = new URL(req0.url, "http://x");
    const send = (code, obj) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(obj));
    };
    const drain = () =>
      new Promise((resolve) => {
        let d = "";
        req0.on("data", (c) => (d += c));
        req0.on("end", () => {
          try {
            resolve(JSON.parse(d || "{}"));
          } catch {
            resolve({});
          }
        });
      });

    try {
      if (req0.method === "POST" && url.pathname === "/api/auth") {
        await drain();
        return send(200, { id_token: "mock_token", expires_in: 1800 });
      }
      if (req0.method === "POST" && url.pathname === "/api/addInvoice") {
        const body = await drain();
        const txn = "TXN-" + (body.orderNumber || "x");
        invoices.set(txn, {
          orderNumber: body.orderNumber,
          amount: body.amount,
          status: "pending",
        });
        return send(200, {
          transactionNo: txn,
          url: `${MOCK_BASE}/pay/${body.orderNumber}`,
          amount: body.amount,
          orderStatus: "pending",
        });
      }
      if (req0.method === "GET" && url.pathname.startsWith("/api/getInvoice/")) {
        const txn = decodeURIComponent(url.pathname.replace("/api/getInvoice/", ""));
        const inv = invoices.get(txn);
        if (!inv) return send(404, { error: "not found" });
        const out = {
          transactionNo: txn,
          orderNumber: inv.orderNumber,
          orderStatus: inv.status,
          amount: inv.amount,
        };
        if (inv.status === "paid")
          out.paymentReceipt = { url: `${MOCK_BASE}/receipt.png` };
        return send(200, out);
      }
      if (req0.method === "POST" && url.pathname.startsWith("/pay/")) {
        const orderNumber = decodeURIComponent(url.pathname.replace("/pay/", ""));
        let found = null;
        for (const inv of invoices.values()) {
          if (inv.orderNumber === orderNumber) found = inv;
        }
        if (!found) return send(404, { error: "no invoice" });
        found.status = "paid";
        return send(200, { ok: true, orderNumber });
      }
      if (req0.method === "GET" && url.pathname.startsWith("/api/getOrder/")) {
        return send(200, { orderStatus: "paid" });
      }
      if (req0.method === "GET" && url.pathname.startsWith("/api/getTransactions/")) {
        return send(200, []);
      }
      send(404, { error: "mock route not found: " + url.pathname });
    } catch (e) {
      send(500, { error: String(e) });
    }
  });
  return new Promise((resolve) => {
    server.listen(MOCK_PORT, () => resolve(server));
  });
}

let mockServer;
let child;

process.on("exit", () => {
  if (child && !child.killed) child.kill();
  if (mockServer) mockServer.close();
});

async function main() {
  await mongoose.connect(MONGODB_URI);

  const userPlayer = await User.create({
    name: "Pay Player",
    email: "pay.player@example.com",
    phone: "0500000011",
    password: "password123",
    role: "player",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
  });
  const userClub = await User.create({
    name: "Pay Club",
    email: "pay.club@example.com",
    phone: "0500000012",
    password: "password123",
    role: "club",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
  });
  const adminU = await User.create({
    name: "Pay Admin",
    email: "pay.admin@example.com",
    phone: "0500000013",
    password: "password123",
    role: "admin",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
  });

  const profile = await Player.create({
    user: userPlayer._id,
    name: "Pay Striker",
    age: 23,
    gender: "male",
    nationality: "Saudi",
    jop: "player",
    position: "Striker",
    game: { en: "Football", ar: "كرة القدم", slug: "football" },
    isActive: true,
    isConfirmed: true,
    isListed: false,
    contractStatus: "free_agent",
  });

  const profileId = String(profile._id);

  mockServer = await startMockPaylink();

  child = spawn(process.execPath, ["index.js"], {
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      MONGODB_URI,
      PAYLINK_BASE_URL: MOCK_BASE,
      PAYLINK_WEBHOOK_AUTH: WEBHOOK_AUTH,
    },
    stdio: "pipe",
  });
  child.stderr.on("data", (d) => {
    const s = String(d);
    if (/error|fatal/i.test(s)) {
      console.error("[app] " + s.trimEnd());
    }
  });

  const up = await waitForServer();
  check("server boots with mocked paylink", up);
  if (!up) {
    process.exitCode = 1;
    return;
  }

  // Login flow (Phase 1 auth path)
  const login = await req("POST", "/auth/login", null, {
    email: "pay.player@example.com",
    password: "password123",
  });
  check("login succeeds", login.status === 200 && !!login.json?.data?.token);
  const token = login.json?.data?.token;

  const loginBad = await req("POST", "/auth/login", null, {
    email: "pay.player@example.com",
    password: "wrong-password",
  });
  check("login rejects bad password", loginBad.status === 401);

  const loginAdmin = await req("POST", "/auth/login", null, {
    email: "pay.admin@example.com",
    password: "password123",
  });
  const tokenAdmin = loginAdmin.json?.data?.token;

  const loginClub = await req("POST", "/auth/login", null, {
    email: "pay.club@example.com",
    password: "password123",
  });
  const tokenClub = loginClub.json?.data?.token;
  check("club login", loginClub.status === 200 && !!tokenClub);

  // --- Listing payment flow via Paylink mock ---
  const draft = await req("POST", "/payments/drafts", token, {
    product: "listing",
    playerProfileId: profileId,
  });
  check(
    "create draft listing invoice",
    draft.status === 200 && draft.json?.data?.product === "listing",
    JSON.stringify(draft.json?.data).slice(0, 120)
  );
  const invoiceId = draft.json?.data?.id;

  const init = await req("POST", `/payments/invoices/${invoiceId}/initiate`, token);
  check(
    "initiate payment returns url + txn",
    init.status === 200 &&
      init.json?.data?.paymentUrl?.includes("localhost:9001/pay/"),
    JSON.stringify(init.json?.data).slice(0, 140)
  );
  const orderNumber = init.json?.data?.orderNumber;

  const status1 = await req("GET", `/payments/status/${invoiceId}`, token);
  check("status pending before payment", status1.json?.data?.status === "pending");

  const simulatePay = await fetch(`${MOCK_BASE}/pay/${orderNumber}`, { method: "POST" });
  const simulatePayOk = simulatePay.status === 200;
  check("mock paylink marks invoice paid", simulatePayOk);

  const webhook = await req("POST", "/payments/webhook", null, {
    transactionNo: `TXN-${orderNumber}`,
    merchantOrderNumber: orderNumber,
  }, { Authorization: WEBHOOK_AUTH });
  check(
    "webhook processes payment",
    webhook.status === 200 && webhook.json?.ok === true && webhook.json?.verified === true,
    JSON.stringify(webhook.json).slice(0, 120)
  );

  const status2 = await req("GET", `/payments/status/${invoiceId}`, token);
  check("status paid after webhook", status2.json?.data?.status === "paid");

  const inv = await Invoice.findById(invoiceId).lean();
  check(
    "invoice persisted paid + txn",
    inv?.status === "paid" && !!inv?.providerTransactionNo
  );

  const refreshedProfile = await Player.findById(profileId).lean();
  check("player isListed true after payment", refreshedProfile?.isListed === true);

  const ent = await Entitlement.findOne({
    userId: userPlayer._id,
    type: "listed_player",
    playerProfileId: profileId,
  }).lean();
  check("listing entitlement granted", !!ent && ent.active === true, JSON.stringify(ent).slice(0, 100));

  // recheck endpoint
  const recheck = await req("POST", `/payments/invoices/recheck/${orderNumber}`, token);
  check("recheck reports paid", recheck.status === 200 && recheck.json?.data?.paid === true);

  // --- Webhook security (H7) ---
  const wbBad = await req("POST", "/payments/webhook", null, {
    transactionNo: `TXN-${orderNumber}`,
    merchantOrderNumber: orderNumber,
  }, { Authorization: "Bearer wrong-secret" });
  check("webhook rejects bad auth (401)", wbBad.status === 401);

  const wbMismatch = await req("POST", "/payments/webhook", null, {
    transactionNo: `TXN-${orderNumber}`,
    merchantOrderNumber: "SOME-OTHER-ORDER",
  }, { Authorization: WEBHOOK_AUTH });
  check(
    "webhook rejects order mismatch",
    wbMismatch.status === 200 && wbMismatch.json?.mismatch === "orderNumber"
  );

  // --- Admin gating (C4) ---
  const adminList = await req("GET", "/payments/admin/invoices", token);
  check("player blocked from admin invoices", adminList.status === 403);

  const adminListOk = await req("GET", "/payments/admin/invoices", tokenAdmin);
  check("admin can list invoices", adminListOk.status === 200);

  // --- simulateSuccess disabled in production ---
  const sim = await req("POST", `/payments/simulate/success/${invoiceId}`, tokenAdmin);
  check("simulateSuccess disabled in production (404)", sim.status === 404);

  // --- Offer flow with payment (C3) ---
  const offerBody = {
    title: { en: "We need a fast striker for next season", ar: "نبحث عن مهاجم سريع للموسم القادم" },
    description: { en: "Looking for a professional striker to join our club", ar: "نبحث عن مهاجم محترف للانضمام إلى نادينا" },
    category: "player_wanted",
    contactInfo: { name: "Recruiter", email: "r@club.com", phone: "0555555555" },
    expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  };
  const offerRes = await req("POST", "/offers", tokenClub, offerBody);
  check(
    "create offer requires payment (non-admin)",
    offerRes.status === 201 &&
      !!offerRes.json?.data?.paymentUrl &&
      !!offerRes.json?.data?.invoiceId,
    String(JSON.stringify(offerRes.json?.data || {})).slice(0, 140)
  );
  const offerId = offerRes.json?.data?.offer?._id || offerRes.json?.data?.offer?.id;
  const offerInvoiceId = offerRes.json?.data?.invoiceId;

  const offStatus = await req("GET", "/payments/status/" + offerInvoiceId, tokenClub);
  check("offer invoice pending", offStatus.json?.data?.status === "pending");

  const offerInv = await Invoice.findById(offerInvoiceId).lean();
  const offerOrder = offerInv?.orderNumber;
  await fetch(`${MOCK_BASE}/pay/${offerOrder}`, { method: "POST" });
  const offerWebhook = await req("POST", "/payments/webhook", null, {
    transactionNo: `TXN-${offerOrder}`,
    merchantOrderNumber: offerOrder,
  }, { Authorization: WEBHOOK_AUTH });
  check("offer webhook processed", offerWebhook.status === 200 && offerWebhook.json?.ok === true);

  const offerDoc = await Offer.findById(offerId).lean();
  check(
    "offer activated after payment",
    offerDoc?.payment?.isPaid === true && offerDoc?.status === "active",
    JSON.stringify(offerDoc?.payment).slice(0, 100)
  );

  const offerPublic = await req("GET", `/offers/${offerId}`);
  check("public offer visible after payment", offerPublic.status === 200 && offerPublic.json?.data?.offer?.isActive === true);

  // --- Transfer offer payment flow (non-admin) ---
  const tOffer = await req("POST", "/transfer-offers", tokenClub, {
    targetProfileId: profileId,
    toUserId: userPlayer._id.toString(),
    targetType: "player",
    salary: { amount: 18000, currency: "SAR" },
    transferFee: { amount: 800000, currency: "SAR" },
    contractDuration: 4,
    message: "Official transfer offer",
  });
  check(
    "transfer offer requires payment (non-admin)",
    tOffer.status === 201 &&
      !!tOffer.json?.data?.paymentUrl &&
      !!tOffer.json?.data?.invoiceId,
    JSON.stringify(tOffer.json?.data).slice(0, 120)
  );
  const transferOfferId = tOffer.json?.data?.offer?._id || tOffer.json?.data?.offer?.id;
  const tInvoiceId = tOffer.json?.data?.invoiceId;
  const tInv = await Invoice.findById(tInvoiceId).lean();
  check("transfer invoice product", tInv?.product === "transfer_offer" && tInv?.relatedTransferOffer);

  const tOrder = tInv?.orderNumber;
  await fetch(`${MOCK_BASE}/pay/${tOrder}`, { method: "POST" });
  const tWebhook = await req("POST", "/payments/webhook", null, {
    transactionNo: `TXN-${tOrder}`,
    merchantOrderNumber: tOrder,
  }, { Authorization: WEBHOOK_AUTH });
  check("transfer webhook processed", tWebhook.status === 200 && tWebhook.json?.ok === true);

  const tDoc = await TransferOffer.findById(transferOfferId).lean();
  check(
    "transfer offer marked paid",
    tDoc?.payment?.isPaid === true && !!tDoc?.payment?.invoiceId
  );

  const tConfirm = await req("POST", `/transfer-offers/payment/confirm/${tInvoiceId}`, tokenClub);
  check(
    "transfer payment confirm",
    tConfirm.status === 200 && tConfirm.json?.data?.paid === true
  );

  // reconcile (should be no-op for already paid)
  const reconcile = await req("POST", "/payments/reconcile", token);
  check("reconcile runs without error", reconcile.status === 200);

  // list my invoices
  const myInvoices = await req("GET", "/payments/invoices", token);
  check(
    "list my invoices",
    myInvoices.status === 200 && myInvoices.json?.data?.items?.length >= 1
  );

  console.log("\n===== PAYMENT E2E RESULTS =====");
  results.forEach((r) => console.log(r));
  console.log(`\nPASS: ${pass}  FAIL: ${fail}`);

  process.exitCode = fail > 0 ? 1 : 0;
}

main()
  .then(async () => {
    if (child && !child.killed) child.kill();
    if (mockServer) await new Promise((r) => mockServer.close(r));
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.disconnect().catch(() => {});
  })
  .catch(async (e) => {
    console.error("PAYMENT E2E FATAL:", e);
    if (child && !child.killed) child.kill();
    if (mockServer) await new Promise((r) => mockServer.close(r));
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
  });
