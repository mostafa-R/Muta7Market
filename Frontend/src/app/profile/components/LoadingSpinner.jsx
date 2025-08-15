// components/common/LoadingSpinner.jsx
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const LoadingSpinner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-[#00183D]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-user text-purple-600 text-2xl"></i>
          </div>
        </div>
        <p className="mt-4 text-gray-600 text-lg">{t("common.loading")}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
