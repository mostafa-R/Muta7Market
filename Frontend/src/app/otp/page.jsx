"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
// import { motion } from "framer-motion"; // removed to simplify
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiLock } from "react-icons/fi";
import { toast } from "react-toastify";

// Joi schema - updated to use language context
const getOtpSchema = (t) =>
  Joi.object({
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.empty": t("otp.enterOtp"),
        "string.pattern.base": t("otp.validOtp"),
      }),
  });

// Joi to Formik validator - updated to use language context
const getValidate = (t) => (values) => {
  const schema = getOtpSchema(t);
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

// Component
export default function OTP() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const router = useRouter();

  const initialValues = {
    otp: "",
  };

  const successMessage = t("otp.verificationSuccess");
  const errorMessage = t("otp.invalidCode");

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`;

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError, setStatus }
  ) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    setStatus(null);

    try {
      const response = await axios.post(API_URL, values, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.success) {
        setSubmitMessage(successMessage);
        toast.success(successMessage);
        resetForm();

        // Redirect after successful verification
        setTimeout(() => {
          router.push("/signin");
        }, 1000);
      } else {
        setFieldError("otp", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);

      const apiMessage =
        error?.response?.data?.error || error?.response?.data?.message;

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.errors) {
          Object.entries(data.errors).forEach(([field, msg]) => {
            setFieldError(field, String(msg));
          });
        } else {
          const safeMsg =
            typeof apiMessage === "string" ? apiMessage : errorMessage;
          setSubmitMessage(safeMsg);
          setStatus(safeMsg);
          toast.error(safeMsg);
        }
      } else if (error.request) {
        const networkErrorMsg = t("errors.networkError");
        setSubmitMessage(networkErrorMsg);
        setStatus(networkErrorMsg);
        toast.error(networkErrorMsg);
      } else {
        setSubmitMessage(errorMessage);
        setStatus(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // const formVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  const messageText = typeof submitMessage === "string" ? submitMessage : "";
  const isSuccess =
    messageText.includes("بنجاح") || messageText.includes("successfully");

  return (
    <div
      className="flex items-center justify-center p-12 min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div
        className="mx-auto w-full max-w-[550px] bg-white rounded-lg shadow-lg p-8"
        // variants={formVariants}
        // initial="initial"
        // animate="animate"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#07074D] mb-2">
            {t("otp.verificationCode")}
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
                    type="tel"
                    name="otp"
                    id="otp"
                    placeholder={t("otp.enterCodePlaceholder")}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d*"
                    maxLength={6}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pr-10 pl-6 text-base font-medium text-[#6B7280] outline-none focus:border-[hsl(var(--primary))] focus:shadow-md transition-all duration-200 text-center text-lg tracking-widest"
                    style={{ letterSpacing: "0.5em" }}
                  />
                  <FiLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* General Error Message */}
              {status && (
                <div className="mb-4 p-3 rounded-md text-center text-sm bg-red-50 text-red-700">
                  {status}
                </div>
              )}

              {/* Submit Button */}
              <div className="mb-4">
                <button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                  className="hover:shadow-form w-full rounded-md bg-[hsl(var(--primary))] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("common.verifying")}
                    </div>
                  ) : (
                    t("common.confirm")
                  )}
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-[hsl(var(--primary))] hover:underline text-sm font-medium"
                >
                  {t("auth.signin")}
                </Link>
              </div>

              {/* Success/Error Message */}
              {messageText && (
                <div
                  className={`mt-4 p-3 rounded-md text-center text-sm ${
                    isSuccess
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {messageText}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {/* Resend Code Option */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t("otp.didNotReceiveCode")}{" "}
            <button
              type="button"
              className="text-[hsl(var(--primary))] hover:underline font-medium"
              onClick={() => {
                // Add resend OTP functionality here
                toast.info(t("otp.newCodeWillBeSent"));
              }}
            >
              {t("otp.resend")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
