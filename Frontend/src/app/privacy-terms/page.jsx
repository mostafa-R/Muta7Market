"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FiDatabase,
  FiFileText,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL &&
    process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")) ||
  "";

// ---- helpers for rendering raw SVG safely(ish)
const isSvgMarkup = (s) => typeof s === "string" && s.trim().startsWith("<svg");

function prepareSvg(svg) {
  // add minimal sizing if author didn’t include classes/size (optional)
  if (!isSvgMarkup(svg)) return null;
  // If there’s already a class/size, we don’t touch it.
  if (/\sclass=/.test(svg) || /\s(width|height)=/.test(svg)) return svg;
  return svg.replace("<svg", '<svg width="24" height="24"');
}

function SvgIcon({ svg }) {
  if (!svg || !isSvgMarkup(svg)) return null;
  const clean = prepareSvg(svg);
  return (
    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-6 overflow-hidden">
      {/* If you want sanitization, install `isomorphic-dompurify` and sanitize `clean` before injecting. */}
      <span
        className="inline-block"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}

function PrivacyTermsPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const langKey = isRTL ? "ar" : "en";

  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await axios.get(`${API_BASE}/terms`, {
          params: { page: 1, limit: 1 },
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        const payload = res.data;
        if (payload && payload.success === false) {
          throw new Error(
            (payload.error && payload.error.message) ||
              payload.message ||
              "Request failed"
          );
        }

        let doc = null;
        if (payload && payload.data) {
          if (Array.isArray(payload.data?.data)) {
            doc = payload.data.data[0] || null;
          } else if (Array.isArray(payload.data)) {
            doc = payload.data[0] || null;
          } else if (typeof payload.data === "object") {
            doc = payload.data;
          }
        }

        setTerm(doc);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setErrorMsg(err?.message || "Failed to fetch terms");
          setTerm(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // ----- map API data -> UI
  const apiSections = useMemo(() => {
    if (!term || !term.terms || !term.terms.length) return [];
    return term.terms.map((sec) => ({
      title: sec?.title?.[langKey],
      description: sec?.description?.[langKey],
      list:
        (sec?.list || []).map((it) => ({
          iconSvg: it?.icon || null, // raw SVG string expected here
          title: it?.title?.[langKey],
          content: it?.description?.[langKey],
        })) || [],
    }));
  }, [term, langKey]);

  // ----- fallbacks (no icons here to honor "only show if exists")
  const fallbackPrivacy = [
    {
      iconSvg: null,
      title: isRTL ? "الخدمة والمسؤولية" : "Service and Responsibility",
      content: isRTL
        ? "الموقع يقدم خدمة الربط بين المستفيد..."
        : "The website provides a connection service...",
    },
    {
      iconSvg: null,
      title: isRTL ? "الرسوم والمدفوعات" : "Fees and Payments",
      content: isRTL
        ? "يدفع المستفيد (اللاعب أو المدرب...)"
        : "The beneficiary pays a non-refundable fee...",
    },
    {
      iconSvg: null,
      title: isRTL ? "إخلاء المسؤولية" : "Disclaimer",
      content: isRTL
        ? 'يتم تقديم جميع المعلومات "كما هي"...'
        : 'All information is provided "as is"...',
    },
    {
      iconSvg: null,
      title: isRTL ? "دقة المعلومات" : "Information Accuracy",
      content: isRTL
        ? "يبذل الموقع أقصى جهوده..."
        : "The website makes every effort...",
    },
  ];

  const fallbackTerms = [
    {
      iconSvg: null,
      title: isRTL ? "توفر الموقع" : "Website Availability",
      content: isRTL
        ? "تسعى الشركة لإتاحة موقعها..."
        : "The company strives to make its website available...",
    },
    {
      iconSvg: null,
      title: isRTL ? "أمن البيانات" : "Data Security",
      content: isRTL
        ? "على الرغم من الوسائل المتقدمة..."
        : "Despite advanced means to ensure protection...",
    },
    {
      iconSvg: null,
      title: isRTL ? "الانقطاع والأعطال" : "Interruptions and Malfunctions",
      content: isRTL
        ? "احتمال وقوع أخطاء تتعلق بالشبكة..."
        : "Possibility of errors related to networks...",
    },
    {
      iconSvg: null,
      title: isRTL ? "الملكية الفكرية" : "Intellectual Property",
      content: isRTL
        ? "جميع أنواع المحتوى ملك حصري..."
        : "All content is the exclusive property...",
    },
  ];

  const privacySections = apiSections[0]?.list?.length
    ? apiSections[0].list
    : fallbackPrivacy;

  const termsSections = apiSections[1]?.list?.length
    ? apiSections[1].list
    : fallbackTerms;

  const heroTitle =
    term?.headTitle?.[langKey] ||
    (isRTL ? "الشروط والأحكام" : "Terms and Conditions");

  const heroDescription =
    term?.headDescription?.[langKey] ||
    (isRTL
      ? "شروط وأحكام استخدام منصة متاح ماركت للاعبين والمدربين"
      : "Terms and conditions for using Muta7Market platform for players and coaches");

  const serviceHeading =
    apiSections[0]?.title || (isRTL ? "شروط الخدمة" : "Service Terms");

  const termsHeading =
    apiSections[1]?.title || (isRTL ? "الشروط والأحكام" : "Terms & Conditions");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {heroDescription}
            </p>
            <p className="text-sm text-blue-200">
              {isRTL ? "آخر تحديث: يناير 2024" : "Last updated: January 2024"}
            </p>
            {loading && (
              <p className="text-xs text-blue-200 mt-2">
                {isRTL ? "جارٍ تحميل الشروط…" : "Loading terms…"}
              </p>
            )}
            {errorMsg && (
              <p className="text-xs text-red-200 mt-2">
                {isRTL ? "تعذّر تحميل الشروط: " : "Failed to load terms: "}
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Service Terms */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {serviceHeading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {apiSections[0]?.description ||
                (isRTL
                  ? "الشروط الأساسية لاستخدام منصتنا والاستفادة من خدماتنا"
                  : "Basic terms for using our platform and benefiting from our services")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {privacySections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
              >
                {/* only render icon if SVG exists */}
                {section.iconSvg && isSvgMarkup(section.iconSvg) ? (
                  <SvgIcon svg={section.iconSvg} />
                ) : null}

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Data Rights (static, kept) */}
          <div className="bg-blue-50 rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isRTL ? "حقوقك في البيانات" : "Your Data Rights"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "الوصول" : "Access"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isRTL ? "عرض بياناتك المحفوظة" : "View your stored data"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "التصحيح" : "Rectification"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isRTL ? "تحديث بياناتك" : "Update your data"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiLock className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "الحذف" : "Erasure"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isRTL ? "حذف بياناتك" : "Delete your data"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "النقل" : "Portability"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isRTL ? "تصدير بياناتك" : "Export your data"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {termsHeading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {apiSections[1]?.description ||
                (isRTL
                  ? "القواعد والإرشادات لاستخدام منصتنا"
                  : "Rules and guidelines for using our platform")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {termsSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
              >
                {/* only render icon if SVG exists */}
                {section.iconSvg && isSvgMarkup(section.iconSvg) ? (
                  <SvgIcon svg={section.iconSvg} />
                ) : null}

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Terms (static) */}
          <div className="bg-gray-100 rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {isRTL ? "أحكام إضافية" : "Additional Terms"}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "حقوق النشر:" : "Copyright:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يشمل المحتوى المحمي النصوص والمعلومات ورسومات الجرافيكس..."
                    : "Protected content includes text information, graphics, designs..."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "الاستخدام المسموح:" : "Permitted Use:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يُسمح بالنسخ للاستخدام الشخصي فقط..."
                    : "Copying for personal use is allowed only..."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "طلبات الاستخدام:" : "Usage Requests:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يجب إرسال جميع طلبات التصاريح..."
                    : "All permission requests must be sent to the official email."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact (static) */}
      <div className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {isRTL ? "هل لديك أسئلة؟" : "Have Questions?"}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {isRTL
                ? "تواصل معنا إذا كان لديك أي استفسارات حول سياسة الخصوصية أو الشروط والأحكام"
                : "Contact us if you have any questions about our privacy policy or terms and conditions"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "البريد الإلكتروني" : "Email"}
              </h3>
              <p className="text-gray-300">privacy@muta7market.com</p>
              <p className="text-gray-300">info@muta7market.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "الهاتف" : "Phone"}
              </h3>
              <p className="text-gray-300">+966 53 154 0229</p>
              <p className="text-sm text-gray-400 mt-2">
                {isRTL ? "للاستفسارات والدعم" : "For inquiries and support"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="mailto:privacy@muta7market.com"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
            >
              <FiMail className="mr-2" />
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyTermsPage;
