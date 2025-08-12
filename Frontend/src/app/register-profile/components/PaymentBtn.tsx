"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const PUBLIC_KEY = "pk_sbox_i4twb5ernwnihql3ar4y2cuh4eh" as const;
const BACKEND_URL = "https://insidewebsitepayment.fly.dev" as const;
const ORDER_REF = "ORD-123A" as const;

/* ====== Types ====== */
type Environment = "sandbox" | "production";

interface CheckoutInit {
  publicKey: string;
  environment: Environment;
  paymentSession: unknown;
  onReady?: () => void;
  onError?: (component: unknown, err: unknown) => void;
  onPaymentCompleted?: (
    component: unknown,
    resp: { reference?: string } & Record<string, unknown>
  ) => void;
}


interface FlowComponent {
  mount: (el: HTMLElement | null) => void;
}

interface CheckoutInstance {
  create: (component: "flow") => FlowComponent;
}

declare global {
  interface Window {
    CheckoutWebComponents?: (
      options: CheckoutInit
    ) => Promise<CheckoutInstance>;
  }
}

type PaymentState = "" | " تم الدفع بنجاح" | " الدفع فشل" | string;

/* ====== Component ====== */
export default function PaymentBtn() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const [status, setStatus] = useState<PaymentState>("");
  const [loading, setLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Wait for Checkout SDK script to load
  useEffect(() => {
    let cancelled = false;
    const wait = async () => {
      while (!cancelled && !window.CheckoutWebComponents) {
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!cancelled) setSdkReady(true);
    };
    void wait();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  async function startPayment(): Promise<void> {
    if (loading || sessionCreated) return;
    if (!sdkReady || !window.CheckoutWebComponents) {
      setStatus("❌ الدفع فشل: المكتبة غير محمّلة");
      toast.error("المكتبة غير محمّلة. حدّث الصفحة أو تأكد من سكربت Checkout.");
      return;
    }

    setLoading(true);
    setStatus("");
    setIsOpen(true);

    toastIdRef.current = toast.loading("جاري تهيئة جلسة الدفع…");

    try {
      const r = await fetch(`${BACKEND_URL}/create-payment-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const raw = await r.text();
      if (!r.ok) {
        console.error("create-payment-sessions failed:", r.status, raw);
        setStatus("❌ الدفع فشل أثناء إنشاء الجلسة");
        toast.dismiss(toastIdRef.current);
        toast.error("فشل إنشاء جلسة الدفع، حاول مرة أخرى.");
        return;
      }

      let paymentSession: unknown;
      try {
        paymentSession = JSON.parse(raw);
      } catch {
        console.error("Non-JSON payment session:", raw);
        setStatus("❌ الدفع فشل: جلسة الدفع غير صالحة");
        toast.dismiss(toastIdRef.current);
        toast.error("جلسة الدفع غير صالحة.");
        return;
      }

      toast.dismiss(toastIdRef.current);
      toast.success("تم تهيئة الدفع. أكمل الخطوات في النافذة.");

      setSessionCreated(true);

      const cko = await window.CheckoutWebComponents({
        publicKey: PUBLIC_KEY,
        environment: "sandbox",
        paymentSession,
        onReady: () => {
          // Component is ready
        },
        onError: (_c, err: unknown) => {
          console.error("CKO error:", err);
          const errorMessage =
            (err as { message?: string })?.message ||
            (err as { error_summary?: string })?.error_summary ||
            (err as { name?: string })?.name ||
            "خطأ غير معروف";
          setStatus(`❌ الدفع فشل: ${errorMessage}`);
          toast.error(`فشل الدفع: ${errorMessage}`);
          setSessionCreated(false);
          setIsOpen(false);
        },
        onPaymentCompleted: (_c, resp) => {
          console.log("Payment completed event:", resp);
          toast.loading("جارٍ تأكيد الدفع…");
          void pollPaymentStatus(resp.reference || ORDER_REF);
        },
      });

      const flow = cko.create("flow");
      flow.mount(mountRef.current);
    } catch (e) {
      console.error("startPayment error:", e);
      setStatus("❌ الدفع فشل");
      toast.dismiss(toastIdRef.current);
      toast.error("حدث خطأ غير متوقع أثناء بدء الدفع.");
    } finally {
      setLoading(false);
    }
  }

  async function pollPaymentStatus(reference: string): Promise<void> {
    if (pollRef.current) window.clearInterval(pollRef.current);

    let attempts = 0;
    pollRef.current = window.setInterval(async () => {
      attempts++;
      try {
        const r = await fetch(`${BACKEND_URL}/payment-status/${reference}`);

        const raw = await r.text();
        let data: { status?: string } = {};
        try {
          data = JSON.parse(raw);
        } catch {
          // Ignore JSON parse errors
        }

        const s = data.status;
        console.log("🔍 Payment status:", r.status, s, raw);

        if (s === "payment_captured" || s === "payment_approved") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setStatus("✅ تم الدفع بنجاح");
          toast.dismiss();
          toast.success("✅ تم الدفع بنجاح");
          setIsOpen(false);
          return;
        }

        if (s === "payment_declined") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setStatus("❌ الدفع فشل");
          toast.dismiss();
          toast.error("❌ الدفع اترفض، حاول ببطاقة أخرى.");
          setIsOpen(false);
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (attempts === 1) {
          toast("نحاول نؤكد حالة الدفع…");
        }
      }

      if (attempts > 15) {
        if (pollRef.current) window.clearInterval(pollRef.current);
        setStatus("❌ الدفع فشل (مهلة الاستعلام انتهت)");
        toast.dismiss();
        toast.error(
          "انتهت مهلة تأكيد الدفع. لو خُصم المبلغ هيتحدّث خلال لحظات."
        );
        setIsOpen(false);
      }
    }, 2000);
  }

  function closeModal() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsOpen(false);
    setSessionCreated(false);
  }

  return (
    <>
      <button
        onClick={startPayment}
        disabled={loading || sessionCreated || !sdkReady}
        className="hover:shadow-form m-auto w-48 rounded-md bg-[hsl(var(--primary))] py-3 px-6 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading
          ? "جاري التحضير..."
          : !sdkReady
          ? "جاري التحميل…"
          : "ادفع الآن"}
      </button>

      {/* Modal Popup */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <button
              className="absolute inset-0 bg-black/60"
              aria-label="إغلاق"
              onClick={closeModal}
            />
            {/* Dialog */}
            <div className="relative z-[1001] w-full max-w-[520px] rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="text-lg font-semibold">اتمام الدفع</h3>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="rounded-md p-1.5 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 py-4">
                <div ref={mountRef} id="flow-container" />
              </div>

              <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
                <button
                  onClick={closeModal}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
