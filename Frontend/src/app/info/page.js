"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiAward,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";

/** SVG helpers: render ONLY if icon is real <svg ...> markup */
const isSvgMarkup = (s) => typeof s === "string" && s.trim().startsWith("<svg");
const prepareSvg = (svg) => {
  if (!isSvgMarkup(svg)) return null;
  // add default size if none specified
  if (/\sclass=/.test(svg) || /\s(width|height)=/.test(svg)) return svg;
  return svg.replace("<svg", '<svg width="24" height="24"');
};
function SvgIcon({ svg }) {
  if (!svg || !isSvgMarkup(svg)) return null;
  const clean = prepareSvg(svg);
  return (
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-6 mx-auto overflow-hidden">
      {/* If needed, sanitize with isomorphic-dompurify before injecting */}
      <span
        className="inline-block"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}

function AboutPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const langKey = isRTL ? "ar" : "en";

  const [about, setAbout] = useState(null); // the first doc from API
  const [apiStats, setApiStats] = useState(null); // message totals (players/coaches/sports)
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Same-origin call to your API route
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/about`,
          {
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
          }
        );

        const payload = res.data;
        if (payload && payload.success === false) {
          throw new Error(
            (payload.error && payload.error.message) ||
              payload.message ||
              "Request failed"
          );
        }

        // Expected shape: { data: { data: [ doc ] }, message: {...}, success: true }
        const doc = Array.isArray(payload?.data?.data)
          ? payload.data.data[0]
          : Array.isArray(payload?.data)
          ? payload.data[0]
          : payload?.data || null;

        setAbout(doc || null);
        setApiStats(payload?.message || null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setErrorMsg(err?.message || "Failed to fetch About");
          setAbout(null);
          setApiStats(null);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  /** Derived pieces */
  const heroTitle = about?.title?.[langKey] || (isRTL ? "من نحن" : "About Us");
  const heroDescription =
    about?.description?.[langKey] ||
    (isRTL
      ? "نوفّر منصة عصرية تُسهّل إدارة المحتوى وتمنح المستخدمين تجربة سريعة وآمنة."
      : "We provide a modern platform that simplifies content management and delivers a fast, secure experience.");

  // Find the two sections by title
  const missionSection =
    about?.list?.find(
      (s) => s?.title?.ar === "رسالتنا" || s?.title?.en === "Our Mission"
    ) || null;

  const valuesSection =
    about?.list?.find(
      (s) => s?.title?.ar === "قيمنا" || s?.title?.en === "Our Values"
    ) || null;

  // Stats (prefer API totals; fallback to nice defaults)
  const stats = [
    {
      number:
        typeof apiStats?.totalPlayers === "number"
          ? `${apiStats.totalPlayers}+`
          : "10,000+",
      label: isRTL ? "لاعب مسجل" : "Registered Players",
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      number:
        typeof apiStats?.totalCoach === "number"
          ? `${apiStats.totalCoach}+`
          : "500+",
      label: isRTL ? "مدرب معتمد" : "Certified Coaches",
      icon: <FiAward className="w-6 h-6" />,
    },
    {
      number:
        typeof apiStats?.totalSports === "number"
          ? `${apiStats.totalSports}+`
          : "50+",
      label: isRTL ? "نوع رياضة" : "Sports Types",
      icon: <FiTarget className="w-6 h-6" />,
    },
    {
      number: "25+",
      label: isRTL ? "دولة" : "Countries",
      icon: <FiGlobe className="w-6 h-6" />,
    },
  ];

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
            <p className="text-xl sm:text-2xl text-blue-100 mb-4 max-w-4xl mx-auto leading-relaxed">
              {heroDescription}
            </p>
            {loading && (
              <p className="text-xs text-blue-200">
                {isRTL ? "جارٍ تحميل المحتوى…" : "Loading content…"}
              </p>
            )}
            {errorMsg && (
              <p className="text-xs text-red-200">
                {isRTL ? "تعذّر التحميل: " : "Failed to load: "}
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TWO-COLUMN: Mission (left) + Core Values (right) */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Mission */}
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {missionSection?.title?.[langKey] ||
                  (isRTL ? "رسالتنا" : "Our Mission")}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {missionSection?.description?.[langKey] ||
                  (isRTL
                    ? "نساعد الأفراد والشركات على إنشاء تجربة رقمية عالية الجودة بأقل جهد."
                    : "We help individuals and teams craft high-quality digital experiences with minimal effort.")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(missionSection?.items || []).map((item) => (
                  <div
                    key={item?._id || item?.name?.[langKey]}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 text-center"
                  >
                    {/* Only show icon if it is raw SVG */}
                    {isSvgMarkup(item?.icon) ? (
                      <SvgIcon svg={item.icon} />
                    ) : null}

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item?.name?.[langKey]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item?.description?.[langKey]}
                    </p>
                  </div>
                ))}
                {!missionSection?.items?.length && !loading && (
                  <div className="col-span-full text-center text-gray-400">
                    {isRTL
                      ? "لا توجد عناصر للعرض حالياً"
                      : "No items to display yet."}
                  </div>
                )}
              </div>
            </section>

            {/* Right: Core Values (from "قيمنا / Our Values") */}
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {isRTL ? "قيمنا الأساسية" : "Our Core Values"}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {valuesSection?.description?.[langKey] ||
                  (isRTL
                    ? "نعمل بشفافية، وبروح فريق، وبسعي دائم للابتكار."
                    : "We operate with transparency, teamwork, and a constant drive to innovate.")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(valuesSection?.items || []).map((item) => (
                  <div
                    key={item?._id || item?.name?.[langKey]}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 text-center"
                  >
                    {/* Only show icon if it is raw SVG */}
                    {isSvgMarkup(item?.icon) ? (
                      <SvgIcon svg={item.icon} />
                    ) : null}

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item?.name?.[langKey]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item?.description?.[langKey]}
                    </p>
                  </div>
                ))}
                {!valuesSection?.items?.length && !loading && (
                  <div className="col-span-full text-center text-gray-400">
                    {isRTL
                      ? "لا توجد عناصر للعرض حالياً"
                      : "No items to display yet."}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {isRTL ? "إنجازاتنا بالأرقام" : "Our Achievements in Numbers"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center min-w-[160px]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {isRTL ? "تواصل معنا" : "Get in Touch"}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {isRTL
                ? "نحن هنا لمساعدتك! تواصل معنا في أي وقت"
                : "We're here to help! Contact us anytime"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "البريد الإلكتروني" : "Email"}
              </h3>
              <p className="text-gray-300">info@muta7market.com</p>
              <p className="text-gray-300">support@muta7market.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "الهاتف" : "Phone"}
              </h3>
              <p className="text-gray-300">00966531540229</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "العنوان" : "Address"}
              </h3>
              <p className="text-gray-300">
                {isRTL ? "المملكة العربية السعودية" : "Saudi Arabia"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:info@muta7market.com"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <FiMail className="mr-2" />
                {isRTL ? "راسلنا" : "Email Us"}
              </a>
              <a
                href="/register-profile"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {isRTL ? "انضم إلينا" : "Join Us"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
