"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type UserLS = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  mobile?: string;
};

const FIXED_PRICE = 55;
const CURRENCY = "USD";
const DESC = "Subscription";

export default function PaymentBtn() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const FRONT_BASE =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // اقرا التوكن واليوزر
  const { token, user } = useMemo(() => {
    let t = "";
    let u: UserLS = {};
    try {
      t = localStorage.getItem("token") || "";
    } catch {}
    try {
      u = JSON.parse(localStorage.getItem("user") || "{}") as UserLS;
    } catch {}
    return { token: t, user: u };
  }, []);

  // Polling على حالة الدفع
  useEffect(() => {
    if (!paymentId) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/v1/payments/${paymentId}/status`,
          {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }
        );
        const j = await r.json();
        const status = String(j?.data?.status || "").toUpperCase();

        if (status.includes("COMPLETED")) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success("تم الدفع بنجاح ✅ – تم تفعيل اشتراكك");
          setTimeout(() => {
            window.location.href = `${FRONT_BASE}/payment/success?pid=${paymentId}`;
          }, 700);
        } else if (status.includes("FAILED") || status.includes("CANCELLED")) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.error("فشل الدفع ❌ — حاول مرة أخرى");
        }
      } catch {
        // تجاهل أثناء polling
      }
    }, 3500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [paymentId, API_BASE, FRONT_BASE, token]);

  const startPayment = async () => {
    setLoading(true);

    const promise = (async () => {
      const body = {
        amount: FIXED_PRICE,
        currency: CURRENCY,
        description: DESC,
        metadata: {
          name: user?.name || "",
          email: user?.email || "",
          mobile: user?.mobile || "",
          source: "payment-btn",
        },
      };

      const res = await fetch(`${API_BASE}/api/v1/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "فشل إنشاء الفاتورة");

      const pId = json?.data?.paymentId;
      const url = json?.data?.paymentUrl;
      if (!pId || !url) throw new Error("لم نستلم رابط الدفع");

      setPaymentId(pId);
      setPaymentUrl(url);
      return "تم إنشاء الفاتورة — أكمل الدفع في النموذج أسفل الزر";
    })();

    toast.promise(promise, {
      loading: "جارٍ تجهيز الدفع…",
      success: (msg) => msg,
      error: (e) => e?.message || "حدث خطأ غير متوقع",
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={startPayment}
        disabled={loading}
        className={`mt-6  m-auto m-3 p-3 bg-[#00183D] text-white rounded-xl hover:bg-[#00183D]/80 transition-all flex items-center justify-center gap-2 font-medium ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#00183D] hover:opacity-90"
        }`}
      >
        {loading && (
          <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        )}
        {loading ? "جارٍ التفعيل…" : `ادفع ${FIXED_PRICE} ${CURRENCY}`}
      </button>

      {paymentUrl && (
        <div className="mt-2 border rounded-lg overflow-hidden">
          <iframe
            src={paymentUrl}
            className="w-full h-[70vh]"
            onLoad={() =>
              toast.message("جاهز للدفع 💳", {
                description: "أكمل بياناتك في النموذج.",
              })
            }
            onError={() =>
              toast.error(
                "تعذّر عرض بوابة الدفع داخل الصفحة — افتحها في تبويب جديد"
              )
            }
          />
          <div className="p-2 text-sm text-gray-500">
            لو النموذج لم يظهر،{" "}
            <a
              href={paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              افتحه في تبويب جديد
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
