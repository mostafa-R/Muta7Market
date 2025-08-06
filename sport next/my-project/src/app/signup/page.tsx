"use client";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import Joi from "joi";
import { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";

// Types
type Language = "ar" | "en";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  area: string;
  city: string;
  state: string;
  postCode: string;
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
  date: string;
  time: string;
  area: string;
  city: string;
  state: string;
  postCode: string;
  password: string;
  confirmPassword: string;
  addressDetails: string;
  submit: string;
  submitting: string;
  successMessage: string;
  errorMessage: string;
  placeholders: {
    name: string;
    phone: string;
    email: string;
    area: string;
    city: string;
    state: string;
    postCode: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    name: TranslationError;
    phone: TranslationError;
    email: TranslationError;
    date: TranslationError;
    time: TranslationError;
    area: TranslationError;
    city: TranslationError;
    state: TranslationError;
    postCode: TranslationError;
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
    date: "التاريخ",
    time: "الوقت",
    area: "المنطقة",
    city: "المدينة",
    state: "المحافظة",
    postCode: "الكود البريدي",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    addressDetails: "تفاصيل العنوان",
    submit: "Submit",
    submitting: "جاري الإرسال...",
    successMessage: "تم إنشاء الحساب بنجاح!",
    errorMessage: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    placeholders: {
      name: "أدخل الاسم الكامل",
      phone: "أدخل رقم الهاتف",
      email: "أدخل البريد الإلكتروني",
      area: "أدخل المنطقة",
      city: "أدخل المدينة",
      state: "أدخل المحافظة",
      postCode: "أدخل الكود البريدي",
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
        pattern: "رقم الهاتف غير صحيح",
      },
      email: {
        required: "البريد الإلكتروني مطلوب",
        email: "البريد الإلكتروني غير صحيح",
        taken: "البريد الإلكتروني مستخدم بالفعل",
      },
      date: {
        required: "التاريخ مطلوب",
        min: "التاريخ يجب أن يكون في المستقبل",
        invalid: "تاريخ غير صحيح",
      },
      time: {
        required: "الوقت مطلوب",
        pattern: "صيغة الوقت غير صحيحة",
      },
      area: {
        required: "المنطقة مطلوبة",
        min: "المنطقة يجب أن تكون على الأقل حرفين",
      },
      city: {
        required: "المدينة مطلوبة",
        min: "المدينة يجب أن تكون على الأقل حرفين",
      },
      state: {
        required: "المحافظة مطلوبة",
        min: "المحافظة يجب أن تكون على الأقل حرفين",
      },
      postCode: {
        required: "الكود البريدي مطلوب",
        pattern: "الكود البريدي يجب أن يكون 5 أرقام",
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
    date: "Date",
    time: "Time",
    area: "Area",
    city: "City",
    state: "State",
    postCode: "Postal Code",
    password: "Password",
    confirmPassword: "Confirm Password",
    addressDetails: "Address Details",
    submit: "Submit",
    submitting: "Submitting...",
    successMessage: "Account created successfully!",
    errorMessage:
      "An error occurred while creating the account. Please try again.",
    placeholders: {
      name: "Enter full name",
      phone: "Enter phone number",
      email: "Enter email address",
      area: "Enter area",
      city: "Enter city",
      state: "Enter state",
      postCode: "Enter postal code",
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
        pattern: "Invalid phone number",
      },
      email: {
        required: "Email address is required",
        email: "Invalid email address",
        taken: "Email address is already taken",
      },
      date: {
        required: "Date is required",
        min: "Date must be in the future",
        invalid: "Invalid date",
      },
      time: {
        required: "Time is required",
        pattern: "Invalid time format",
      },
      area: {
        required: "Area is required",
        min: "Area must be at least 2 characters",
      },
      city: {
        required: "City is required",
        min: "City must be at least 2 characters",
      },
      state: {
        required: "State is required",
        min: "State must be at least 2 characters",
      },
      postCode: {
        required: "Postal code is required",
        pattern: "Postal code must be 5 digits",
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
  date: Joi.date().min("now").required(),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  area: Joi.string().min(2).required(),
  city: Joi.string().min(2).required(),
  state: Joi.string().min(2).required(),
  postCode: Joi.string()
    .pattern(/^[0-9]{5}$/)
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

// Simulated email check
const checkEmailAvailability = async (email: string): Promise<boolean> => {
  // Simulate API call to check if email is taken
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // For demo purposes, assume emails ending with '@taken.com' are already taken
  return !email.endsWith("@taken.com");
};

export default function SignUp() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const initialValues: FormValues = {
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    area: "",
    city: "",
    state: "",
    postCode: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm, setFieldError }: FormikHelpers<FormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Check email availability
      const isEmailAvailable = await checkEmailAvailability(values.email);
      if (!isEmailAvailable) {
        setFieldError("email", translations[language].errors.email.taken!);
        throw new Error("Email taken");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form submitted:", values);
      setSubmitMessage(translations[language].successMessage);
      resetForm();
    } catch (error) {
      setSubmitMessage(translations[language].errorMessage);
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

              {/* Date and Time */}
              <div className="-mx-3 flex flex-wrap">
                <div className="w-full px-3 sm:w-1/2">
                  <div className="mb-5">
                    <label
                      htmlFor="date"
                      className="mb-3 block text-base font-medium text-[#07074D]"
                    >
                      {translations[language].date}
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="date"
                        id="date"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                      <FiCalendar className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                    </div>
                    <ErrorMessage
                      name="date"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
                <div className="w-full px-3 sm:w-1/2">
                  <div className="mb-5">
                    <label
                      htmlFor="time"
                      className="mb-3 block text-base font-medium text-[#07074D]"
                    >
                      {translations[language].time}
                    </label>
                    <div className="relative">
                      <Field
                        type="time"
                        name="time"
                        id="time"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                      <FiClock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                    </div>
                    <ErrorMessage
                      name="time"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="mb-5 pt-3">
                <label className="mb-5 block text-base font-semibold text-[#07074D] sm:text-xl">
                  {translations[language].addressDetails}
                </label>
                <div className="-mx-3 flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <div className="relative">
                        <Field
                          type="text"
                          name="area"
                          id="area"
                          placeholder={translations[language].placeholders.area}
                          className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                        />
                        <FiMapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                      </div>
                      <ErrorMessage
                        name="area"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <div className="relative">
                        <Field
                          type="text"
                          name="city"
                          id="city"
                          placeholder={translations[language].placeholders.city}
                          className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                        />
                        <FiMapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                      </div>
                      <ErrorMessage
                        name="city"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <div className="relative">
                        <Field
                          type="text"
                          name="state"
                          id="state"
                          placeholder={
                            translations[language].placeholders.state
                          }
                          className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                        />
                        <FiMapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                      </div>
                      <ErrorMessage
                        name="state"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <div className="relative">
                        <Field
                          type="text"
                          name="postCode"
                          id="postCode"
                          placeholder={
                            translations[language].placeholders.postCode
                          }
                          className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                        />
                        <FiMapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
                      </div>
                      <ErrorMessage
                        name="postCode"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
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
