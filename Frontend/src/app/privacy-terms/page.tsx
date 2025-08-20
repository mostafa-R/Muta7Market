"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  FiDatabase,
  FiFileText,
  FiGlobe,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";

function PrivacyTermsPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const privacySections = [
    {
      icon: <FiDatabase className="w-6 h-6" />,
      title: isRTL ? "جمع البيانات" : "Data Collection",
      content: isRTL
        ? "نقوم بجمع المعلومات الشخصية التي تقدمها لنا عند التسجيل، إنشاء ملف شخصي، أو استخدام خدماتنا. هذا يشمل الاسم، البريد الإلكتروني، رقم الهاتف، والمعلومات الرياضية."
        : "We collect personal information you provide when registering, creating a profile, or using our services. This includes name, email, phone number, and sports information.",
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: isRTL ? "استخدام البيانات" : "Data Usage",
      content: isRTL
        ? "نستخدم بياناتك لتوفير خدماتنا، تحسين تجربتك، التواصل معك، وربطك بالأندية والمدربين. لا نبيع أو نشارك معلوماتك مع أطراف ثالثة دون موافقتك."
        : "We use your data to provide our services, improve your experience, communicate with you, and connect you with clubs and coaches. We don't sell or share your information with third parties without consent.",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: isRTL ? "حماية البيانات" : "Data Protection",
      content: isRTL
        ? "نستخدم تقنيات الأمان المتقدمة لحماية بياناتك الشخصية، بما في ذلك التشفير والخوادم الآمنة. يحق لك الوصول لبياناتك وتعديلها أو حذفها في أي وقت."
        : "We use advanced security technologies to protect your personal data, including encryption and secure servers. You have the right to access, modify, or delete your data anytime.",
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: isRTL ? "ملفات الارتباط" : "Cookies",
      content: isRTL
        ? "نستخدم ملفات الارتباط لتحسين أداء الموقع وتخصيص تجربتك. يمكنك إدارة تفضيلات ملفات الارتباط من خلال إعدادات المتصفح."
        : "We use cookies to improve website performance and personalize your experience. You can manage cookie preferences through your browser settings.",
    },
  ];

  const termsSections = [
    {
      icon: <FiUser className="w-6 h-6" />,
      title: isRTL ? "حساب المستخدم" : "User Account",
      content: isRTL
        ? "يجب أن تكون 15 عامًا على الأقل لإنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات حسابك وجميع الأنشطة التي تحدث تحت حسابك."
        : "You must be at least 15 years old to create an account. You are responsible for maintaining the confidentiality of your account data and all activities that occur under your account.",
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: isRTL ? "المحتوى المقبول" : "Acceptable Content",
      content: isRTL
        ? "يجب أن يكون المحتوى الذي تنشره دقيقًا وقانونيًا ولا ينتهك حقوق الآخرين. نحتفظ بالحق في إزالة أي محتوى غير مناسب أو مخالف لسياساتنا."
        : "Content you publish must be accurate, legal, and not violate others' rights. We reserve the right to remove any inappropriate content that violates our policies.",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: isRTL ? "المسؤوليات" : "Responsibilities",
      content: isRTL
        ? "نحن نوفر المنصة كخدمة، ولسنا مسؤولين عن التفاعلات المباشرة بين المستخدمين. ننصح بتوخي الحذر عند التعامل مع أطراف أخرى."
        : "We provide the platform as a service and are not responsible for direct interactions between users. We advise caution when dealing with other parties.",
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: isRTL ? "إنهاء الحساب" : "Account Termination",
      content: isRTL
        ? "يمكنك إنهاء حسابك في أي وقت. نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك شروط الاستخدام."
        : "You can terminate your account anytime. We reserve the right to suspend or terminate accounts that violate terms of use.",
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
              {isRTL ? "سياسة الخصوصية والشروط" : "Privacy Policy & Terms"}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {isRTL
                ? "نحن ملتزمون بحماية خصوصيتك وضمان شفافية كاملة في استخدام خدماتنا"
                : "We are committed to protecting your privacy and ensuring complete transparency in using our services"}
            </p>
            <p className="text-sm text-blue-200">
              {isRTL ? "آخر تحديث:  أغسطس 2025" : "Last updated: August 2025"}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isRTL
                ? "كيف نجمع ونستخدم ونحمي بياناتك الشخصية"
                : "How we collect, use, and protect your personal data"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {privacySections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Data Rights Section */}
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

      {/* Terms & Conditions Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isRTL
                ? "القواعد والإرشادات لاستخدام منصتنا"
                : "Rules and guidelines for using our platform"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {termsSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Terms */}
          <div className="bg-gray-100 rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {isRTL ? "أحكام إضافية" : "Additional Terms"}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "الملكية الفكرية:" : "Intellectual Property:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "جميع المحتويات والعلامات التجارية في الموقع محمية بحقوق الطبع والنشر."
                    : "All content and trademarks on the website are protected by copyright."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "تحديثات الشروط:" : "Terms Updates:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "نحتفظ بالحق في تحديث هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات مهمة."
                    : "We reserve the right to update these terms at any time. You will be notified of any important changes."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "القانون المطبق:" : "Applicable Law:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "تخضع هذه الشروط لقوانين المملكة العربية السعودية."
                    : "These terms are subject to the laws of the Kingdom of Saudi Arabia."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
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
              <p className="text-gray-300">legal@muta7market.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? "الهاتف" : "Phone"}
              </h3>
              <p className="text-gray-300">00966531540229</p>
              <p className="text-sm text-gray-400 mt-2">
                {isRTL ? "الاستفسارات القانونية" : "Legal inquiries"}
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
