"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

// -----------------------------------
// Joi Validation Schema
// -----------------------------------
const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "يرجى إدخال بريد إلكتروني صحيح",
      "string.empty": "البريد الإلكتروني مطلوب",
      "any.required": "البريد الإلكتروني مطلوب",
    }),
  password: Joi.string().required().min(8).messages({
    "string.empty": "كلمة المرور مطلوبة",
    "string.min": "كلمة المرور يجب أن تكون على الأقل 8 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
});

// -----------------------------------
// Validate Function
// -----------------------------------
const validate = (values) => {
  const { error } = loginSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

// -----------------------------------
// Component
// -----------------------------------
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

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
      email: values.email.toLowerCase(),
      password: values.password,
    };

    try {
      const res = await axios.post(API_URL, payload, { withCredentials: true });
      toast.success("تم تسجيل الدخول بنجاح!");
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");

      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      // router.push("/");
      window.location.href = "/";
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response && error.response.data) {
        const { message, errors } = error.response.data;
        if (errors) {
          Object.entries(errors).forEach(([field, errorMessage]) => {
            setFieldError(field, errorMessage);
          });
        } else {
          setStatus(message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
          toast.error(message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }
      } else if (error.request) {
        setStatus("فشل في الاتصال بالخادم");
        toast.error("فشل في الاتصال بالخادم");
      } else {
        setStatus("حدث خطأ غير متوقع");
        toast.error("حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white p-4 font-sans-ar"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h1>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <Formik
            initialValues={initialValues}
            validate={validate}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting: formikSubmitting, status }) => (
              <Form className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                      <FiMail className="text-gray-500" />
                    </div>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      placeholder="أدخل البريد الإلكتروني"
                      autoComplete="email"
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
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                      <FiLock className="text-gray-500" />
                    </div>
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="أدخل كلمة المرور"
                      autoComplete="current-password"
                      className="w-full rounded-md border border-gray-300 bg-white py-2 ps-10 pe-12 text-gray-700 focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none transition duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
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

                {/* General Error Message */}
                {status && (
                  <div className="p-3 rounded-md text-center text-sm bg-red-50 text-red-700">
                    {status}
                  </div>
                )}

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
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </button>
                </div>

                {/* Links */}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/signup"
                    className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    إنشاء حساب
                  </Link>

                  <Link
                    href="/forgetpassword"
                    className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
