"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

/** -------- CONFIG -------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api/v1";

const ALLOW_TEST = String(process.env.NEXT_PUBLIC_ALLOW_TEST_PAYMENTS || "");

function authHeaders() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() },
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

/** -------- UI -------- */
export default function PaymentsSection({ defaultPlayerProfileId }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]);
  const [paid, setPaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [playerProfileId, setPlayerProfileId] = useState(
    defaultPlayerProfileId || ""
  );
  const [busy, setBusy] = useState({}); // map invoiceId -> boolean

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // 1) مصالحة مع Paylink لتحديث أي pending اتدفعت هناك
      await apiPost("/payments/reconcile", {});

      // 2) بعد المصالحة هات القوائم
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

  /** Pay an existing pending invoice:
   *  - لو عندها paymentUrl مباشرة نحول
   *  - غير كده نعمل initiate لنفس الفاتورة (ما نخلقش فاتورة جديدة)
   */
  const payExisting = async (inv) => {
    const id = inv?.id;
    setBusy((m) => ({ ...m, [id]: true }));
    try {
      if (inv?.paymentUrl) {
        window.location.href = inv.paymentUrl;
        return;
      }
      const init = await apiPost(`/payments/invoices/${id}/initiate`);
      const url = init?.data?.paymentUrl;
      if (!url) throw new Error(t("formErrors.noPaymentUrl"));
      window.location.href = url;
    } catch (e) {
      alert(e?.message || "Payment error");
    } finally {
      setBusy((m) => ({ ...m, [id]: false }));
    }
  };

  const labelForInvoice = (inv) => {
    if (inv?.product === "contacts_access") return t("payments.contactsAccess");
    if (inv?.product === "listing") {
      return inv?.targetType === "coach"
        ? t("payments.coachListing")
        : t("payments.playerListing");
    }
    if (inv?.product === "promotion") {
      return inv?.targetType === "coach"
        ? t("payments.coachTopList")
        : t("payments.playerTopList");
    }
    // توافق رجعي لو لسه في DB قديم
    if (inv?.product === "player_listing") return t("payments.playerListing");
    return inv?.product || "invoice";
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#00183D] p-6 lg:p-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center gap-3">
            {t("payments.title")}
          </h1>
        </div>
        <div className="space-y-8 p-5">
          <header className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">{t("payments.title")}</h2>
            <p className="text-sm text-gray-500">{t("payments.subtitle")}</p>
          </header>

          {/* Counters */}
          <section className="space-y-3 py-4 flex flex-col items-center">
            <div className="text-sm text-gray-700">
              <span className="mr-4">
                {t("payments.pending")}: <b>{counts.pending}</b>
              </span>
              <span>
                {t("payments.paid")}: <b>{counts.paid}</b>
              </span>
            </div>

            {/* Pending invoices */}
            <h3 className="text-lg font-semibold bg-[#00183D] w-full text-center text-white p-2 rounded-lg">
              {t("payments.pendingInvoices")}
            </h3>

            {loading ? (
              <ClipLoader size={50} color="#00183D" />
            ) : err ? (
              <div className="text-sm text-red-600">{err}</div>
            ) : pending.length === 0 ? (
              <div className="text-sm text-gray-500">
                {t("payments.noPendingInvoices")}
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {pending.map((inv) => {
                  const id = inv?.id;
                  const isBusy = !!busy[id];
                  const label = labelForInvoice(inv);
                  return (
                    <div
                      key={id}
                      className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-5xl"
                    >
                      <div>
                        <div className="font-bold p-2">
                          {t("payments.order")}:{" "}
                          <span className="font-normal">{label}</span>
                        </div>
                        <div className="font-bold p-2">
                          {t("payments.createdAt")}:{" "}
                          <span className="font-normal">
                            {new Date(inv.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="font-bold p-2">
                          {t("payments.amount")}:{" "}
                          <span className="font-normal">
                            {inv.amount} {inv.currency}
                          </span>
                        </div>
                        <div className="font-bold p-2">
                          {t("payments.orderNumber")}:{" "}
                          <span className="font-normal">{inv.orderNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {inv.paymentUrl ? (
                          <a
                            href={inv.paymentUrl}
                            className="text-white bg-[#00183D] hover:bg-[#00183dce] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
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
                            {t("payments.payNow")}
                          </a>
                        ) : (
                          <button
                            onClick={() => payExisting(inv)}
                            disabled={isBusy}
                            className="text-white bg-[#00183D] hover:bg-[#00183dce] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
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
                            {isBusy ? t("payments.opening") : t("payments.payNow")}
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
              {t("payments.paidInvoices")}
            </h3>
            {loading ? (
              <ClipLoader size={50} color="#00183D" />
            ) : paid.length === 0 ? (
              <div className="text-sm text-gray-500">
                {t("payments.noPaidInvoices")}
              </div>
            ) : (
              <div>
                {paid.map((inv) => {
                  const label = labelForInvoice(inv);
                  return (
                    <div className="space-y-3 py-4" key={inv.id}>
                      <div className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-5xl ">
                        <div>
                          <div className="font-bold p-2">
                            {t("payments.order")}:{" "}
                            <span className="font-normal">{label}</span>
                          </div>
                          <div className="font-bold p-2">
                            {t("payments.paidAt")}:{" "}
                            <span className="font-normal">
                              {new Date(inv.paidAt || inv.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-bold p-2">
                            {t("payments.amount")}:{" "}
                            <span className="font-normal">
                              {inv.amount} {inv.currency}
                            </span>
                          </div>
                          <div className="font-bold p-2">
                            {t("payments.orderNumber")}:{" "}
                            <span className="font-normal">
                              {inv.orderNumber}
                            </span>
                          </div>
                        </div>
                        {!!inv.receiptUrl && (
                          <a
                            href={inv.receiptUrl}
                            target="_blank"
                            className="text-blue-600 underline text-sm"
                          >
                            {t("payments.viewReceipt")}
                          </a>
                        )}
                      </div>
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
