"use client";
// components/common/ConfirmModal.jsx
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiXCircle,
} from "react-icons/fi";

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
  success = null,
  type = "confirm",
  confirmText,
  cancelText,
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
  validationErrors = null,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);

  const defaultConfirmText = confirmText || t("common.confirm");
  const defaultCancelText = cancelText || t("common.cancel");

  useEffect(() => {
    if (autoClose && success) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, success, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleConfirm = async () => {
    if (!isLoading) {
      await onConfirm();
    }
  };

  const getIcon = () => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case "warning":
        return <FiAlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "error":
        return <FiXCircle className={`${iconClass} text-red-500`} />;
      case "success":
        return <FiCheckCircle className={`${iconClass} text-green-500`} />;
      case "info":
        return <FiInfo className={`${iconClass} text-blue-500`} />;
      default:
        return <FiAlertCircle className={`${iconClass} text-[#00183D]`} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          button: "bg-yellow-500 hover:bg-yellow-600",
          text: "text-yellow-800",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          button: "bg-red-500 hover:bg-red-600",
          text: "text-red-800",
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          button: "bg-green-500 hover:bg-green-600",
          text: "text-green-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          button: "bg-blue-500 hover:bg-blue-600",
          text: "text-blue-800",
        };
      default:
        return {
          bg: "bg-white",
          border: "border-gray-200",
          button: "bg-[#00183D] hover:bg-[#001a3d]",
          text: "text-gray-800",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md
          transform transition-all duration-300
          ${
            isClosing
              ? "scale-95 opacity-0"
              : "scale-100 opacity-100 animate-fadeIn"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && !isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("common.close")}
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* Header with Icon */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`p-2 rounded-full ${colors.bg} ${colors.border} border`}
          >
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6 mr-11">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Validation Errors from API */}
        {validationErrors && Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-semibold text-red-800 mb-2">
              {t("profile.pleaseCorrectErrors")}
            </h4>
            <ul className="space-y-1">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li
                  key={field}
                  className="text-sm text-red-600 flex items-start gap-2"
                >
                  <span className="text-red-400 mt-0.5">•</span>
                  <div>
                    <span className="font-medium">{field}:</span> {error}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General Error Message */}
        {error && !validationErrors && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <FiXCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!success && (
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                ${
                  isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95"
                }
              `}
            >
              {defaultCancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : `${colors.button} active:scale-95`
                }
                flex items-center justify-center gap-2
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>{t("common.processing")}</span>
                </>
              ) : (
                defaultConfirmText
              )}
            </button>
          </div>
        )}

        {/* Success Actions */}
        {success && (
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all active:scale-95 font-medium"
            >
              {t("common.ok")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;
