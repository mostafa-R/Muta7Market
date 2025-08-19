"use client";

import { CreditCard, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { RiMastercardFill, RiVisaLine } from "react-icons/ri";
import { toast } from "react-toastify";
type PaymentBtnProps = {
  type?:
    | "unlock_contacts"
    | "publish_profile"
    | "activate_user"
    | "promote_player";
  playerId?: string; // required when type is publish_profile
};

export default function PaymentBtn({
  type = "unlock_contacts",
  playerId,
}: PaymentBtnProps) {
  const { t } = useTranslation();
  // Ensure API base points to backend API root
  const API_BASE =
    (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") +
    (process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith("/api/v1")
      ? ""
      : "/api/v1");

  const [loading, setLoading] = useState(false);

  // Read token
  const { token } = useMemo(() => {
    let t = "";
    try {
      t = localStorage.getItem("token") || "";
    } catch {}
    return { token: t };
  }, []);

  useEffect(() => {}, []);

  const startPayment = async () => {
    setLoading(true);

    const promise = (async () => {
      // Map to backend payment schema
      const feature =
        type === "promote_player"
          ? "publish_profile"
          : type === "activate_user"
          ? "unlock_contacts"
          : type;
      const product =
        feature === "unlock_contacts" ? "contacts_access" : "player_listing";
      if (product === "player_listing" && !playerId) {
        toast.info(t("payment.completeProfileFirst"));
        window.location.href = "/profile?tab=payments";
        return "redirected_to_payments";
      }
      const body =
        product === "contacts_access"
          ? { product }
          : { product, playerProfileId: playerId };

      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(t("payments.tooManyAttempts"));
        } else if (res.status === 401) {
          throw new Error(t("formErrors.loginRequiredFirst"));
        } else if (res.status === 400) {
          throw new Error(json?.message || t("payments.invalidRequestData"));
        } else if (res.status >= 500) {
          throw new Error(t("payments.serverError"));
        } else {
          throw new Error(json?.message || t("payments.failedToCreateInvoice"));
        }
      }

      const url = json?.data?.paymentUrl;
      if (!url) throw new Error(t("payments.noPaymentUrlReceived"));

      window.location.href = url;
      return t("payments.invoiceCreatedSuccessfully");
    })();

    toast.promise(promise, {
      loading: t("payment.preparingPayment"),
      success: (msg) => msg,
      error: (e) => e?.message || t("payment.unexpectedError"),
    });

    try {
      await promise;
    } catch (error) {
      console.error("Payment initiation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 m-auto text-center">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="relative">
            <button
              onClick={startPayment}
              disabled={loading}
              className={`w-full py-4 px-6 my-3 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                loading
                  ? "bg-gray-200 cursor-not-allowed text-gray-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
              )}
              <CreditCard size={20} />
              <span>
                {loading
                  ? t("payments.redirectingToPayment")
                  : type === "activate_user"
                  ? t("payments.payToActivateAccount")
                  : type === "publish_profile"
                  ? t("payments.payToPublishProfile")
                  : t("payments.payNow")}
              </span>
            </button>

            <div className="absolute -top-2 -right-2 animate-pulse select-none">
              <div className="bg-amber-400/90 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow">
                {t("payments.specialOffer")}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
              <Shield size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {t("payments.securePayment")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("payments.paymentProcessing")}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-3  text-3xl text-gray-500">
            <span>
              <RiVisaLine />
            </span>
            <span>
              <RiMastercardFill />
            </span>
            <span>
              <FaApplePay />
            </span>
            <span>
              <FaGooglePay />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
