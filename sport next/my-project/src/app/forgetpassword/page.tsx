"use client";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import Joi from "joi";
import Link from "next/link";
import { useState } from "react";
import { FiMail } from "react-icons/fi";

// -----------------------------------
// Types
// -----------------------------------
interface FormValues {
  email: string;
}

interface TranslationError {
  required: string;
  email: string;
}

interface Translation {
  title: string;
  email: string;
  submit: string;
  submitting: string;
  backToLogin: string;
  successMessage: string;
  errorMessage: string;
  placeholders: {
    email: string;
  };
  errors: {
    email: TranslationError;
  };
}

type Language = "ar" | "en";

type Translations = {
  [key in Language]: Translation;
};

// -----------------------------------
// Language data
// -----------------------------------
const translations: Translations = {
  ar: {
    title: "إعادة تعيين كلمة المرور",
    email: "البريد الإلكتروني",
    submit: "Submit",
    submitting: "جاري الإرسال...",
    backToLogin: "العودة إلى تسجيل الدخول",
    successMessage: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني!",
    errorMessage: "البريد الإلكتروني غير مسجل. يرجى المحاولة مرة أخرى.",
    placeholders: {
      email: "أدخل البريد الإلكتروني",
    },
    errors: {
      email: {
        required: "البريد الإلكتروني مطلوب",
        email: "البريد الإلكتروني غير صحيح",
      },
    },
  },
  en: {
    title: "Reset Password",
    email: "Email Address",
    submit: "Submit",
    submitting: "Submitting...",
    backToLogin: "Back to Login",
    successMessage: "A reset link has been sent to your email!",
    errorMessage: "Email not registered. Please try again.",
    placeholders: {
      email: "Enter email address",
    },
    errors: {
      email: {
        required: "Email address is required",
        email: "Invalid email address",
      },
    },
  },
};

// -----------------------------------
// Joi validation schema
// -----------------------------------
const resetSchema = Joi.object<FormValues>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": translations.ar.errors.email.required,
      "string.email": translations.ar.errors.email.email,
    }),
});

// -----------------------------------
// Validate Function
// -----------------------------------
const validate = (
  values: FormValues,
  language: Language
): Partial<FormValues> => {
  const { error } = resetSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors: Partial<FormValues> = {};
  error.details.forEach((detail) => {
    const field = detail.path[0] as keyof FormValues;
    const messageKey = (detail.type.split(".")[1] ||
      "required") as keyof TranslationError;
    const fieldErrors = translations[language].errors[field];
    errors[field] = fieldErrors[messageKey] || detail.message;
  });
  return errors;
};

// -----------------------------------
// Email Check Function
// -----------------------------------
interface EmailCheckResult {
  exists: boolean;
  message?: string;
}

const checkEmailExists = async (email: string): Promise<EmailCheckResult> => {
  // Simulate API call
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  // Basic validation
  if (!email) {
    return {
      exists: false,
      message: "Email is required",
    };
  }

  // Simulate email check
  if (email.endsWith("@invalid.com")) {
    return {
      exists: false,
      message: "Email domain is not valid",
    };
  }

  // Simulate checking against a database
  const registeredEmails = [
    "user@example.com",
    "admin@example.com",
    "test@test.com",
  ];

  const exists = registeredEmails.includes(email.toLowerCase());

  return {
    exists,
    message: exists ? undefined : "Email not found in our records",
  };
};

// -----------------------------------
// Component
// -----------------------------------
export default function ForgotPassword() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const initialValues: FormValues = {
    email: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm, setFieldError }: FormikHelpers<FormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const result = await checkEmailExists(values.email);

      if (!result.exists) {
        setFieldError(
          "email",
          result.message || translations[language].errorMessage
        );
        throw new Error(result.message || "Email not found");
      }

      // Simulate sending reset email
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));

      console.log("Reset link sent to:", values.email);
      setSubmitMessage(translations[language].successMessage);
      resetForm();

      // In a real app, you might want to redirect or show additional instructions
      // setTimeout(() => {
      //   router.push('/login');
      // }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#07074D]">
            {translations[language].title}
          </h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-md border border-[#e0e0e0] py-2 px-4 text-base font-medium text-[#6B7280] focus:outline-none focus:border-[#6A64F1]"
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
              {/* Email Field */}
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
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md transition-all duration-200"
                  />
                  <FiMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={formikSubmitting || isSubmitting}
                 className="flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary)/0.9)] transition ml-auto mr-auto"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {translations[language].submitting}
                    </div>
                  ) : (
                    translations[language].submit
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <Link
                  href="/signin"
                  className="text-[#6A64F1] hover:underline text-sm transition-colors duration-200"
                >
                  {translations[language].backToLogin}
                </Link>
              </div>

              {/* Message */}
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-md text-center ${
                    submitMessage.includes("بنجاح") ||
                    submitMessage.includes("successfully")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {submitMessage}
                </motion.div>
              )}
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
}
