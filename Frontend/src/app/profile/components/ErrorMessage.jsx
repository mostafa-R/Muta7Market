"use client";
// components/common/ErrorMessage.jsx
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const ErrorMessage = ({ message }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t("common.error")}
        </h2>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#00183D]/90 transition-colors"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
