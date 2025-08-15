"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useDirection } from "@/hooks/use-direction";
import { ArrowLeft, ArrowRight, InfoIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Example component demonstrating RTL/LTR support features
 */
export default function DirectionExample() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const dir = useDirection();

  // Logical direction arrow based on current language direction
  const DirectionArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <InfoIcon className="w-5 h-5 text-blue-600" />
          {t("example.rtlDemo")}
        </h2>

        {/* Basic Text Direction Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.textDirection")}
          </h3>
          <p className={dir.classes.textAlign}>
            {t("example.textDirectionDescription")}
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-mono">
              {`className={dir.classes.textAlign}`}
            </p>
          </div>
        </div>

        {/* Flex Direction Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.flexDirection")}
          </h3>
          <div className={`flex ${dir.classes.flexDirection} gap-2 mb-2`}>
            <div className="bg-blue-100 p-3 rounded-md">1</div>
            <div className="bg-blue-200 p-3 rounded-md">2</div>
            <div className="bg-blue-300 p-3 rounded-md">3</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-mono">
              {`className={\`flex \${dir.classes.flexDirection} gap-2\`}`}
            </p>
          </div>
        </div>

        {/* Margins and Padding Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.marginsAndPadding")}
          </h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div
              className={`bg-white p-4 rounded-md ${dir.classes.marginStart4} w-3/4`}
            >
              {t("example.marginStart4")}
            </div>
            <div
              className={`bg-white p-4 rounded-md ${dir.classes.marginEnd4} w-3/4 mt-2`}
            >
              {t("example.marginEnd4")}
            </div>
            <div
              className={`bg-white ${dir.classes.paddingStart4} rounded-md mt-2`}
            >
              {t("example.paddingStart4")}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-mono">
              {`className={\`...\${dir.classes.marginStart4}\`}`}
            </p>
          </div>
        </div>

        {/* Border Radius Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.borderRadius")}
          </h3>
          <div className="flex gap-4">
            <div className={`bg-blue-100 p-4 ${dir.classes.roundedStart}`}>
              {t("example.roundedStart")}
            </div>
            <div className={`bg-blue-100 p-4 ${dir.classes.roundedEnd}`}>
              {t("example.roundedEnd")}
            </div>
          </div>
        </div>

        {/* Icon Direction Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.iconDirection")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DirectionArrow className="w-5 h-5 text-blue-600" />
              <span>{t("example.automaticIcon")}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight
                className={`w-5 h-5 text-blue-600 ${dir.classes.rotate180IfRtl}`}
              />
              <span>{t("example.manuallyRotatedIcon")}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Helper Functions */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.helperFunctions")}
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-1 font-medium">
                {t("example.conditionalValue")}
              </p>
              <p>
                {dir.helpers.getValueBasedOnDir(
                  "This appears in LTR mode",
                  "هذا يظهر في وضع RTL"
                )}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-1 font-medium">{t("example.sortedArray")}</p>
              <div className="flex gap-2">
                {dir.helpers.sortByDirection([1, 2, 3, 4]).map((item) => (
                  <div
                    key={item}
                    className="bg-blue-100 w-10 h-10 rounded flex items-center justify-center"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inline Style Example */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.inlineStyles")}
          </h3>
          <div className="space-y-3">
            <div style={dir.styles.textAlign}>
              {t("example.styledWithTextAlign")}
            </div>
            <div style={dir.styles.marginStart("2rem")}>
              {t("example.styledWithMarginStart")}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-mono">
              {`style={dir.styles.marginStart("2rem")}`}
            </p>
          </div>
        </div>

        {/* Language-specific content display */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t("example.languageSpecificContent")}
          </h3>
          <div className="space-y-3">
            <p className="en-only font-medium text-blue-600">
              This text is only visible in English
            </p>
            <p className="ar-only font-medium text-blue-600">
              هذا النص يظهر فقط باللغة العربية
            </p>
            <p className="text-sm text-gray-500">
              {t("example.currentLanguage")}: {language}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-mono">
              {'<p className="en-only">...</p>'}
            </p>
            <p className="text-blue-800 text-sm font-mono mt-2">
              {'<p className="ar-only">...</p>'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
