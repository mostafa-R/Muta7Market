"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

// Joi validation schema - We'll update this with i18n in the component
const getForgotPasswordSchema = (language) =>
  Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email":
          language === "ar"
            ? "يرجى إدخال بريد إلكتروني صحيح"
            : "Please enter a valid email",
        "string.empty":
          language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required",
        "any.required":
          language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required",
      }),
  });

// Validate function - We'll use language inside the component
const getValidate = (language) => (values) => {
  const schema = getForgotPasswordSchema(language);
  const { error } = schema.validate(values, {
    abortEarly: false,
  });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const router = useRouter();

  const initialValues = {
    email: "",
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`;

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, setStatus }
  ) => {
    setIsSubmitting(true); // حالة محلية إذا كانت موجودة
    setSubmitting(true); // لحالة Formik
    setSubmitMessage(""); // مسح الرسائل السابقة
    setStatus(null);

    try {
      const response = await axios.post(API_URL, values, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // التحقق من النجاح الحقيقي: status 200 و success true
      if (response.status === 200 && response.data.success) {
        const successMsg =
          language === "ar"
            ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!"
            : "Password reset link has been sent to your email!";
        setSubmitMessage(successMsg);
        toast.success(successMsg);

        // توجيه بعد تأخير للسماح للمستخدم بقراءة الرسالة
        setTimeout(() => {
          router.push("/otp-for-restpassword");
        }, 2000);
      } else {
        // إذا status 200 لكن !success، عامل كخطأ وارمِ للـ catch
        throw new Error(response.data.error?.message || "حدث خطأ غير متوقع");
      }
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error.toJSON ? error.toJSON() : error
      ); // تسجيل دقيق باستخدام toJSON من Axios

      if (error.response && error.response.data) {
        const data = error.response.data;

        // التعامل مع أخطاء الحقول (مثل validation errors)
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, errorMessage]) => {
            setFieldError(field, errorMessage);
          });
          toast.error("يرجى التحقق من الحقول المحددة");
        }
        // التعامل مع رسائل الخطأ المحددة من الخلفية
        else if (
          data.error?.message === "No user found with this email" ||
          data.message?.includes("not found")
        ) {
          setFieldError("email", "البريد الإلكتروني غير مسجل في النظام");
          toast.error("البريد الإلكتروني غير مسجل في النظام");
        }
        // أخطاء عامة أخرى
        else {
          const errorMsg =
            data.error?.message || data.message || "حدث خطأ أثناء إرسال الطلب";
          setSubmitMessage(errorMsg);
          setStatus(errorMsg);
          toast.error(errorMsg);
        }
      } else if (error.request) {
        // مشكلة شبكة: لا استجابة من الخادم
        const networkMsg = "فشل في الاتصال بالخادم، يرجى التحقق من الإنترنت";
        setSubmitMessage(networkMsg);
        setStatus(networkMsg);
        toast.error(networkMsg);
      } else {
        // خطأ في الإعداد أو غير متوقع
        const generalMsg = error.message || "حدث خطأ غير متوقع";
        setSubmitMessage(generalMsg);
        setStatus(generalMsg);
        toast.error(generalMsg);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div
      className="flex items-center justify-center p-12 min-h-screen bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <motion.div
        className="mx-auto w-full max-w-[550px] bg-white rounded-lg shadow-lg p-8"
        variants={formVariants}
        initial="initial"
        animate="animate"
        key={language}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#07074D] mb-2">
            {t("auth.resetPassword")}
          </h1>
          <p className="text-gray-600">{t("auth.resetPasswordDescription")}</p>
        </div>

        <Formik
          key={language}
          initialValues={initialValues}
          validate={getValidate(language)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting, status }) => (
            <Form>
              {/* Email Field */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder={t("auth.emailPlaceholder")}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pr-10 pl-6 text-base font-medium text-[#6B7280] outline-none focus:border-[hsl(var(--primary))] focus:shadow-md transition-all duration-200"
                  />
                  <FiMail className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="email"
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
                  className="w-full flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary)/0.9)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? (
                    <>
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
                      {t("common.loading")}
                    </>
                  ) : (
                    t("common.submit")
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-[hsl(var(--primary))] hover:underline text-sm transition-colors duration-200 font-medium"
                >
                  {t("common.back")}{" "}
                  {language === "ar" ? "إلى تسجيل الدخول" : "to login"}
                </Link>
              </div>

              {/* Success/Error Message */}
              {submitMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center text-sm ${
                    submitMessage.includes("تم إرسال") ||
                    submitMessage.includes("successfully")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {language === "ar"
              ? "تذكرت كلمة المرور؟"
              : "Remembered your password?"}{" "}
            <Link
              href="/signin"
              className="text-[hsl(var(--primary))] hover:underline font-medium"
            >
              {language === "ar" ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
