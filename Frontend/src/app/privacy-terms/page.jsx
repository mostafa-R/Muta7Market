"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import useContactInfoStore from "@/stores/contactInfoStore";
import { useEffect } from "react";
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
  const { contactInfo, fetchContactInfo, isLoading } = useContactInfoStore();

  useEffect(() => {
    fetchContactInfo();
  }, [fetchContactInfo]);

  const privacySections = [
    {
      icon: <FiUser className="w-6 h-6" />,
      title: isRTL ? "الخدمة والمسؤولية" : "Service and Responsibility",
      content: isRTL
        ? "الموقع يقدم خدمة الربط بين المستفيد (اللاعب أو المدرب أو الأخصائي) وبين الأندية في مختلف الدول دون أدنى مسؤولية على الشركة."
        : "The website provides a connection service between the beneficiary (player, coach, or specialist) and clubs in different countries without any liability on the company.",
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: isRTL ? "الرسوم والمدفوعات" : "Fees and Payments",
      content: isRTL
        ? "يدفع المستفيد (اللاعب أو المدرب أو الأخصائي) مبلغ 55 دولار امريكي لصالح الشركة غير مسترد لنشر المعلومات الخاصة به، كما يدفع المستخدم مبلغ 55 دولار امريكي غير مسترد للاستفادة من الموقع بالوصول لكافة المعلومات سواء الاتصال او السير الذاتية او المقاطع المرئية وما إلى ذلك."
        : "The beneficiary (player, coach, or specialist) pays a non-refundable fee of 55 USD to the company to publish their information. Users also pay a non-refundable fee of 55 USD to access all information including contacts, resumes, videos, etc.",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: isRTL ? "إخلاء المسؤولية" : "Disclaimer",
      content: isRTL
        ? 'يتم تقديم جميع المعلومات الواردة على الموقع الإلكتروني "كما هي"، أي بنفس الصورة التي حصلت عليها الشركة من المصدر. لا تقدم الشركة أي نوع من الضمانات (سواء صريحًا أو ضمنيًا) لمدى دقة وجودة المعلومات المقدمة، بما في ذلك الضمانات المتعلقة بالمعلومات ومدى دقتها، أو كفاءة اللاعب أو المدرب أو الأخصائي.'
        : 'All information on the website is provided "as is", exactly as received by the company from the source. The company provides no warranties (express or implied) regarding the accuracy and quality of the information provided, including warranties related to the information and its accuracy, or the competence of the player, coach, or specialist.',
    },
    {
      icon: <FiDatabase className="w-6 h-6" />,
      title: isRTL ? "دقة المعلومات" : "Information Accuracy",
      content: isRTL
        ? "يبذل الموقع أقصى جهوده للتأكد من جودة المعلومات المنشورة على الموقع الإلكتروني، ومن مدى دقتها وحداثتها. ومع ذلك، فإن الموقع لا يضمن بأي شكل من الأشكال صحة أو اكتمال أو دقة أو شمولية المعلومات أو المحتوى المنشور، ويحتفظ بحقه في تعديل أو تصحيح محتوى المعلومات والوثائق المنشورة في أي وقت ودون إشعار مسبق."
        : "The website makes every effort to ensure the quality, accuracy, and timeliness of information published. However, the website does not guarantee in any way the correctness, completeness, accuracy, or comprehensiveness of the published information or content, and reserves the right to modify or correct the content of information and documents published at any time without prior notice.",
    },
  ];

  const termsSections = [
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: isRTL ? "توفر الموقع" : "Website Availability",
      content: isRTL
        ? "تسعى الشركة لإتاحة موقعها الإلكتروني للمستخدمين على مدار الساعة (24 ساعة في اليوم، 7 أيام في الأسبوع). ومع ذلك، لا يمكن للشركة ضمان إتاحة الموقع الإلكتروني أو ضمان إمكانية الوصول إليه بصفة دائمة. تحتفظ الشركة بحقها في إلغاء أو تقييد أو تعليق أو المنع المؤقت للوصول إلى الموقع الإلكتروني (جزئيًا أو كليًا) في أي وقت ودون إشعار مسبق."
        : "The company strives to make its website available to users 24/7. However, the company cannot guarantee the website's availability or permanent accessibility. The company reserves the right to cancel, restrict, suspend, or temporarily prevent access to the website (partially or completely) at any time without prior notice.",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: isRTL ? "أمن البيانات" : "Data Security",
      content: isRTL
        ? "على الرغم من الوسائل المتقدمة التي تستخدمها الشركة ومقدمو الخدمات الفنية التابعون لها لضمان إتاحة الموقع وحماية البيانات، فإن الشركة تحرص على تحذير المستخدمين دائمًا من عدم موثوقية شبكة الإنترنت، خاصةً فيما يتعلق بأمان نقل البيانات، وسرعة نقل البيانات، وإمكانية نقل الفيروسات الإلكترونية."
        : "Despite the advanced means used by the company and its technical service providers to ensure website availability and data protection, the company is keen to always warn users about the unreliability of the internet, especially regarding data transfer security, data transfer speed, and the possibility of transmitting electronic viruses.",
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: isRTL ? "الانقطاع والأعطال" : "Interruptions and Malfunctions",
      content: isRTL
        ? "يتم التأكيد هنا بشكل صريح على احتمال وقوع أخطاء تتعلق بشبكة الإنترنت وأنظمة تكنولوجيا المعلومات والاتصالات، والتي قد تؤدي بدورها إلى حدوث بعض الانقطاعات والأعطال في الموقع الإلكتروني للشركة."
        : "It is explicitly confirmed here that there is a possibility of errors related to the internet and information and communication technology systems, which may in turn lead to some interruptions and malfunctions in the company's website.",
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: isRTL ? "الملكية الفكرية" : "Intellectual Property",
      content: isRTL
        ? "جميع أنواع المحتوى المتاحة على الموقع الإلكتروني تُعد ملكًا حصريًا للشركة، لذلك فهي محمية بموجب قوانين الملكية الفكرية المُطبقة. يُحظر حظرًا تامًا استخدام الموقع الإلكتروني أو أي مكون من مكوناته لأغراض تجارية، كما يُحظر نسخ أو توزيع أو إعادة إنتاج أو تعديل أو ترجمة أو نقل الموقع أو أي عنصر من عناصره بدون إذن خطي مسبق."
        : "All types of content available on the website are the exclusive property of the company and are protected by applicable intellectual property laws. It is strictly prohibited to use the website or any of its components for commercial purposes, as well as copy, distribute, reproduce, modify, translate, or transfer the website or any of its elements without prior written permission.",
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
              {isRTL ? "الشروط والأحكام" : "Terms and Conditions"}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {isRTL
                ? "شروط وأحكام استخدام منصة متاح ماركت للاعبين والمدربين"
                : "Terms and conditions for using Muta7Market platform for players and coaches"}
            </p>
            <p className="text-sm text-blue-200">
              {isRTL ? "آخر تحديث: يناير 2024" : "Last updated: January 2024"}
            </p>
          </div>
        </div>
      </div>

      {/* Service Terms Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {isRTL ? "شروط الخدمة" : "Service Terms"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isRTL
                ? "الشروط الأساسية لاستخدام منصتنا والاستفادة من خدماتنا"
                : "Basic terms for using our platform and benefiting from our services"}
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
                  {isRTL ? "حقوق النشر:" : "Copyright:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يشمل المحتوى المحمي النصوص والمعلومات ورسومات الجرافيكس والتصاميم والرسوم التوضيحية والصور الفوتوغرافية والأصوات والفيديوهات وهيكل الموقع وتصميمه وشعاراته."
                    : "Protected content includes text information, graphics, designs, illustrations, photographs, audio, video, website structure and design, and logos."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "الاستخدام المسموح:" : "Permitted Use:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يُسمح بالنسخ للاستخدام الشخصي فقط في حدود قوانين الملكية الفكرية. يُحظر النسخ أو التوزيع أو الترجمة أو النقل لأغراض تجارية."
                    : "Copying for personal use is allowed only within the limits of intellectual property laws. Copying, distribution, translation, or transfer for commercial purposes is prohibited."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRTL ? "طلبات الاستخدام:" : "Usage Requests:"}
                </h4>
                <p className="text-gray-600">
                  {isRTL
                    ? "يجب إرسال جميع طلبات تصريحات النسخ وإعادة الإنتاج لأي محتوى من محتويات الموقع إلى الشركة على عنوان البريد الإلكتروني الرسمي."
                    : "All requests for copying and reproduction permissions for any website content must be sent to the company at the official email address."}
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
