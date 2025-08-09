"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import Joi from "joi";
import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

// Language types
type Language = "ar" | "en";

interface FormValues {
  otp: string;
}

// Translation object
const translations: Record<
  Language,
  {
    title: string;
    otp: string;
    submit: string;
    submitting: string;
    backToLogin: string;
    successMessage: string;
    errorMessage: string;
    placeholders: {
      otp: string;
    };
    errors: {
      otp: {
        required: string;
        pattern: string;
        [key: string]: string; // Add index signature
      };
    };
  }
> = {
  ar: {
    title: "إدخال رمز التحقق",
    otp: "رمز التحقق",
    submit: "إرسال",
    submitting: "جاري الإرسال...",
    backToLogin: "العودة إلى تسجيل الدخول",
    successMessage: "تم التحقق من الرمز بنجاح!",
    errorMessage: "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.",
    placeholders: {
      otp: "أدخل رمز التحقق (6 أرقام)",
    },
    errors: {
      otp: {
        required: "رمز التحقق مطلوب",
        pattern: "رمز التحقق يجب أن يكون 6 أرقام",
      },
    },
  },
  en: {
    title: "Enter Verification Code",
    otp: "Verification Code",
    submit: "Submit",
    submitting: "Submitting...",
    backToLogin: "Back to Login",
    successMessage: "Code verified successfully!",
    errorMessage: "Invalid verification code. Please try again.",
    placeholders: {
      otp: "Enter verification code (6 digits)",
    },
    errors: {
      otp: {
        required: "Verification code is required",
        pattern: "Verification code must be 6 digits",
      },
    },
  },
};

// Joi schema
const otpSchema = Joi.object({
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": translations.ar.errors.otp.required,
      "string.pattern.base": translations.ar.errors.otp.pattern,
    }),
});

// Joi to Formik validator
const validate = (values: FormValues, language: Language) => {
  const { error } = otpSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors: Partial<FormValues> = {};
  error.details.forEach((detail) => {
    const field = detail.path[0] as keyof FormValues;
    const messageKey = detail.type.split(".")[1] || "required";

    // Type-safe access to error messages
    const fieldErrors = translations[language].errors[field];
    if (fieldErrors && messageKey in fieldErrors) {
      errors[field] = fieldErrors[messageKey as keyof typeof fieldErrors];
    } else {
      errors[field] = detail.message;
    }
  });
  return errors;
};

// Component
export default function OTP() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const router = useRouter();

  const initialValues: FormValues = {
    otp: "",
  };

  const handleSubmit = async (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => {
    const { setSubmitting, resetForm, setFieldError } = formikHelpers;
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`,
        values,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSubmitMessage(translations[language].successMessage);
        resetForm();
        // Optional: Redirect to another page after successful verification
        router.push("/signin");
      } else {
        setFieldError("otp", translations[language].errorMessage);
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setSubmitMessage(translations[language].errorMessage);
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
        {/* <div className="flex justify-between items-center mb-8">
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
        </div> */}

        <Formik
          initialValues={initialValues}
          validate={(values) => validate(values, language)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting }) => (
            <Form>
              <div className="mb-5">
                <label
                  htmlFor="otp"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {translations[language].otp}
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="otp"
                    id="otp"
                    placeholder={translations[language].placeholders.otp}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                  className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

              <div className="mt-4 text-center">
                <Link
                  href="/signin"
                  className="text-[#6A64F1] hover:underline text-sm"
                >
                  {translations[language].backToLogin}
                </Link>
              </div>

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
