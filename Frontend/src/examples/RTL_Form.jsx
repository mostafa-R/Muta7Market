"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useDirection } from "@/hooks/use-direction";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * مثال لنموذج يدعم اللغة العربية (RTL) والإنجليزية (LTR)
 */
export default function RTLAwareForm() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const dir = useDirection();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // معالجة النموذج...
    alert(
      `Form submitted in ${isRTL ? "Arabic" : "English"} mode: ${JSON.stringify(
        formData
      )}`
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-card">
      <h2 className={`text-2xl font-semibold mb-4 ${dir.classes.textAlign}`}>
        {t("forms.contactUs")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل الاسم */}
        <div>
          <label
            htmlFor="name"
            className={`block mb-1 font-medium text-gray-700 ${dir.classes.textAlign}`}
          >
            {t("forms.namePlaceholder")}
            <span className="text-red-500 mx-1">*</span>
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${dir.classes.textAlign}`}
            placeholder={t("forms.namePlaceholder")}
            required
          />
        </div>

        {/* حقل البريد الإلكتروني */}
        <div>
          <label
            htmlFor="email"
            className={`block mb-1 font-medium text-gray-700 ${dir.classes.textAlign}`}
          >
            {t("forms.emailPlaceholder")}
            <span className="text-red-500 mx-1">*</span>
          </label>

          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${dir.classes.textAlign}`}
            placeholder={t("forms.emailPlaceholder")}
            required
          />
        </div>

        {/* حقل الرسالة */}
        <div>
          <label
            htmlFor="message"
            className={`block mb-1 font-medium text-gray-700 ${dir.classes.textAlign}`}
          >
            {t("forms.messagePlaceholder")}
            <span className="text-red-500 mx-1">*</span>
          </label>

          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${dir.classes.textAlign}`}
            placeholder={t("forms.messagePlaceholder")}
            rows={4}
            required
          />
        </div>

        {/* أزرار النموذج مع محاذاة حسب اتجاه اللغة */}
        <div className={`flex ${dir.classes.flexDirection} gap-3`}>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("forms.submitButton")}
          </button>

          <button
            type="reset"
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("forms.resetButton")}
          </button>
        </div>

        {/* نص المساعدة في الأسفل */}
        <p className={`text-xs text-gray-500 mt-2 ${dir.classes.textAlign}`}>
          {t("forms.requiredFieldsNote")}
        </p>
      </form>
    </div>
  );
}
