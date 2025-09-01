"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";

const getLoginSchema = (t) =>
  Joi.object({
    email: Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .messages({
        "string.email": t("validation.emailInvalid"),
        "string.empty": t("validation.emailRequired"),
        "any.required": t("validation.emailRequired"),
      }),
    password: Joi.string()
      .required()
      .min(8)
      .messages({
        "string.empty": t("validation.passwordRequired"),
        "string.min": t("validation.passwordMinLength"),
        "any.required": t("validation.passwordRequired"),
      }),
  });

const getValidate = (t) => (values) => {
  const loginSchema = getLoginSchema(t);
  const { error } = loginSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

const handleLoginSuccess = (responseData, t) => {
  try {
    const userData = responseData.data?.user || responseData.user;
    const token = responseData.data?.token || responseData.token;

    if (!userData || !token) {
      console.error("Invalid response structure:", responseData);
      throw new Error(t("auth.invalidServerData"));
    }

    const userToStore = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      role: userData.role,
      bio: userData.bio || "",
      isEmailVerified: userData.isEmailVerified || false,
      isPhoneVerified: userData.isPhoneVerified || false,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLogin: userData.lastLogin || new Date().toISOString(),
      profileImage: userData.profileImage || null,
    };

    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", token);

    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 7);
    localStorage.setItem("tokenExpiration", expirationTime.toISOString());

    return true;
  } catch (error) {
    console.error("Error handling login success:", error);
    return false;
  }
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const initialValues = {
    email: "",
    password: "",
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, setStatus }
  ) => {
    setIsSubmitting(true);
    setStatus(null);

    const payload = {
      email: values.email.toLowerCase().trim(),
      password: values.password,
    };

    try {
      const res = await axios.post(API_URL, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data && (res.data.success || res.data.data)) {
        const loginSuccessful = handleLoginSuccess(res.data, t);

        if (loginSuccessful) {
          toast.success(t("auth.loginSuccess"));

          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        } else {
          throw new Error(t("auth.loginDataProcessingFailed"));
        }
      } else {
        throw new Error(t("auth.invalidServerResponse"));
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, errorMessage]) => {
                setFieldError(field, errorMessage);
              });
            } else {
              setStatus(data.message || t("auth.invalidInputData"));
              toast.error(data.message || t("auth.invalidInputData"));
            }
            break;

          case 401:
            setStatus(t("auth.invalidCredentials"));
            toast.error(t("auth.invalidCredentials"));
            break;

          case 403:
            setStatus(data.message || t("auth.accountBlocked"));
            toast.error(data.message || t("auth.accountBlocked"));
            break;

          case 404:
            setStatus(t("auth.userNotFound"));
            toast.error(t("auth.userNotFound"));
            break;

          case 429:
            setStatus(t("auth.tooManyAttempts"));
            toast.error(t("auth.tooManyAttempts"));
            break;

          case 500:
          case 502:
          case 503:
            setStatus(t("auth.serverError"));
            toast.error(t("auth.serverError"));
            break;

          default:
            setStatus(data.message || t("auth.unexpectedError"));
            toast.error(data.message || t("auth.unexpectedError"));
        }
      } else if (error.request) {
        setStatus(t("auth.connectionFailed"));
        toast.error(t("auth.connectionFailed"));
      } else {
        setStatus(error.message || t("auth.unexpectedError"));
        toast.error(error.message || t("auth.unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans-ar"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <FiLock className="text-3xl text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {t("auth.welcomeBack")}
            </h1>
            <p className="text-white/90 mt-2">{t("auth.loginToContinue")}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <Formik
              initialValues={initialValues}
              validate={getValidate(t)}
              onSubmit={handleSubmit}
            >
              {({
                isSubmitting: formikSubmitting,
                status,
                errors,
                touched,
              }) => (
                <Form className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                        <FiMail
                          className={`text-gray-400 ${
                            errors.email && touched.email ? "text-red-400" : ""
                          }`}
                        />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        placeholder={t("auth.emailPlaceholder")}
                        autoComplete="email"
                        className={`w-full rounded-lg border ${
                          errors.email && touched.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                        } bg-white py-3 ps-10 pe-4 text-gray-700 focus:ring-2 outline-none transition duration-200`}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1 flex items-center"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                        <FiLock
                          className={`text-gray-400 ${
                            errors.password && touched.password
                              ? "text-red-400"
                              : ""
                          }`}
                        />
                      </div>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder={t("auth.passwordPlaceholder")}
                        autoComplete="current-password"
                        className={`w-full rounded-lg border ${
                          errors.password && touched.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                        } bg-white py-3 ps-10 pe-12 text-gray-700 focus:ring-2 outline-none transition duration-200`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        aria-label={
                          showPassword
                            ? t("auth.hidePassword")
                            : t("auth.showPassword")
                        }
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgetpassword"
                      className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 font-medium transition-colors"
                    >
                      {t("auth.forgotPassword")}
                    </Link>
                  </div>

                  {/* Error Message */}
                  {status && (
                    <div className="p-4 rounded-lg text-center text-sm bg-red-50 text-red-700 border border-red-200">
                      {status}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formikSubmitting || isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary))]/20 transition-all duration-200 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ms-1 me-3 h-5 w-5 text-white"
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
                        {t("auth.loggingIn")}
                      </span>
                    ) : (
                      t("auth.login")
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        {t("common.or")}
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <span className="text-gray-600">{t("auth.noAccount")}</span>{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors"
                    >
                      {t("auth.signUpNow")}
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t("auth.byLoggingIn")}{" "}
            <Link
              href="/terms"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              {t("common.termsAndConditions")}
            </Link>{" "}
            {t("common.and")}{" "}
            <Link
              href="/privacy"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              {t("common.privacyPolicy")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
