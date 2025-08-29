"use client";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Joi from "joi";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Import components with fallbacks in case they don't exist
let Checkbox, Input, Label, Button, ChevronLeftIcon, EyeCloseIcon, EyeIcon;

try {
  Checkbox = require("@/components/form/input/Checkbox").default;
} catch {
  Checkbox = ({ checked, onChange, disabled, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      {...props}
    />
  );
}

try {
  Input = require("@/components/form/input/InputField").default;
} catch {
  Input = (props) => (
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      {...props}
    />
  );
}

try {
  Label = require("@/components/form/Label").default;
} catch {
  Label = ({ children, ...props }) => (
    <label
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      {...props}
    >
      {children}
    </label>
  );
}

try {
  const ButtonModule = require("@/components/ui/button/button");
  Button = ButtonModule.Button || ButtonModule.default;
} catch {
  Button = ({ children, className = "", size = "sm", disabled = false, ...props }) => (
    <button
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

try {
  const IconsModule = require("@/icons");
  ChevronLeftIcon = IconsModule.ChevronLeftIcon || (() => <span>←</span>);
  EyeCloseIcon = IconsModule.EyeCloseIcon || (() => <span>👁️‍🗨️</span>);
  EyeIcon = IconsModule.EyeIcon || (() => <span>👁️</span>);
} catch {
  ChevronLeftIcon = () => <span className="mr-1">←</span>;
  EyeCloseIcon = ({ className }) => <span className={className}>👁️‍🗨️</span>;
  EyeIcon = ({ className }) => <span className={className}>👁️</span>;
}

// Joi validation schema (matching backend schema)
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    }),
  password: Joi.string()
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number, and one special character (@$!%?&)",
      "string.empty": "Password is required",
    }),
});

// Formik validation function using Joi
const validate = (values) => {
  const errors = {};
  const { error } = loginSchema.validate(values, { abortEarly: false });

  if (error) {
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
  }

  return errors;
};

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  return (


    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
      
            
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            {serverError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
                {serverError}
              </div>
            )}

            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validate={validate}
              onSubmit={async (values, { setSubmitting }) => {
                setServerError("");
                try {
                  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
                

                  const response = await axios.post(
                    apiUrl,
                    {
                      email: values.email.toLowerCase().trim(),
                      password: values.password,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                      withCredentials: true, // Include cookies in the request
                    }
                  );

                 

                  if (response.status === 200 && response.data.data?.token) {
                    login(response.data.data.user, response.data.data.token);

                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectPath = urlParams.get("redirect");

                    if (redirectPath) {
                      router.push(decodeURIComponent(redirectPath));
                    } else {
                      // تحديد المسار المناسب حسب نوع المستخدم
                      // تحديد المسار حسب نوع المستخدم
const userRole = response.data.data.user?.role;

if (userRole === "admin" || userRole === "super_admin") {
  router.push("/");
} else {
  // عرض رسالة خطأ للمستخدم العادي
  setServerError("You don't have admin privileges");
  // أو توجيهه لصفحة أخرى
  // router.push("/user-profile");
}
                    }
                  } else {
                    throw new Error(response.data.message || "Login failed");
                  }
                } catch (err) {
                  console.error("Login error:", err);
                  // Handle Axios-specific errors
                  const errorMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error.message ||
                    "An error occurred during login";
                  setServerError(errorMessage);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Email <span className="text-error-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        type="email"
                        name="email"
                        placeholder="info@gmail.com"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <Label>
                        Password <span className="text-error-500">*</span>
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                          )}
                        </span>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <Button
                        type="submit"
                        className="w-full bg-[#07047d] text-white"
                        size="sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}