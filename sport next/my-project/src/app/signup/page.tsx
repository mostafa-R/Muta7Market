"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import Joi from "joi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

// Types
type Language = "ar" | "en";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface TranslationError {
  required: string;
  min?: string;
  max?: string;
  pattern?: string;
  email?: string;
  taken?: string;
  invalid?: string;
  match?: string;
}

interface Translation {
  title: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  successMessage: string;
  errorMessage: string;
  placeholders: {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    name: TranslationError;
    phone: TranslationError;
    email: TranslationError;
    password: TranslationError;
    confirmPassword: TranslationError;
  };
}

type Translations = {
  [key in Language]: Translation;
};

// Language data
const translations: Translations = {
  ar: {
    title: "إنشاء حساب",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    submit: "إرسال",
    submitting: "جاري الإرسال...",
    successMessage: "تم إنشاء الحساب بنجاح!",
    errorMessage: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    placeholders: {
      name: "أدخل الاسم الكامل",
      phone: "أدخل رقم الهاتف",
      email: "أدخل البريد الإلكتروني",
      password: "أدخل كلمة المرور",
      confirmPassword: "أدخل كلمة المرور مرة أخرى",
    },
    errors: {
      name: {
        required: "الاسم الكامل مطلوب",
        min: "الاسم يجب أن يكون على الأقل حرفين",
        max: "الاسم يجب أن يكون أقل من 50 حرف",
      },
      phone: {
        required: "رقم الهاتف مطلوب",
        pattern: "رقم الهاتف غير صحيح. الرجاء إدخال كود الدولة.",
      },
      email: {
        required: "البريد الإلكتروني مطلوب",
        email: "البريد الإلكتروني غير صحيح",
        taken: "البريد الإلكتروني مستخدم بالفعل",
      },
      password: {
        required: "كلمة المرور مطلوبة",
        min: "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
      },
      confirmPassword: {
        required: "تأكيد كلمة المرور مطلوب",
        match: "كلمة المرور غير متطابقة",
      },
    },
  },
  en: {
    title: "Create an Account",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    submit: "Submit",
    submitting: "Submitting...",
    successMessage: "Account created successfully!",
    errorMessage:
      "An error occurred while creating the account. Please try again.",
    placeholders: {
      name: "Enter full name",
      phone: "Enter phone number",
      email: "Enter email address",
      password: "Enter password",
      confirmPassword: "Confirm password",
    },
    errors: {
      name: {
        required: "Full name is required",
        min: "Name must be at least 2 characters",
        max: "Name must be less than 50 characters",
      },
      phone: {
        required: "Phone number is required",
        pattern: "Invalid phone number. You must insert country code.",
      },
      email: {
        required: "Email address is required",
        email: "Invalid email address",
        taken: "Email address is already taken",
      },
      password: {
        required: "Password is required",
        min: "Password must be at least 6 characters",
      },
      confirmPassword: {
        required: "Confirm password is required",
        match: "Passwords do not match",
      },
    },
  },
};

// Joi validation schema
const appointmentSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

// Convert Joi validation to Formik format
const validate = (
  values: FormValues,
  language: Language
): Partial<FormValues> => {
  const { error } = appointmentSchema.validate(values, { abortEarly: false });
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

export default function SignUp() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const router = useRouter();

  const initialValues: FormValues = {
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`;

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm, setFieldError }: FormikHelpers<FormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await axios.post(API_URL, values, {
        withCredentials: true,
      });

      const data = response.data;

      // Success Case
      setSubmitMessage(translations[language].successMessage);
      resetForm();
      router.push("/otp");
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.error === "Email already taken") {
          setFieldError("email", translations[language].errors.email.taken);
        } else {
          setSubmitMessage(data.error || translations[language].errorMessage);
        }
      } else {
        setSubmitMessage(translations[language].errorMessage);
      }
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
              {/* Full Name */}
              <div className="mb-5">
                <label
                  htmlFor="name"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {translations[language].name}
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    placeholder={translations[language].placeholders.name}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
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
                  {translations[language].phone}
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder={translations[language].placeholders.phone}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiPhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
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
                    type="password"
                    name="password"
                    id="password"
                    placeholder={translations[language].placeholders.password}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  {translations[language].confirmPassword}
                </label>
                <div className="relative">
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder={
                      translations[language].placeholders.confirmPassword
                    }
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
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

              {/* Success/Error Message */}
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
      </div>
    </div>
  );
}
