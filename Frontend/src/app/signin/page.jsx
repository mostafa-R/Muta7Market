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
// Helper Function to Handle Login Success
// -----------------------------------
const handleLoginSuccess = (responseData) => {
  try {
    // استخراج البيانات من الاستجابة
    const userData = responseData.data?.user || responseData.user;
    const token = responseData.data?.token || responseData.token;
    
    if (!userData || !token) {
      console.error("Invalid response structure:", responseData);
      throw new Error("بيانات غير صحيحة من السيرفر");
    }

    // تحضير بيانات المستخدم للحفظ
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
      // معالجة profileImage بشكل صحيح
      profileImage: userData.profileImage || null,
    };

    // حفظ البيانات في localStorage
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", token);
    
    // حفظ وقت انتهاء الجلسة (اختياري - 7 أيام مثلاً)
    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 7);
    localStorage.setItem("tokenExpiration", expirationTime.toISOString());

    console.log("Login successful, user data stored:", userToStore);
    
    return true;
  } catch (error) {
    console.error("Error handling login success:", error);
    return false;
  }
};

// -----------------------------------
// Main Component
// -----------------------------------
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      // التحقق من نجاح الاستجابة
      if (res.data && (res.data.success || res.data.data)) {
        // معالجة البيانات وحفظها
        const loginSuccessful = handleLoginSuccess(res.data);

        if (loginSuccessful) {
          toast.success("تم تسجيل الدخول بنجاح!");

          // تأخير قليل قبل التوجيه للسماح بظهور رسالة النجاح
          setTimeout(() => {
            // استخدام window.location للتأكد من إعادة تحميل الصفحة بالكامل
            window.location.href = "/";
          }, 500);
        } else {
          throw new Error("فشل في معالجة بيانات تسجيل الدخول");
        }
      } else {
        throw new Error("استجابة غير صحيحة من السيرفر");
      }
    } catch (error) {
      console.error("Login Error:", error);

      // معالجة الأخطاء المختلفة
      if (error.response) {
        const { status, data } = error.response;

        // معالجة حالات الخطأ المختلفة
        switch (status) {
          case 400:
            // خطأ في البيانات المدخلة
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, errorMessage]) => {
                setFieldError(field, errorMessage);
              });
            } else {
              setStatus(data.message || "البيانات المدخلة غير صحيحة");
              toast.error(data.message || "البيانات المدخلة غير صحيحة");
            }
            break;

          case 401:
            // بيانات الدخول غير صحيحة
            setStatus("البريد الإلكتروني أو كلمة المرور غير صحيحة");
            toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
            break;

          case 403:
            // الحساب محظور أو غير مفعل
            setStatus(data.message || "الحساب غير مفعل أو محظور");
            toast.error(data.message || "الحساب غير مفعل أو محظور");
            break;

          case 404:
            // المستخدم غير موجود
            setStatus("لا يوجد حساب بهذا البريد الإلكتروني");
            toast.error("لا يوجد حساب بهذا البريد الإلكتروني");
            break;

          case 429:
            // محاولات كثيرة
            setStatus("محاولات كثيرة، يرجى المحاولة لاحقاً");
            toast.error("محاولات كثيرة، يرجى المحاولة لاحقاً");
            break;

          case 500:
          case 502:
          case 503:
            // خطأ في السيرفر
            setStatus("حدث خطأ في السيرفر، يرجى المحاولة لاحقاً");
            toast.error("حدث خطأ في السيرفر، يرجى المحاولة لاحقاً");
            break;

          default:
            setStatus(data.message || "حدث خطأ غير متوقع");
            toast.error(data.message || "حدث خطأ غير متوقع");
        }
      } else if (error.request) {
        // لم يتم الحصول على استجابة من السيرفر
        setStatus("فشل في الاتصال بالخادم، تحقق من اتصالك بالإنترنت");
        toast.error("فشل في الاتصال بالخادم، تحقق من اتصالك بالإنترنت");
      } else {
        // خطأ آخر
        setStatus(error.message || "حدث خطأ غير متوقع");
        toast.error(error.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans-ar"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <FiLock className="text-3xl text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-3xl font-bold text-white">مرحباً بعودتك</h1>
            <p className="text-white/90 mt-2">سجل دخولك للمتابعة</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <Formik
              initialValues={initialValues}
              validate={validate}
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
                      البريد الإلكتروني
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
                        placeholder="example@email.com"
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
                      كلمة المرور
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
                        placeholder="••••••••"
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
                            ? "إخفاء كلمة المرور"
                            : "إظهار كلمة المرور"
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
                      نسيت كلمة المرور؟
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
                        جاري تسجيل الدخول...
                      </span>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">أو</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <span className="text-gray-600">ليس لديك حساب؟</span>{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors"
                    >
                      سجل الآن
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
            بتسجيل دخولك، فإنك توافق على{" "}
            <Link
              href="/terms"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              الشروط والأحكام
            </Link>{" "}
            و{" "}
            <Link
              href="/privacy"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
  