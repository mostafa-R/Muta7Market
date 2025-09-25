"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";

const getRegisterSchema = (t) =>
  Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        "string.empty": t("validation.nameRequired"),
        "string.min": t("validation.nameMinLength"),
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .required()
      .messages({
        "string.email": t("validation.emailInvalid"),
        "string.empty": t("validation.emailRequired"),
      }),
    phone: Joi.string()

      .required()
      .messages({
        "string.empty": t("validation.phoneRequired"),
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.min": t("validation.passwordMinLength"),
        "string.empty": t("validation.passwordRequired"),
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": t("validation.passwordsDoNotMatch"),
        "string.empty": t("validation.confirmPasswordRequired"),
      }),
  });

const getValidate = (t) => (values) => {
  const registerSchema = getRegisterSchema(t);
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
  const { t } = useTranslation();
  const { language } = useLanguage();

  const successMessage = t("auth.accountCreatedSuccessfully");
  const errorMessage = t("auth.accountCreationError");

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
        setFieldError("email", t("auth.emailAlreadyExists"));
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
    messageText.includes(t("common.success")) ||
    messageText.includes("successfully");

  const getPasswordStrength = (password) => {
    const checks = [password.length >= 8];

    const score = checks.filter(Boolean).length;
    const percent = Math.min((score / 5) * 100, 100);
    let color = "bg-red-500";
    if (percent >= 80) color = "bg-green-600";
    else if (percent >= 60) color = "bg-green-500";
    else if (percent >= 40) color = "bg-yellow-500";
    else if (percent >= 20) color = "bg-orange-500";
    const labelMap = [
      t("auth.passwordStrength.weak"),
      t("auth.passwordStrength.weak"),
      t("auth.passwordStrength.medium"),
      t("auth.passwordStrength.good"),
      t("auth.passwordStrength.strong"),
      t("auth.passwordStrength.strong"),
    ];
    const label = labelMap[score] || "";
    return { score, percent, color, label };
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex items-center justify-center p-6 min-h-screen bg-gray-50 md:p-12"
    >
      <div className="mx-auto w-full max-w-[620px] bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#07074D]">
            {t("auth.createAccount")}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {t("auth.registerYourInfo")}
          </p>
        </div>
        <Formik
          initialValues={initialValues}
          validate={getValidate(t)}
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
                  {t("auth.fullName")}
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="text"
                    name="name"
                    id="name"
                    placeholder={t("auth.fullName")}
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
                  {t("auth.phoneNumber")}
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder={t("auth.phonePlaceholder")}
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
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    id="email"
                    placeholder={t("auth.emailPlaceholder")}
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
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder={t("auth.password")}
                    autoComplete="new-password"
                    className="pl-10 pr-12 py-6 text-[#374151]"
                  />
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
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
                            {t("auth.passwordStrength.label")}: {label}
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
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder={t("auth.confirmPassword")}
                    autoComplete="new-password"
                    className="pl-10 pr-12 py-6 text-[#374151]"
                  />
                  <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6B7280]" />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? t("auth.hideConfirmPassword")
                        : t("auth.showConfirmPassword")
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
                      {t("auth.verifying")}
                    </div>
                  ) : (
                    t("auth.createAccount")
                  )}
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="mt-4 text-center">
                <Link
                  href="/signin"
                  className="text-[#07074d] hover:underline text-sm"
                >
                  {t("auth.signIn")}
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
