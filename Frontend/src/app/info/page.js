"use client";

import { useEffect } from "react";
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
import useContactInfoStore from "../../stores/contactInfoStore";

function AboutPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { contactInfo, fetchContactInfo, isLoading } = useContactInfoStore();

  useEffect(() => {
    fetchContactInfo();
  }, [fetchContactInfo]);

  const values = [
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

  const stats = [
    {
      number: "10,000+",
      label: isRTL ? "لاعب مسجل" : "Registered Players",
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      number: "500+",
      label: isRTL ? "مدرب معتمد" : "Certified Coaches",
      icon: <FiAward className="w-6 h-6" />,
    },
    {
      number: "50+",
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {isRTL ? "من نحن" : "About Us"}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {isRTL
                ? "نحن فريق شغوف بالرياضة، نسعى لربط اللاعبين والمدربين من جميع أنحاء العالم في منصة واحدة متطورة"
                : "We are a team passionate about sports, connecting players and coaches from around the world on one advanced platform"}
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {isRTL ? "رؤيتنا" : "Our Vision"}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {isRTL
                  ? "أن نكون المنصة الرائدة عالمياً في ربط المواهب الرياضية بالفرص المناسبة، وبناء جسر من التواصل بين اللاعبين والمدربين والأندية الرياضية."
                  : "To be the world's leading platform for connecting sports talents with suitable opportunities, building a bridge of communication between players, coaches, and sports clubs."}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isRTL ? "مهمتنا" : "Our Mission"}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {isRTL
                  ? "نعمل على توفير منصة آمنة ومتطورة تتيح للاعبين عرض مواهبهم وللمدربين تقديم خبراتهم، مع ضمان الوصول إلى أفضل الفرص الرياضية المتاحة."
                  : "We work to provide a secure and advanced platform that allows players to showcase their talents and coaches to share their expertise, ensuring access to the best available sports opportunities."}
              </p>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-xl p-6 text-center">
                  <FiTarget className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">
                    {isRTL ? "الهدف" : "Goal"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL
                      ? "ربط المواهب بالفرص"
                      : "Connect talents with opportunities"}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-xl p-6 text-center">
                  <FiAward className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">
                    {isRTL ? "التميز" : "Excellence"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "أعلى معايير الجودة" : "Highest quality standards"}
                  </p>
                </div>
                <div className="bg-green-100 rounded-xl p-6 text-center">
                  <FiUsers className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">
                    {isRTL ? "المجتمع" : "Community"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL
                      ? "بناء شبكة رياضية قوية"
                      : "Building strong sports network"}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-xl p-6 text-center">
                  <FiGlobe className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">
                    {isRTL ? "العالمية" : "Global"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL
                      ? "وصول لجميع أنحاء العالم"
                      : "Worldwide accessibility"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {isRTL ? "إنجازاتنا بالأرقام" : "Our Achievements in Numbers"}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
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

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? "قيمنا الأساسية" : "Our Core Values"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isRTL
                ? "القيم التي نؤمن بها وتوجه عملنا اليومي"
                : "The values we believe in and that guide our daily work"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 text-center border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
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
              <p className="text-gray-300">{contactInfo.email}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "الهاتف" : "Phone"}
              </h3>
              <p className="text-gray-300">
                {contactInfo.phone.formatted || contactInfo.phone.primary}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "العنوان" : "Address"}
              </h3>
              <p className="text-gray-300">
                {isRTL ? contactInfo.address.ar : contactInfo.address.en}
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <FiMail className="mr-2 ml-2" />
                {isRTL ? "راسلنا" : "Email Us"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
