// "use client";

// import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
// import Joi from "joi";
// import { useState } from "react";
// import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// // -----------------------------------
// // Types
// // -----------------------------------
// type Language = "ar" | "en";

// interface FormValues {
//   newPassword: string;
//   confirmPassword: string;
// }

// interface TranslationError {
//   required: string;
//   min?: string;
//   match?: string;
// }

// interface Translation {
//   title: string;
//   newPassword: string;
//   confirmPassword: string;
//   submit: string;
//   submitting: string;
//   backToLogin: string;
//   successMessage: string;
//   errorMessage: string;
//   placeholders: {
//     newPassword: string;
//     confirmPassword: string;
//   };
//   errors: {
//     newPassword: TranslationError;
//     confirmPassword: TranslationError;
//   };
// }

// type Translations = {
//   [key in Language]: Translation;
// };

// // -----------------------------------
// // Language data
// // -----------------------------------
// const translations: Translations = {
//   ar: {
//     title: "إعادة تعيين كلمة المرور",
//     newPassword: "كلمة المرور الجديدة",
//     confirmPassword: "تأكيد كلمة المرور",
//     submit: "Submit",
//     submitting: "جاري الإرسال...",
//     backToLogin: "العودة إلى تسجيل الدخول",
//     successMessage: "تم إعادة تعيين كلمة المرور بنجاح!",
//     errorMessage: "حدث خطأ. يرجى المحاولة مرة أخرى.",
//     placeholders: {
//       newPassword: "أدخل كلمة المرور الجديدة",
//       confirmPassword: "أدخل تأكيد كلمة المرور",
//     },
//     errors: {
//       newPassword: {
//         required: "كلمة المرور الجديدة مطلوبة",
//         min: "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
//       },
//       confirmPassword: {
//         required: "تأكيد كلمة المرور مطلوب",
//         match: "تأكيد كلمة المرور لا يتطابق",
//       },
//     },
//   },
//   en: {
//     title: "Reset Password",
//     newPassword: "New Password",
//     confirmPassword: "Confirm Password",
//     submit: "Submit",
//     submitting: "Submitting...",
//     backToLogin: "Back to Login",
//     successMessage: "Password reset successfully!",
//     errorMessage: "An error occurred. Please try again.",
//     placeholders: {
//       newPassword: "Enter new password",
//       confirmPassword: "Enter confirm password",
//     },
//     errors: {
//       newPassword: {
//         required: "New password is required",
//         min: "Password must be at least 6 characters",
//       },
//       confirmPassword: {
//         required: "Confirm password is required",
//         match: "Confirm password does not match",
//       },
//     },
//   },
// };

// // -----------------------------------
// // Joi validation schema
// // -----------------------------------
// const resetSchema = Joi.object<FormValues>({
//   newPassword: Joi.string().min(6).required().messages({
//     "string.empty": translations.ar.errors.newPassword.required,
//     "string.min": translations.ar.errors.newPassword.min!,
//   }),
//   confirmPassword: Joi.string()
//     .valid(Joi.ref("newPassword"))
//     .required()
//     .messages({
//       "string.empty": translations.ar.errors.confirmPassword.required,
//       "any.only": translations.ar.errors.confirmPassword.match!,
//     }),
// });

// // -----------------------------------
// // Validate Function
// // -----------------------------------
// const validate = (
//   values: FormValues,
//   language: Language
// ): Partial<FormValues> => {
//   const { error } = resetSchema.validate(values, { abortEarly: false });
//   if (!error) return {};

//   const errors: Partial<FormValues> = {};
//   error.details.forEach((detail) => {
//     const field = detail.path[0] as keyof FormValues;
//     const messageKey =
//       detail.type === "any.only"
//         ? "match"
//         : ((detail.type.split(".")[1] || "required") as keyof TranslationError);

//     const fieldErrors = translations[language].errors[field];
//     errors[field] = fieldErrors[messageKey] || detail.message;
//   });

//   return errors;
// };

// // -----------------------------------
// // Reset Password Function
// // -----------------------------------
// interface ResetPasswordResult {
//   success: boolean;
//   message?: string;
// }

// const resetPassword = async (
//   newPassword: string,
//   token: string
// ): Promise<ResetPasswordResult> => {
//   // Simulate API call
//   await new Promise<void>((resolve) => setTimeout(resolve, 1000));

//   // Validate token
//   if (!token || token === "invalid") {
//     return {
//       success: false,
//       message: "Invalid or expired reset token",
//     };
//   }

//   // Validate password strength (example)
//   if (newPassword.length < 6) {
//     return {
//       success: false,
//       message: "Password is too weak",
//     };
//   }

//   // Simulate successful password reset
//   return {
//     success: true,
//     message: "Password has been reset successfully",
//   };
// };

// // -----------------------------------
// // Component
// // -----------------------------------
// export default function ResetPassword() {
//   const [language, setLanguage] = useState<Language>("ar");
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [submitMessage, setSubmitMessage] = useState<string>("");
//   const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState<boolean>(false);

//   // Get token from URL params (in real app)
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token") || "sample-token";

//   const initialValues: FormValues = {
//     newPassword: "",
//     confirmPassword: "",
//   };

//   const handleSubmit = async (
//     values: FormValues,
//     { setSubmitting, resetForm }: FormikHelpers<FormValues>
//   ): Promise<void> => {
//     setIsSubmitting(true);
//     setSubmitMessage("");

//     try {
//       const result = await resetPassword(values.newPassword, token);

//       if (!result.success) {
//         throw new Error(result.message || "Reset failed");
//       }

//       console.log("Password reset successful");
//       setSubmitMessage(translations[language].successMessage);
//       resetForm();

//       // Redirect to login after success (example)
//       // setTimeout(() => {
//       //   router.push('/login');
//       // }, 2000);
//     } catch (error) {
//       console.error("Reset password error:", error);
//       setSubmitMessage(translations[language].errorMessage);
//     } finally {
//       setIsSubmitting(false);
//       setSubmitting(false);
//     }
//   };

//   const formVariants = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
//   };

//   return (
//     <div
//       className="flex items-center justify-center p-12 min-h-screen bg-gray-50"
//       dir={language === "ar" ? "rtl" : "ltr"}
//     >
//       <motion.div
//         className="mx-auto w-full max-w-[550px] bg-white rounded-lg shadow-lg p-8"
//         variants={formVariants}
//         initial="initial"
//         animate="animate"
//         key={language}
//       >
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold text-[#07074D]">
//             {translations[language].title}
//           </h1>
//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value as Language)}
//             className="rounded-md border border-[#e0e0e0] py-2 px-4 text-base font-medium text-[#6B7280]"
//           >
//             <option value="ar">العربية</option>
//             <option value="en">English</option>
//           </select>
//         </div>

//         <Formik
//           initialValues={initialValues}
//           validate={(values) => validate(values, language)}
//           onSubmit={handleSubmit}
//         >
//           {({ isSubmitting: formikSubmitting }) => (
//             <Form>
//               {/* New Password */}
//               <div className="mb-5">
//                 <label
//                   htmlFor="newPassword"
//                   className="mb-3 block text-base font-medium text-[#07074D]"
//                 >
//                   {translations[language].newPassword}
//                 </label>
//                 <div className="relative">
//                   <Field
//                     type={showNewPassword ? "text" : "password"}
//                     name="newPassword"
//                     id="newPassword"
//                     placeholder={
//                       translations[language].placeholders.newPassword
//                     }
//                     className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-12 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
//                   />
//                   <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
//                   <button
//                     type="button"
//                     onClick={() => setShowNewPassword(!showNewPassword)}
//                     className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#6B7280] hover:text-[#6A64F1] focus:outline-none"
//                     aria-label={
//                       showNewPassword ? "Hide password" : "Show password"
//                     }
//                   >
//                     {showNewPassword ? <FiEyeOff /> : <FiEye />}
//                   </button>
//                 </div>
//                 <ErrorMessage
//                   name="newPassword"
//                   component="div"
//                   className="text-red-500 text-sm mt-1"
//                 />
//               </div>

//               {/* Confirm Password */}
//               <div className="mb-5">
//                 <label
//                   htmlFor="confirmPassword"
//                   className="mb-3 block text-base font-medium text-[#07074D]"
//                 >
//                   {translations[language].confirmPassword}
//                 </label>
//                 <div className="relative">
//                   <Field
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     id="confirmPassword"
//                     placeholder={
//                       translations[language].placeholders.confirmPassword
//                     }
//                     className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-10 pr-12 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
//                   />
//                   <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#6B7280]" />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#6B7280] hover:text-[#6A64F1] focus:outline-none"
//                     aria-label={
//                       showConfirmPassword ? "Hide password" : "Show password"
//                     }
//                   >
//                     {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
//                   </button>
//                 </div>
//                 <ErrorMessage
//                   name="confirmPassword"
//                   component="div"
//                   className="text-red-500 text-sm mt-1"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div>
//                 <button
//                   type="submit"
//                   disabled={formikSubmitting || isSubmitting}
//                   className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:bg-[#5a57d1]"
//                 >
//                   {isSubmitting ? (
//                     <div className="flex items-center">
//                       <svg
//                         className="animate-spin h-5 w-5 mr-2 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         />
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         />
//                       </svg>
//                       {translations[language].submitting}
//                     </div>
//                   ) : (
//                     translations[language].submit
//                   )}
//                 </button>
//               </div>

//               {/* Back to Login Link */}
//               <div className="mt-4 text-center">
//                 <Link
//                   href="/login"
//                   className="text-[#6A64F1] hover:underline text-sm transition-colors duration-200"
//                 >
//                   {translations[language].backToLogin}
//                 </Link>
//               </div>

//               {/* Success/Error Message */}
//               {submitMessage && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className={`mt-4 p-3 rounded-md text-center ${
//                     submitMessage.includes("بنجاح") ||
//                     submitMessage.includes("successfully")
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {submitMessage}
//                 </motion.div>
//               )}
//             </Form>
//           )}
//         </Formik>
//       </motion.div>
//     </div>
//   );
// }

"use client";





export default function ResetPassword() {
 
  return (
    <div className="min-h-screen bg-gray-100">
     <h1>Reset Password Page</h1>
    </div>
  );
}