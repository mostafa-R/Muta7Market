"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

function authHeaders() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

const HotToaster = dynamic(
  async () => (await import("react-hot-toast")).Toaster,
  { ssr: false }
);

export default function PaymentsSection() {
  const searchParams = useSearchParams();

  const [pending, setPending] = useState([]);
  const [paid, setPaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState({});

  const counts = useMemo(
    () => ({ pending: pending?.length || 0, paid: paid?.length || 0 }),
    [pending, paid]
  );

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

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const checkStatusBy = async ({ invoiceId, transactionNo, orderNumber }) => {
    if (orderNumber) {
      return apiGet(
        `/payments/status/order/${encodeURIComponent(orderNumber)}`
      );
    }
    if (invoiceId) {
      return apiGet(`/payments/status/${invoiceId}`);
    }
    if (transactionNo) {
      return apiGet(`/payments/status/tx/${transactionNo}`);
    }
    throw new Error("No orderNumber/invoiceId/transactionNo to check");
  };
  const toastApi = async () => {
    try {
      const mod = await import("react-hot-toast");
      return mod.toast;
    } catch {
      return null;
    }
  };

  const confirmFromCallback = useCallback(
    async ({ invoiceId, transactionNo }) => {
      const toast = await toastApi();
      const loadingId = toast?.loading("Confirming your payment…");

      try {
        let status = "pending";
        try {
          const j = await checkStatusBy({
            invoiceId,
            transactionNo,
            orderNumber,
          });
          status = String(j?.data?.status || "pending").toLowerCase();
        } catch {}

        if (status !== "paid") {
          try {
            if (invoiceId) {
              await apiPost("/payments/reconcile", { invoiceIds: [invoiceId] });
            } else {
              await apiPost("/payments/reconcile", {});
            }
          } catch {}

          for (let i = 0; i < 6; i++) {
            await sleep(1500);
            try {
              const j2 = await checkStatusBy({ invoiceId, transactionNo });
              status = String(j2?.data?.status || "pending").toLowerCase();
              if (status === "paid") break;
            } catch {}
          }
        }

        if (status === "paid") {
          toast?.success("Payment confirmed ✅", { id: loadingId });
        } else {
          toast?.error(
            "Payment not confirmed yet. If you paid, it may take a moment.",
            { id: loadingId }
          );
        }

        await refresh();

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("invoiceId");
          url.searchParams.delete("transactionNo");
          url.searchParams.delete("orderNumber");
          window.history.replaceState({}, "", url.toString());
        }
      } catch (e) {
        const toast = await toastApi();
        toast?.error(e?.message || "Payment verification failed");
      }
    },
    [refresh]
  );

  useEffect(() => {
    (async () => {
      const invoiceId = searchParams?.get("invoiceId") || null;
      const transactionNo = searchParams?.get("transactionNo") || null;
      const orderNumber = searchParams?.get("orderNumber") || null;

      if (invoiceId || transactionNo) {
        await confirmFromCallback({ invoiceId, transactionNo });
      } else {
        try {
          if (orderNumber) {
            await apiPost("/payments/reconcile", {
              orderNumbers: [orderNumber],
            });
          } else if (invoiceId) {
            await apiPost("/payments/reconcile", { invoiceIds: [invoiceId] });
          } else {
            await apiPost("/payments/reconcile", {});
          }
        } catch {}
        await refresh();
      }
    })();
  }, [confirmFromCallback, refresh, searchParams]);

  const payExisting = async (inv) => {
    const id = inv?.id;
    setBusy((m) => ({ ...m, [id]: true }));
    try {
      if (inv?.paymentUrl) {
        window.location.href = inv.paymentUrl;
        return;
      }
      const { data } = await apiPost(`/payments/invoices/${id}/initiate`);
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      throw new Error("No payment link available for this invoice");
    } catch (e) {
      const toast = await toastApi();
      toast?.error(e?.message || "Payment error");
    } finally {
      setBusy((m) => ({ ...m, [id]: false }));
    }
  };

  return (
    <>
      {/* Local Toaster if not already in layout */}
      <HotToaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#00183D] p-6 lg:p-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center gap-3">
            Payments
          </h1>
        </div>

        <div className="space-y-8 p-5">
          <header className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Payments</h2>
            <p className="text-sm text-gray-500">
              Review all invoices for your account
            </p>
            <div className="text-sm text-gray-700">
              <span className="mr-4">
                Pending: <b>{counts.pending}</b>
              </span>
              <span>
                Paid: <b>{counts.paid}</b>
              </span>
            </div>
          </header>

          {/* Pending invoices */}
          <section className="space-y-3 py-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold bg-[#00183D] w-full text-center text-white p-2 rounded-lg">
              Pending invoices
            </h3>

            {loading ? (
              <ClipLoader size={50} color="#00183D" />
            ) : err ? (
              <div className="text-sm text-red-600">{err}</div>
            ) : pending.length === 0 ? (
              <div className="text-sm text-gray-500">No pending invoices</div>
            ) : (
              <div className="space-y-3 py-4 w-full">
                {pending.map((inv) => {
                  const id = inv?.id;
                  const isBusy = !!busy[id];
                  const label =
                    inv?.product === "player_listing"
                      ? "Player/Coach listing"
                      : inv?.product === "promotion"
                      ? "Promotion"
                      : "Contacts access";
                  return (
                    <div
                      key={id}
                      className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold p-1">
                          Order: <span className="font-normal">{label}</span>
                        </div>
                        <div className="font-bold p-1">
                          Created:{" "}
                          <span className="font-normal">
                            {new Date(inv.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="font-bold p-1">
                          Amount:{" "}
                          <span className="font-normal">
                            {inv.amount} {inv.currency}
                          </span>
                        </div>
                        <div className="font-bold p-1">
                          Order No:{" "}
                          <span className="font-normal">{inv.orderNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {inv.paymentUrl ? (
                          <a
                            href={inv.paymentUrl}
                            className="text-white bg-[#00183D] hover:bg-[#00183dce] rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                          >
                            <svg
                              className="w-3.5 h-3.5 mr-2"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 21"
                            >
                              <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                            </svg>
                            {isBusy ? "Opening…" : "Pay now"}
                          </a>
                        ) : (
                          <button
                            onClick={() => payExisting(inv)}
                            disabled={isBusy}
                            className="text-white bg-[#00183D] hover:bg-[#00183dce] rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                          >
                            <svg
                              className="w-3.5 h-3.5 mr-2"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 21"
                            >
                              <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                            </svg>
                            {isBusy ? "Opening…" : "Pay now"}
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
            <h3 className="text-lg font-semibold bg-[#00183D] w-full text-center text-white p-2 rounded-lg">
              Paid invoices
            </h3>
            {loading ? (
              <ClipLoader size={50} color="#00183D" />
            ) : paid.length === 0 ? (
              <div className="text-sm text-gray-500">No paid invoices</div>
            ) : (
              <div className="w-full space-y-3 py-4">
                {paid.map((inv) => {
                  const label =
                    inv?.product === "player_listing"
                      ? "Player/Coach listing"
                      : inv?.product === "promotion"
                      ? "Promotion"
                      : "Contacts access";
                  return (
                    <div
                      key={inv.id}
                      className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold p-1">
                          Order: <span className="font-normal">{label}</span>
                        </div>
                        <div className="font-bold p-1">
                          Paid at:{" "}
                          <span className="font-normal">
                            {new Date(
                              inv.paidAt || inv.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="font-bold p-1">
                          Amount:{" "}
                          <span className="font-normal">
                            {inv.amount} {inv.currency}
                          </span>
                        </div>
                        <div className="font-bold p-1">
                          Order No:{" "}
                          <span className="font-normal">{inv.orderNumber}</span>
                        </div>
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
