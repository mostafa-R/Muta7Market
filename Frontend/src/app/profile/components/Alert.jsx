"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const Alert = ({ type = "info", message, onClose, className = "" }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const alertStyles = {
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: FaCheckCircle,
      iconColor: "text-green-500",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: FaExclamationCircle,
      iconColor: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: FaInfoCircle,
      iconColor: "text-blue-500",
    },
  };

  const style = alertStyles[type];
  const IconComponent = style.icon;

  return (
    <div
      className={`${style.bg} border rounded-lg p-4 mb-4 flex items-center justify-between ${className}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center">
        <IconComponent className={`${style.iconColor} ml-3 text-lg`} />
        <span className={`${style.text} text-sm font-medium`}>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity`}
          aria-label={t("common.close")}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
