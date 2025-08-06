"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import Joi from "joi";
import Link from "next/link";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { useRouter } from "next/navigation";

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
    errorMessage:
      "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
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
    const messageKey = (detail.type.split(".")[1] ||
      "required") as keyof TranslationError;
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
  const router = useRouter();
  

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
      router.push("/");
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#07074D]">
            {translations[language].title}
          </h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-md border border-[#e0e0e0] py-2 px-4 text-base font-medium text-[#6B7280]"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <Formik
          initialValues={initialValues}
          validate={(values) => validate(values, language)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting }) => (
            <Form>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {translations[language].email}
                </label>
                <div className="relative">
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder={translations[language].placeholders.email}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
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
                  {translations[language].password}
                </label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder={translations[language].placeholders.password}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-12 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#6B7280] hover:text-[#6A64F1] focus:outline-none"
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
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                  className="hover:shadow-form w-full rounded-md bg-[hsl(var(--primary))] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                    </div>
                  ) : (
                    translations[language].submit
                  )}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="mt-4 text-center">
                <Link
                  href="/forgetpassword"
                  className="text-[#6A64F1] hover:underline text-sm"
                >
                  {translations[language].forgotPassword}
                </Link>

                <Link
                  href="/signup"
                  className="text-[#6A64F1] hover:underline text-sm mx-5"
                >
                  don't have an account?
                </Link>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    submitMessage.includes("بنجاح") ||
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
      </motion.div>
    </div>
  );
}
