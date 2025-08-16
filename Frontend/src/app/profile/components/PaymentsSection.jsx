"use client";
import { useMemo, useState } from "react";
import PaymentBtn from "@/app/register-profile/components/PaymentBtn";
import { toast } from "react-toastify";

const PaymentsSection = ({ payments, invoices = [], router, t, language }) => {
  let isUserInactive = false;
  try {
    const u = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');
    isUserInactive = u && u.isActive === false;
  } catch { }

  const API_BASE = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
  }, []);

  // Track paying state per payment ID to avoid toggling all cards at once
  const [payingIds, setPayingIds] = useState(() => new Set());
  const setPaying = (paymentId, value) => {
    setPayingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(paymentId);
      else next.delete(paymentId);
      return next;
    });
  };
  const ALLOW_TEST = process.env.NEXT_PUBLIC_ALLOW_TEST_PAYMENTS === "1";

  const handlePayExisting = async (paymentId) => {
    try {
      setPaying(paymentId, true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to initiate payment");
      const url = json?.data?.paymentUrl;
      if (!url) throw new Error("No payment URL returned");
      window.location.href = url;
    } catch (e) {
      toast.error(e?.message || "Failed to start payment");
    } finally {
      setPaying(paymentId, false);
    }
  };

  const simulatePayment = async (paymentId, outcome = "success") => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
      const path = outcome === "success" ? "simulate-success" : "simulate-fail";
      const res = await fetch(`${API_BASE}/payments/${paymentId}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: outcome === "fail" ? "Simulated failure" : undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Simulation failed");
      toast.success(outcome === "success" ? "Payment simulated: success" : "Payment simulated: failed");
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 600);
    } catch (e) {
      toast.error(e?.message || "Simulation error");
    }
  };
  // ترجمة القيم إلى العربية
  const translateJop = (jop) => {
    return jop === "player"
      ? t("common.player")
      : jop === "coach"
        ? t("common.coach")
        : jop || t("common.notAvailable");
  };

  const translateStatus = (status) => {
    switch (status) {
      case "available":
        return t("player.status.freeAgent");
      case "contracted":
        return t("player.status.contracted");
      case "transferred":
        return t("player.status.transferred");
      default:
        return status || t("common.notAvailable");
    }
  };

  const InvoiceCard = ({ inv }) => {
    const issued = inv?.issueDate ? new Date(inv.issueDate) : null;
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full border border-gray-100">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
            <i className="fas fa-file-invoice-dollar" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs uppercase tracking-wide">{inv?.status || 'paid'}</span>
              <span className="text-white/80 text-xs">{issued ? issued.toLocaleDateString() : ''}</span>
            </div>
            <h3 className="font-semibold text-lg mt-1">
              {t("invoice.title", { defaultValue: "Invoice" })} #{inv?.invoiceNumber}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold drop-shadow-sm">{inv?.totalAmount} {inv?.currency || "SAR"}</div>
            {inv?.taxAmount > 0 && (
              <div className="text-xs text-white/80">{t("invoice.vat", { defaultValue: "VAT" })}: {inv.taxAmount}</div>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <i className="fas fa-user-circle text-gray-400" />
                <span className="text-sm">{t("invoice.user", { defaultValue: "User" })}: </span>
                <span className="font-medium truncate">{inv?.user}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <i className="fas fa-hashtag text-gray-400" />
                <span className="text-sm">{t("invoice.payment", { defaultValue: "Payment" })}: </span>
                <span className="font-medium truncate">{inv?.payment}</span>
              </div>
            </div>
            <div className="sm:text-right">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <i className="fas fa-download" /> {t("invoice.download", { defaultValue: "Download PDF" })}
              </a>
              <div className="mt-2 text-xs text-gray-500">{t("invoice.note", { defaultValue: "Keep this invoice for your records." })}</div>
            </div>
          </div>
          {Array.isArray(inv?.items) && inv.items.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <div className="text-sm font-semibold mb-2">{t("invoice.items", { defaultValue: "Items" })}</div>
              <ul className="space-y-1 text-sm text-gray-700">
                {inv.items.map((it, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="truncate">{it?.description?.ar || it?.description?.en || '-'}</span>
                    <span className="font-medium">{it?.total} {inv?.currency || 'SAR'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PaymentCard = ({ payment }) => {
    const isPaymentRecord =
      payment && typeof payment === "object" && payment.type && payment.amount !== undefined;
    // تحديد القيم الافتراضية للحقول المفقودة بدون validation غير ضروري
    const safePayment = {
      _id: payment._id || "",
      type: payment.type || "",
      status: payment.status || "",
      amount: payment.amount || 0,
      currency: payment.currency || "SAR",
      description: payment.description || "",
      name:
        typeof payment.name === "string"
          ? { ar: payment.name, en: "" }
          : payment.name || { ar: t("common.notAvailable"), en: "" },
      position:
        typeof payment.position === "string"
          ? { ar: payment.position, en: "" }
          : payment.position || { ar: t("common.notAvailable"), en: "" },
      monthlySalary: payment.monthlySalary || { amount: 0, currency: "SAR" },
      yearSalary: payment.yearSalary || { amount: 0, currency: "SAR" },
      nationality: payment.nationality || t("common.notAvailable"),
      jop: payment.jop || null,
      status: payment.status || null,
      isActive: payment.isActive || false,
      game: payment.game || t("common.notAvailable"),
      contactInfo: payment.contactInfo || { email: null, phone: null },
      media: payment.media || { profileImage: { url: null, publicId: null } },
    };

    if (isPaymentRecord) {
      const STATIC_PRICING = {
        add_offer: Number(process.env.NEXT_PUBLIC_PRICE_ADD_OFFER) || 100,
        promote_offer: Number(process.env.NEXT_PUBLIC_PRICE_PROMOTE_OFFER) || 50,
        unlock_contact: Number(process.env.NEXT_PUBLIC_PRICE_UNLOCK_CONTACT) || 25,
        activate_user: Number(process.env.NEXT_PUBLIC_PRICE_ACTIVATE_USER) || 200,
        promote_player: Number(process.env.NEXT_PUBLIC_PRICE_PROMOTE_PLAYER) || 155,
        promote_coach: Number(process.env.NEXT_PUBLIC_PRICE_PROMOTE_COACH) || 55,
      };
      const displayAmount = STATIC_PRICING[safePayment.type] ?? safePayment.amount;
      const status = String(safePayment.status || "").toLowerCase();
      const canPay = ["pending", "failed", "cancelled", "canceled"].includes(status);
      return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden w-full">
          <div className="bg-[#00183D] p-4 flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {safePayment.type?.split("_")[0]?.[0]?.toUpperCase() || "P"}
            </div>
            <div className="w-full">
              <div className="text-left">
                <h3 className="font-semibold text-lg">
                  {t("payment.type", { defaultValue: "Type" })}: {safePayment.type}
                </h3>
                <div className="text-white/80 text-sm">
                  {t("payment.status", { defaultValue: "Status" })}: {safePayment.status}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{displayAmount} {safePayment.currency}</div>
            </div>
          </div>
          <div className="p-6">
            {safePayment.description && (
              <div className="mb-4 text-gray-700">{safePayment.description}</div>
            )}
            {canPay && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePayExisting(safePayment._id)}
                  disabled={payingIds.has(safePayment._id)}
                  className="w-full sm:w-auto px-4 py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#00183D]/80 transition-all font-medium"
                >
                  {payingIds.has(safePayment._id) ? t("payment.processing", { defaultValue: "Processing…" }) : t("payment.payNow", { defaultValue: "Pay Now" })}
                </button>
                {ALLOW_TEST && (
                  <>
                    <button
                      onClick={() => simulatePayment(safePayment._id, "success")}
                      className="w-full sm:w-auto px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium"
                    >
                      Simulate Success
                    </button>
                    <button
                      onClick={() => simulatePayment(safePayment._id, "fail")}
                      className="w-full sm:w-auto px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-medium"
                    >
                      Simulate Fail
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden w-full">
        <div className="bg-[#00183D] p-4 flex items-center gap-4">
          {safePayment.media?.profileImage?.url ? (
            <img
              src={safePayment.media.profileImage.url}
              alt={safePayment.name.ar}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => (e.target.src = "/default-profile.png")} // صورة افتراضية
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-user text-gray-500 text-2xl"></i>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">
              {safePayment.name.ar}
            </h3>
            <div className="text-white/80 text-sm">
              {safePayment.type && (
                <span className="mr-2">{t("payment.type") || "Type"}: {safePayment.type}</span>
              )}
              {safePayment.status && (
                <span>{t("payment.status") || "Status"}: {safePayment.status}</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              {displayAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <i className="fas fa-receipt"></i>
                    {t("payment.amount") || "Amount"}
                  </span>
                  <span className="font-bold text-purple-600">
                    {displayAmount} {safePayment.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-money-bill-wave"></i>
                  {t("player.monthlySalary")}
                </span>
                <span className="font-bold text-purple-600">
                  {safePayment.monthlySalary.amount}{" "}
                  {safePayment.monthlySalary.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-money-check-alt"></i>
                  {t("player.annualContract")}
                </span>
                <span className="font-bold text-purple-600">
                  {safePayment.yearSalary.amount}{" "}
                  {safePayment.yearSalary.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-flag"></i>
                  {t("playerDetail.nationality")}
                </span>
                <span className="text-gray-800">{safePayment.nationality}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-briefcase"></i>
                  {t("profile.job")}
                </span>
                <span className="text-gray-800">
                  {translateJop(safePayment.jop)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-map-marker-alt"></i>
                  {t("player.position")}
                </span>
                <span className="text-gray-800">{safePayment.position.ar}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  {t("profile.status")}
                </span>
                <span className="text-gray-800">
                  {translateStatus(safePayment.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-toggle-on"></i>
                  {t("profile.active")}
                </span>
                <span className="text-gray-800">
                  {safePayment.isActive ? t("common.yes") : t("common.no")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-futbol"></i>
                  {t("player.sport")}
                </span>
                <span className="text-gray-800">{safePayment.game}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <i className="fas fa-envelope"></i>
                {t("profile.email")}
              </span>
              <span className="text-gray-800">
                {safePayment.contactInfo.email || t("common.notAvailable")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <i className="fas fa-phone"></i>
                {t("profile.phone")}
              </span>
              <span className="text-gray-800">
                {safePayment.contactInfo.phone || t("common.notAvailable")}
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              router.push(`/register-profile?id=${safePayment._id}`)
            }
            className="mt-6 w-full py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#00183D]/80 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-eye"></i>
            {t("common.viewDetails")}
          </button>
          <div className="mt-4 w-full">
            {/* Player activation payment (for inactive player profile) */}
            <PaymentBtn type="promote_player" description="Activate player profile" metadata={{ source: 'player-activation' }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-credit-card"></i>
          {t("profile.payments")}
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        {payments.length === 0 && invoices.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-xl">
              {t("profile.noDataAvailable")}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                {t("profile.youHaveRecords", { count: payments.length + invoices.length })}
              </p>
            </div>
            {payments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-credit-card" /> {t("profile.pendingPayments", { defaultValue: "Pending payments" })}
                </h3>
                <div className={'flex flex-col gap-4'}>
                  {payments.map((payment) => (
                    <PaymentCard key={payment._id} payment={payment} />
                  ))}
                </div>
              </div>
            )}
            {invoices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-file-invoice" /> {t("profile.invoices", { defaultValue: "Invoices" })}
                </h3>
                <div className={`grid ${invoices.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
                  {invoices.map((inv) => (
                    <InvoiceCard key={inv._id} inv={inv} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsSection;
