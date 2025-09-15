"use client";

import React from "react";
import {
  FiAward,
  FiGlobe,
  FiHeart,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";

/** ====== STATIC ABOUT DATA (your JSON) ====== */
const aboutData = {
  title: { ar: "من نحن", en: "About Us" },
  description: {
    ar: "نوفّر منصة عصرية تُسهّل إدارة المحتوى وتمنح المستخدمين تجربة سريعة وآمنة.",
    en: "We provide a modern platform that simplifies content management and delivers a fast, secure experience.",
  },
  list: [
    {
      title: { ar: "رسالتنا", en: "Our Mission" },
      description: {
        ar: "نساعد الأفراد والشركات على إنشاء تجربة رقمية عالية الجودة بأقل جهد.",
        en: "We help individuals and teams craft high-quality digital experiences with minimal effort.",
      },
      items: [
        {
          name: { ar: "التركيز على المستخدم", en: "User Focus" },
          description: {
            ar: "كل قرار تصميمي وتقني يبدأ من احتياجات المستخدم الفعلية.",
            en: "Every design and technical decision starts with real user needs.",
          },
          icon: "ph:user",
        },
        {
          name: { ar: "الأداء", en: "Performance" },
          description: {
            ar: "تحسين السرعة وتقليل وقت التحميل عبر أفضل الممارسات.",
            en: "Optimize speed and reduce load times through best practices.",
          },
          icon: "ph:rocket",
        },
        {
          name: { ar: "الأمان", en: "Security" },
          description: {
            ar: "حماية البيانات أولوية قصوى باستخدام ضوابط حديثة.",
            en: "Data protection is a top priority using modern controls.",
          },
          icon: "ph:shield-check",
        },
      ],
    },
    {
      title: { ar: "قيمنا", en: "Our Values" },
      description: {
        ar: "نعمل بشفافية، وبروح فريق، وبسعي دائم للابتكار.",
        en: "We operate with transparency, teamwork, and a constant drive to innovate.",
      },
      items: [
        {
          name: { ar: "الشفافية", en: "Transparency" },
          description: {
            ar: "نشارك المعلومة بوضوح ونوضح أسباب القرارات.",
            en: "We share information clearly and explain decisions.",
          },
          icon: "ph:globe",
        },
        {
          name: { ar: "التعاون", en: "Collaboration" },
          description: {
            ar: "ننجح معًا من خلال تبادل الخبرات واحترام الآراء.",
            en: "We succeed together by sharing expertise and respecting opinions.",
          },
          icon: "ph:users-three",
        },
        {
          name: { ar: "الابتكار", en: "Innovation" },
          description: {
            ar: "نبحث باستمرار عن حلول أكثر ذكاءً وبساطة.",
            en: "We continually seek smarter, simpler solutions.",
          },
          icon: "ph:sparkle",
        },
      ],
    },
  ],
};

/** ====== SVG helpers: render ONLY if icon is real <svg ...> markup ====== */
const isSvgMarkup = (s) => typeof s === "string" && s.trim().startsWith("<svg");
const prepareSvg = (svg) => {
  if (!isSvgMarkup(svg)) return null;
  if (/\sclass=/.test(svg) || /\s(width|height)=/.test(svg)) return svg;
  return svg.replace("<svg", '<svg width="24" height="24"');
};
function SvgIcon({ svg }) {
  if (!svg || !isSvgMarkup(svg)) return null;
  const clean = prepareSvg(svg);
  return (
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-6 mx-auto overflow-hidden">
      {/* sanitize with isomorphic-dompurify if you later inject untrusted SVG */}
      <span className="inline-block" dangerouslySetInnerHTML={{ __html: clean }} />
    </div>
  );
}

function AboutPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const langKey = isRTL ? "ar" : "en";

  const heroTitle = aboutData?.title?.[langKey] || (isRTL ? "من نحن" : "About Us");
  const heroDescription =
    aboutData?.description?.[langKey] ||
    (isRTL
      ? "نحن فريق شغوف بالرياضة، نسعى لربط اللاعبين والمدربين من جميع أنحاء العالم في منصة واحدة متطورة"
      : "We are a team passionate about sports, connecting players and coaches from around the world on one advanced platform");

  // Pull the two sections by their titles
  const missionSection =
    aboutData.list.find((s) => s?.title?.ar === "رسالتنا" || s?.title?.en === "Our Mission") ||
    null;
  const valuesSection =
    aboutData.list.find((s) => s?.title?.ar === "قيمنا" || s?.title?.en === "Our Values") || null;

  // Stats (kept static to match your current UI)
  const stats = [
    { number: "10,000+", label: isRTL ? "لاعب مسجل" : "Registered Players", icon: <FiUsers className="w-6 h-6" /> },
    { number: "500+", label: isRTL ? "مدرب معتمد" : "Certified Coaches", icon: <FiAward className="w-6 h-6" /> },
    { number: "50+", label: isRTL ? "نوع رياضة" : "Sports Types", icon: <FiTarget className="w-6 h-6" /> },
  ];

  // Fallback cards (only used if you want an extra section later)
  const valuesFallback = [
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: isRTL ? "الشغف بالرياضة" : "Passion for Sports",
      description: isRTL
        ? "نؤمن بقوة الرياضة في تغيير الحياة وبناء الشخصية"
        : "We believe in the power of sports to change lives and build character",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: isRTL ? "الثقة والأمان" : "Trust & Security",
      description: isRTL
        ? "نوفر بيئة آمنة وموثوقة لجميع المستخدمين"
        : "We provide a safe and trusted environment for all users",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: isRTL ? "المجتمع المتماسك" : "Strong Community",
      description: isRTL
        ? "نبني مجتمعًا رياضيًا متماسكًا يدعم بعضه البعض"
        : "We build a cohesive sports community that supports each other",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: isRTL ? "النمو المستمر" : "Continuous Growth",
      description: isRTL
        ? "نسعى للتطوير والتحسين المستمر في خدماتنا"
        : "We strive for continuous development and improvement in our services",
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
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {heroDescription}
            </p>
          </div>
        </div>
      </div>

      {/* >>> TWO-COLUMN SECTIONS: "رسالتنا" (left) AND "قيمنا الأساسية" (right) <<< */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: رسالتنا / Our Mission */}
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {missionSection?.title?.[langKey] || (isRTL ? "رسالتنا" : "Our Mission")}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {missionSection?.description?.[langKey] ||
                  (isRTL
                    ? "نعمل على توفير منصة آمنة ومتقدمة لعرض المواهب والخبرات والوصول إلى أفضل الفرص."
                    : "We provide a secure, advanced platform to showcase talents and access the best opportunities.")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(missionSection?.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 text-center"
                  >
                    {/* Show icon only if it's raw SVG */}
                    {isSvgMarkup(item?.icon) ? <SvgIcon svg={item.icon} /> : null}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item?.name?.[langKey]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item?.description?.[langKey]}
                    </p>
                  </div>
                ))}
                {!missionSection?.items?.length && (
                  <div className="col-span-full text-center text-gray-400">
                    {isRTL ? "لا توجد عناصر للعرض حالياً" : "No items to display yet."}
                  </div>
                )}
              </div>
            </section>

            {/* Right: قيمنا الأساسية / Our Values */}
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {/* Force the heading label to your requested wording "قيمنا الأساسية" */}
                {isRTL ? "قيمنا الأساسية" : "Our Core Values"}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {valuesSection?.description?.[langKey] ||
                  (isRTL
                    ? "القيم التي نؤمن بها وتوجه عملنا اليومي"
                    : "The values we believe in and that guide our daily work")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(valuesSection?.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 text-center"
                  >
                    {/* Show icon only if it's raw SVG */}
                    {isSvgMarkup(item?.icon) ? <SvgIcon svg={item.icon} /> : null}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item?.name?.[langKey]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item?.description?.[langKey]}
                    </p>
                  </div>
                ))}
                {!valuesSection?.items?.length && (
                  <div className="col-span-full text-center text-gray-400">
                    {isRTL ? "لا توجد عناصر للعرض حالياً" : "No items to display yet."}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Stats Section (kept) */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {isRTL ? "إنجازاتنا بالأرقام" : "Our Achievements in Numbers"}
            </h2>
          </div>
          <div className="flex items-center justify-around  gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section (kept) */}
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
              <p className="text-gray-300">{isRTL ? "المملكة العربية السعودية" : "Saudi Arabia"}</p>
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
