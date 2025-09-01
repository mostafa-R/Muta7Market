"use client";

export default function ContactInfoSection({ formData, handleInputChange }) {
  return (
    <>
      {/* Social Links Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-pink-50 rounded-xl">
            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2m-10 0V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">روابط التواصل الاجتماعي</h3>
            <p className="text-sm text-gray-500 mt-1">حسابات وسائل التواصل الاجتماعي</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              إنستجرام
            </label>
            <input
              type="url"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="https://instagram.com/username"
            />
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              تويتر
            </label>
            <input
              type="url"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="https://twitter.com/username"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              واتساب
            </label>
            <input
              type="tel"
              name="socialLinks.whatsapp"
              value={formData.socialLinks.whatsapp}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="05xxxxxxxx"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              يوتيوب
            </label>
            <input
              type="url"
              name="socialLinks.youtube"
              value={formData.socialLinks.youtube}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="https://youtube.com/channel"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-xl">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">معلومات التواصل</h3>
            <p className="text-sm text-gray-500 mt-1">بيانات الاتصال والوكيل</p>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              البريد الإلكتروني للتواصل
            </label>
            <input
              type="email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="contact@email.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              رقم الهاتف للتواصل
            </label>
            <input
              type="tel"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>

        {/* Agent Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            معلومات الوكيل
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                اسم الوكيل
              </label>
              <input
                type="text"
                name="contactInfo.agent.name"
                value={formData.contactInfo.agent.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                placeholder="اسم الوكيل"
              />
            </div>

            {/* Agent Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                رقم هاتف الوكيل
              </label>
              <input
                type="tel"
                name="contactInfo.agent.phone"
                value={formData.contactInfo.agent.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                placeholder="05xxxxxxxx"
              />
            </div>

            {/* Agent Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                بريد الوكيل الإلكتروني
              </label>
              <input
                type="email"
                name="contactInfo.agent.email"
                value={formData.contactInfo.agent.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                placeholder="agent@email.com"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
