"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/** -------- CONFIG -------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api/v1";

const ALLOW_TEST = String(process.env.NEXT_PUBLIC_ALLOW_TEST_PAYMENTS);

function authHeaders() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

/** -------- UI -------- */
export default function PaymentsSection({ defaultPlayerProfileId }) {
  const [pending, setPending] = useState([]);
  const [paid, setPaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [playerProfileId, setPlayerProfileId] = useState(defaultPlayerProfileId || "");
  const [busy, setBusy] = useState({}); // map invoiceId -> boolean
  const [creating, setCreating] = useState({ contacts: false, listing: false });

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [p1, p2] = await Promise.all([
        apiGet("/payments/invoices?status=pending"),
        apiGet("/payments/invoices?status=paid"),
      ]);
      setPending(p1?.data?.items || []);
      setPaid(p2?.data?.items || []);
    } catch (e) {
      setErr(e?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(
    () => ({ pending: pending?.length || 0, paid: paid?.length || 0 }),
    [pending, paid]
  );

  /** Start a brand-new payment */
  const startPayment = async (product, maybeProfileId) => {
    const body =
      product === "player_listing"
        ? { product, playerProfileId: maybeProfileId }
        : { product };
    const { data } = await apiPost("/payments/initiate", body);
    const url = data?.paymentUrl;
    if (!url) throw new Error("No payment URL returned");
    window.location.href = url;
  };

  /** Pay an existing pending invoice (prefer its paymentUrl; fallback to initiate) */
  const payExisting = async (inv) => {
    const id = inv?.id;
    setBusy((m) => ({ ...m, [id]: true }));
    try {
      if (inv?.paymentUrl) {
        window.location.href = inv.paymentUrl;
        return;
      }
      // fallback: re-initiate with same product (and same playerProfileId if listing)
      await startPayment(
        inv?.product,
        inv?.product === "player_listing" ? inv?.playerProfileId : undefined
      );
    } catch (e) {
      alert(e?.message || "Payment error");
    } finally {
      setBusy((m) => ({ ...m, [id]: false }));
    }
  };

  const onCreateContacts = async () => {
    try {
      setCreating((s) => ({ ...s, contacts: true }));
      await startPayment("contacts_access");
    } catch (e) {
      alert(e?.message || "Failed to start contacts payment");
    } finally {
      setCreating((s) => ({ ...s, contacts: false }));
    }
  };

  const onCreateListing = async () => {
    if (!playerProfileId) {
      alert("Please enter your playerProfileId first.");
      return;
    }
    try {
      setCreating((s) => ({ ...s, listing: true }));
      await startPayment("player_listing", playerProfileId);
    } catch (e) {
      alert(e?.message || "Failed to start listing payment");
    } finally {
      setCreating((s) => ({ ...s, listing: false }));
    }
  };



  return (<>

    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-[#00183D] p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center gap-3">
          payments
        </h1>
      </div>
      <div className="space-y-8 p-5">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-sm text-gray-500">
            review all invoices for your account.
          </p>

        </header>
        {/* Pending invoices */}

        <section className="space-y-3">
          <div className="text-sm text-gray-700">
            <span className="mr-4">Pending: <b>{counts.pending}</b></span>
            <span>Paid: <b>{counts.paid}</b></span>
          </div>
          <h3 className="text-lg font-semibold">To pay</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : err ? (
            <div className="text-sm text-red-600">{err}</div>
          ) : pending.length === 0 ? (
            <div className="text-sm text-gray-500">No pending invoices.</div>
          ) : (
            <div className="space-y-3">
              {pending.map((inv) => {
                const id = inv?.id;
                const isBusy = !!busy[id];
                const label =
                  inv?.product === "player_listing" ? "Player listing" : "Contacts access";
                return (
                  <div key={id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(inv.createdAt).toLocaleString()} • {inv.amount} {inv.currency}
                      </div>
                      <div className="text-xs text-gray-400">Order: {inv.orderNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.paymentUrl && (
                        <a
                          href={inv.paymentUrl}
                          className="px-4 py-2 border rounded-lg"
                        >
                          Pay
                        </a>
                      )}
                      {!inv.paymentUrl && (
                        <button
                          onClick={() => payExisting(inv)}
                          disabled={isBusy}
                          className="px-4 py-2 border rounded-lg"
                        >
                          {isBusy ? "Opening…" : "Pay"}
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Paid invoices */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Paid</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : paid.length === 0 ? (
            <div className="text-sm text-gray-500">No paid invoices yet.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {paid.map((inv) => {
                const label =
                  inv?.product === "player_listing" ? "Player listing" : "Contacts access";
                return (
                  <div key={inv.id} className="border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{label}</div>
                      <div className="text-sm">{inv.amount} {inv.currency}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Paid at {inv.paidAt ? new Date(inv.paidAt).toLocaleString() : "—"}
                    </div>
                    <div className="text-xs text-gray-400">Order: {inv.orderNumber}</div>
                    {!!inv.receiptUrl && (
                      <a
                        href={inv.receiptUrl}
                        target="_blank"
                        className="text-blue-600 underline text-sm"
                      >
                        View receipt
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  </>
  );
}
