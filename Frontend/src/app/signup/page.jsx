"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";

// Backend-aligned Joi schema (simplified and corrected)
const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Please provide your name",
    "string.min": "Name must be at least 3 characters",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Please provide an email address",
    }),
  phone: Joi.string()
    .pattern(/^\+?\d{8,15}$/)
    .required()
    .messages({
      "string.empty": "Please provide a phone number",
      "string.pattern.base": "Please provide a valid phone number",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number and one special character",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Please confirm your password",
  }),
});

// Convert Joi validation to Formik-compatible function
const validate = (values) => {
  const { error } = registerSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

export default function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const successMessage = "تم إنشاء الحساب بنجاح. سيتم تحويلك لصفحة التحقق.";
  const errorMessage = "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.";

  const initialValues = {
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`;

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    setIsSubmitting(true);
    setSubmitMessage("");

    const { name, phone, email, password, confirmPassword } = values;
    const payload = {
      name,
      phone,
      email: email.toLowerCase(),
      password,
      confirmPassword,
    };

    try {
      await axios.post(API_URL, payload, { withCredentials: true });

      setSubmitMessage(successMessage);
      toast.success(successMessage);
      resetForm();
      router.push("/otp");
    } catch (err) {
      const apiError =
        err?.response?.data?.error || err?.response?.data?.message;
      if (
        typeof apiError === "string" &&
        /email/i.test(apiError) &&
        /(taken|exists|registered)/i.test(apiError)
      ) {
        setFieldError("email", "البريد الإلكتروني مستخدم بالفعل");
      } else {
        const safeMessage =
          typeof apiError === "string" ? apiError : errorMessage;
        setSubmitMessage(safeMessage);
        toast.error(safeMessage);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const messageText = typeof submitMessage === "string" ? submitMessage : "";
  const isSuccess =
    messageText.includes("بنجاح") || messageText.includes("successfully");

  const getPasswordStrength = (password) => {
    const checks = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[@$!%*?&]/.test(password),
      password.length >= 8,
    ];
    const score = checks.filter(Boolean).length;
    const percent = Math.min((score / 5) * 100, 100);
    let color = "bg-red-500";
    if (percent >= 80) color = "bg-green-600";
    else if (percent >= 60) color = "bg-green-500";
    else if (percent >= 40) color = "bg-yellow-500";
    else if (percent >= 20) color = "bg-orange-500";
    const labelMap = ["ضعيفة", "ضعيفة", "متوسطة", "جيدة", "قوية", "قوية"];
    const label = labelMap[score] || "";
    return { score, percent, color, label };
  };

  return (
    <div
      dir="rtl"
      className="flex items-center justify-center p-6 min-h-screen bg-gray-50 md:p-12"
    >
      <div className="mx-auto w-full max-w-[620px] bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#07074D]">
            إنشاء حساب
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            سجّل معلوماتك للبدء في رحلتك الرياضية
          </p>
        </div>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting, values }) => (
            <Form className="space-y-5">
              {/* Full Name */}
              <div className="mb-5">
                <label
                  htmlFor="name"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  الاسم
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="الاسم"
                    autoComplete="name"
                    className="pl-10 pr-6 py-6 text-[#374151]"
                  />
                  <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-5">
                <label
                  htmlFor="phone"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="مثال: 0551234567 أو +966551234567"
                    autoComplete="tel"
                    className="pl-10 pr-6 py-6 text-[#374151]"
                  />
                  <FiPhone className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Email Address */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  البريد الالكترونى
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="pl-10 pr-6 py-6 text-[#374151]"
                  />
                  <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="كلمة المرور"
                    autoComplete="new-password"
                    className="pl-10 pr-12 py-6 text-[#374151]"
                  />
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
                {values?.password ? (
                  <div className="mt-3">
                    {(() => {
                      const { percent, color, label } = getPasswordStrength(
                        values.password
                      );
                      return (
                        <div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-2 ${color}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            قوة كلمة المرور: {label}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : null}
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="تأكيد كلمة المرور"
                    autoComplete="new-password"
                    className="pl-10 pr-12 py-6 text-[#374151]"
                  />
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "إخفاء تأكيد كلمة المرور"
                        : "إظهار تأكيد كلمة المرور"
                    }
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                  className="w-full h-12 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center bg-[#07074D] text-white"
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
                      جاري التحقق
                    </div>
                  ) : (
                    "إنشاء حساب"
                  )}
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="mt-4 text-center">
                <Link
                  href="/signin"
                  className="text-[#07074d] hover:underline text-sm"
                >
                  تسجيل الدخول
                </Link>
              </div>

              {/* Success/Error Message */}
              {messageText && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
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
      </div>
    </div>
  );
}
