"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";

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

        <section className="space-y-3 py-4 flex flex-col items-center">
          <div className="text-sm text-gray-700">
            <span className="mr-4">Pending: <b>{counts.pending}</b></span>
            <span>Paid: <b>{counts.paid}</b></span>
          </div>
          <h3 className="text-lg font-semibold bg-[#00183D] w-full text-center text-white p-2 rounded-lg" >Pending invoices</h3>
          {loading ? (
            <ClipLoader size={50} color="#00183D" />
          ) : err ? (
            <div className="text-sm text-red-600">{err}</div>
          ) : pending.length === 0 ? (
            <div className="text-sm text-gray-500">No pending invoices.</div>
          ) : (
            <div className="space-y-3 py-4">
              {pending.map((inv) => {
                const id = inv?.id;
                const isBusy = !!busy[id];
                const label =
                  inv?.product === "player_listing" ? "Player listing" : "Contacts access";
                return (
                  <div key={id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-5xl">
                    <div>
                      <div className="font-bold p-2">Order: <span className="font-normal">{label}</span></div>
                      <div className="font-bold p-2">paid: <span className="font-normal">{new Date(inv.createdAt).toLocaleString()}</span> </div>
                      <div className="font-bold p-2">Amount: <span className="font-normal">{inv.amount} {inv.currency}</span></div>
                      <div className="font-bold p-2">Order number: <span className="font-normal">{inv.orderNumber}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.paymentUrl && (
                        <a
                          href={inv.paymentUrl}
                          className="text-white bg-[#00183D] hover:bg-[#00183dce] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-[#00183D] dark:hover:bg-[#00183dab] dark:focus:ring-blue-800">
                          <svg class="w-3.5 h-3.5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 21">
                            <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                          </svg>Pay now
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
        <section className="space-y-3 flex flex-col items-center">
          <h3 className="text-lg font-semibold bg-[#00183D] w-full text-center text-white p-2 rounded-lg">Paid invoices</h3>
          {loading ? (
            <ClipLoader size={50} color="#00183D" />
          ) : paid.length === 0 ? (
            <div className="text-sm text-gray-500">No paid invoices yet.</div>
          ) : (
            <div>
              {paid.map((inv) => {
                const label =
                  inv?.product === "player_listing" ? "Player listing" : "Contacts access";
                return (
                  <div className="space-y-3 py-4">
                    <div key={inv.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-5xl ">
                      <div>
                        <div className="font-bold p-2">Order: <span className="font-normal">{label}</span></div>
                        <div className="font-bold p-2">Paid at: <span className="font-normal">{new Date(inv.createdAt).toLocaleString()}</span> </div>
                        <div className="font-bold p-2">Amount: <span className="font-normal">{inv.amount} {inv.currency}</span></div>
                        <div className="font-bold p-2">Order number: <span className="font-normal">{inv.orderNumber}</span></div>
                      </div>
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
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div >
    </div >
  </>
  );
}
