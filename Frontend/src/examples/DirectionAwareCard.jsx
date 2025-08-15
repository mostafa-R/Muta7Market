"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useDirection } from "@/hooks/use-direction";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * مثال لمكون يراعي اتجاه اللغة باستخدام أداة useDirection
 */
export default function DirectionAwareCard({ title, description, imageUrl }) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const dir = useDirection();

  // استخدام الأيقونة المناسبة حسب اتجاه اللغة
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card border border-gray-100">
      {/* استخدام فئات CSS حسب الاتجاه */}
      <div className={`flex ${dir.classes.flexDirection} items-center`}>
        {/* صورة المكون */}
        <div className="w-1/3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* محتوى المكون */}
        <div className="w-2/3 p-6">
          {/* محاذاة النص حسب اتجاه اللغة */}
          <h3 className={`text-xl font-semibold mb-2 ${dir.classes.textAlign}`}>
            {title || t("example.defaultTitle")}
          </h3>

          <p className={`text-gray-600 mb-4 ${dir.classes.textAlign}`}>
            {description || t("example.defaultDescription")}
          </p>

          {/* زر مع هامش مناسب حسب الاتجاه */}
          <div className={dir.classes.textAlign}>
            <button
              className={`inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors`}
            >
              {t("common.readMore")}
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* معلومات إضافية في الأسفل مع هوامش حسب الاتجاه */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div
          className={`flex ${dir.classes.flexDirection} justify-between items-center`}
        >
          <span className={`text-sm text-gray-500 ${dir.classes.marginEnd2}`}>
            {t("example.postedDate")}
          </span>

          <div className="flex items-center gap-2">
            {/* استخدام أنماط CSS المضمنة */}
            <span
              style={dir.styles.textAlign}
              className="text-sm text-blue-600"
            >
              {t("common.viewDetails")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
