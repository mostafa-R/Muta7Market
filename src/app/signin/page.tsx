"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import Joi from "joi";
import Link from "next/link";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

// -----------------------------------
// Types
// -----------------------------------
interface LoginFormValues {
  email: string;
  password: string;
}

type Language = "ar" | "en";

interface TranslationError {
  required: string;
  email?: string;
  min?: string;
}

interface Translation {
  title: string;
  email: string;
  password: string;
  forgotPassword: string;
  submit: string;
  submitting: string;
  successMessage: string;
  errorMessage: string;
  placeholders: {
    email: string;
    password: string;
  };
  errors: {
    email: TranslationError;
    password: TranslationError;
  };
}

type Translations = {
  [key in Language]: Translation;
};

// -----------------------------------
// Translation object
// -----------------------------------
const translations: Translations = {
  ar: {
    title: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    submit: "تسجيل الدخول",
    submitting: "جاري الإرسال...",
    successMessage: "تم تسجيل الدخول بنجاح!",
    errorMessage: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    placeholders: {
      email: "أدخل البريد الإلكتروني",
      password: "أدخل كلمة المرور",
    },
    errors: {
      email: {
        required: "البريد الإلكتروني مطلوب",
        email: "البريد الإلكتروني غير صحيح",
      },
      password: {
        required: "كلمة المرور مطلوبة",
        min: "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
      },
    },
  },
  en: {
    title: "Login",
    email: "Email Address",
    password: "Password",
    forgotPassword: "Forgot Password?",
    submit: "Submit",
    submitting: "Submitting...",
    successMessage: "Logged in successfully!",
    errorMessage: "Incorrect email or password. Please try again.",
    placeholders: {
      email: "Enter email address",
      password: "Enter password",
    },
    errors: {
      email: {
        required: "Email address is required",
        email: "Invalid email address",
      },
      password: {
        required: "Password is required",
        min: "Password must be at least 6 characters",
      },
    },
  },
};

// -----------------------------------
// Joi Validation Schema
// -----------------------------------
const loginSchema = Joi.object<LoginFormValues>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": translations.ar.errors.email.required,
      "string.email": translations.ar.errors.email.email!,
    }),
  password: Joi.string().min(6).required().messages({
    "string.empty": translations.ar.errors.password.required,
    "string.min": translations.ar.errors.password.min!,
  }),
});

// -----------------------------------
// Validate Function
// -----------------------------------
const validate = (
  values: LoginFormValues,
  language: Language
): Partial<LoginFormValues> => {
  const { error } = loginSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors: Partial<LoginFormValues> = {};
  error.details.forEach((detail) => {
    const field = detail.path[0] as keyof LoginFormValues;
    const messageKey = (detail.type.split(".")[1] || "required") as keyof TranslationError;
    const fieldErrors = translations[language].errors[field];
    errors[field] = fieldErrors[messageKey] || detail.message;
  });
  return errors;
};

// -----------------------------------
// Component
// -----------------------------------
export default function Login() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, resetForm, setFieldError }: FormikHelpers<LoginFormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await axios.post(API_URL, values, {
        withCredentials: true,
      });

      setSubmitMessage(translations[language].successMessage);
      resetForm();
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login Error:", error);

      if (error.response && error.response.data) {
        const { message, errors } = error.response.data;

        if (errors) {
          Object.entries(errors).forEach(([field, errorMessage]) => {
            setFieldError(field, errorMessage as string);
          });
        } else {
          setSubmitMessage(message || translations[language].errorMessage);
        }
      } else {
        setSubmitMessage(translations[language].errorMessage);
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
      className={`flex items-center justify-center min-h-screen bg-white p-4 ${
        language === "ar" ? "font-sans-ar" : "font-sans-en"
      }`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        variants={formVariants}
        initial="initial"
        animate="animate"
        key={language}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {translations[language].title}
          </h1>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <Formik
            initialValues={initialValues}
            validate={(values) => validate(values, language)}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting: formikSubmitting }) => (
              <Form className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {translations[language].email}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                      <FiMail className="text-gray-500" />
                    </div>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      placeholder={translations[language].placeholders.email}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 ps-10 pe-4 text-gray-700 focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none transition duration-150"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {translations[language].password}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                      <FiLock className="text-gray-500" />
                    </div>
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder={translations[language].placeholders.password}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 ps-10 pe-12 text-gray-700 focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none transition duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formikSubmitting || isSubmitting}
                    className="w-full flex justify-center items-center py-2 px-4 rounded-md bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))] transition duration-150 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ms-1 me-2 h-4 w-4 text-white"
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
                        {translations[language].submitting}
                      </>
                    ) : (
                      translations[language].submit
                    )}
                  </button>
                </div>

                {/* Links */}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/signup"
                    className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    {language === "ar" ? "إنشاء حساب" : "Sign up"}
                  </Link>
                  
                  <Link
                    href="/forgetpassword"
                    className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    {translations[language].forgotPassword}
                  </Link>
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div
                    className={`p-3 rounded-md text-center text-sm mt-4 ${
                      submitMessage.includes("بنجاح") ||
                      submitMessage.includes("successfully")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </div>
  );
}