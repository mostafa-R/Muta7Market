"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingSpinner from "../component/LoadingSpinner";

// ------------------------------
// Joi schema with language support
// ------------------------------
const getOtpSchema = (t) =>
  Joi.object({
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.empty": t("otp.pleaseEnterOtp"),
        "string.pattern.base": t("otp.pleaseEnterValid6DigitCode"),
        "any.required": t("otp.otpRequired"),
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.empty": t("auth.pleaseEnterPassword"),
        "string.min": t("auth.passwordMinLength"),
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": t("auth.passwordsDoNotMatch"),
        "string.empty": t("auth.pleaseConfirmPassword"),
      }),
  });

const getValidate = (t) => (values) => {
  const schema = getOtpSchema(t);
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};
  const errors = {};
  for (const d of error.details) errors[d.path[0]] = d.message;
  return errors;
};

// Extract API message safely
const pickMsg = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (typeof x?.message === "string") return x.message;
  if (Array.isArray(x) && typeof x[0] === "string") return x[0];
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
};

function OTPForResetPasswordContent() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const router = useRouter();
  const params = useSearchParams();
  const intervalRef = useRef(null);

  const challengeId = params.get("challengeId");
  const resetToken = params.get("token");

  const initialValues = { otp: "", password: "", confirmPassword: "" };
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const VERIFY_URL = `${API_BASE}/auth/reset-password`; // changed to reset-password API
  const RESEND_URL = `${API_BASE}/auth/resend-otp`;

  // ------------------------------
  // Resend OTP
  // ------------------------------
  const handleResendOTP = async () => {
    try {
      setResendDisabled(true);
      setResendCountdown(60);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const payload = {};
      if (challengeId) payload.challengeId = challengeId;
      if (resetToken) payload.token = resetToken;

      const { data, status } = await axios.post(RESEND_URL, payload, {
        withCredentials: true,
        validateStatus: () => true,
      });

      if (status >= 400) {
        const msg =
          pickMsg(data?.error) ||
          pickMsg(data?.message) ||
          t("otp.failedToSendNewCode");
        toast.error(msg);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setResendDisabled(false);
        setResendCountdown(0);
        return;
      }

      toast.success(pickMsg(data?.message) || t("otp.newCodeSentSuccessfully"));
    } catch {
      toast.error(t("otp.failedToSendNewCode"));
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  // ------------------------------
  // Submit Form (OTP + Passwords)
  // ------------------------------
  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError, setStatus }
  ) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    setStatus(null);

    try {
      const payload = {
        otp: values.otp.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      if (challengeId) payload.challengeId = challengeId;
      if (resetToken) payload.token = resetToken;

      const { data, status } = await axios.post(VERIFY_URL, payload, {
        withCredentials: true,
        validateStatus: () => true,
      });

      if (status >= 400) {
        const msg =
          pickMsg(data?.error) ||
          pickMsg(data?.message) ||
          t("auth.resetPasswordError");
        setFieldError("otp", msg);
        setStatus(msg);
        setSubmitMessage(msg);
        return;
      }

      const successMsg =
        pickMsg(data?.message) || t("auth.passwordResetSuccess");
      setSubmitMessage(successMsg);
      toast.success(successMsg);
      resetForm();
      router.push("/signin");
    } catch (error) {
      const data = error?.response?.data;
      const msg =
        pickMsg(data?.error) ||
        pickMsg(data?.message) ||
        pickMsg(data) ||
        t("errors.unexpectedError");
      setFieldError("otp", msg);
      setStatus(msg);
      setSubmitMessage(msg);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center p-12 min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[550px] bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#07074D] mb-2">
            {t("auth.resetPassword")}
          </h1>
          <p className="text-gray-600">{t("otp.codeSentToEmail")}</p>
        </div>

        <Formik
          initialValues={initialValues}
          validate={getValidate(t)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting, status }) => (
            <Form>
              {/* OTP Field */}
              <div className="mb-5">
                <label
                  htmlFor="otp"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {t("otp.verificationCode")}
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="otp"
                    id="otp"
                    placeholder={t("otp.enter6DigitCode")}
                    maxLength="6"
                    className="w-full rounded-md border border-[#e0e0e0] bg.white py-3 pr-10 pl-6  font-medium text-[#6B7280] outline-none focus:border-[hsl(var(--primary))] focus:shadow-md transition-all duration-200 text-center text-lg tracking-widest"
                    style={{ letterSpacing: "0.5em" }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                  />
                  <FiLock className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {t("auth.newPassword")}
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  placeholder={t("auth.enterNewPassword")}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline.none focus:border-[hsl(var(--primary))] focus:shadow-md"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="mb-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {t("auth.confirmPassword")}
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder={t("auth.reEnterPassword")}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline.none focus:border-[hsl(var(--primary))] focus:shadow-md"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* General Error */}
              {status && (
                <div className="mb-4 p-3 rounded-md text-center text-sm bg-red-50 text-red-700 border border-red-200">
                  {String(status)}
                </div>
              )}

              {/* Submit Button */}
              <div className="mb-4">
                <button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                  className="hover:shadow-form w-full rounded-md bg-[hsl(var(--primary))] py-3 px-8 text-center text-base font-semibold text-white outline.none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:bg-[hsl(var(--primary)/0.9)]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 ml-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("common.verifying")}
                    </div>
                  ) : (
                    t("auth.confirmAndReset")
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-[hsl(var(--primary))] hover:underline text-sm font-medium transition-colors.duration-200"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>

              {/* Success/Error Message */}
              {submitMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center text-sm border ${
                    submitMessage.includes("بنجاح") ||
                    submitMessage.toLowerCase().includes("success")
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {String(submitMessage)}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t("otp.didNotReceiveCode")}{" "}
            <button
              type="button"
              disabled={resendDisabled}
              className={`font-medium transition-colors.duration-200 ${
                resendDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[hsl(var(--primary))] hover:underline"
              }`}
              onClick={handleResendOTP}
            >
              {resendDisabled
                ? `${t("otp.resend")} (${resendCountdown})`
                : t("otp.resend")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OTPForResetPassword() {
  // Using Suspense with a language-aware component
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <OTPForResetPasswordContent />
    </Suspense>
  );
}
