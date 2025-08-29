
const ContactInformationStep = ({ 
  formData, 
  handleInputChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="bg-orange-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">معلومات التواصل</h2>
      </div>
      
      {/* Social Links */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">روابط التواصل الاجتماعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إنستجرام
            </label>
            <input
              type="url"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://instagram.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تويتر
            </label>
            <input
              type="url"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              واتساب
            </label>
            <input
              type="tel"
              name="socialLinks.whatsapp"
              value={formData.socialLinks.whatsapp}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="05xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              يوتيوب
            </label>
            <input
              type="url"
              name="socialLinks.youtube"
              value={formData.socialLinks.youtube}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://youtube.com/channel"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات التواصل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني للتواصل
            </label>
            <input
              type="email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contact@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف للتواصل
            </label>
            <input
              type="tel"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>
      </div>

      {/* Agent Information */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الوكيل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الوكيل
            </label>
            <input
              type="text"
              name="contactInfo.agent.name"
              value={formData.contactInfo.agent.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="اسم الوكيل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم هاتف الوكيل
            </label>
            <input
              type="tel"
              name="contactInfo.agent.phone"
              value={formData.contactInfo.agent.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="05xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بريد الوكيل الإلكتروني
            </label>
            <input
              type="email"
              name="contactInfo.agent.email"
              value={formData.contactInfo.agent.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="agent@email.com"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">الإعدادات</h3>
        <div className="flex items-center space-x-6 space-x-reverse">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isListed"
              checked={formData.isListed}
              onChange={handleInputChange}
              className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 ml-5">مدرج في القوائم</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="playerIsActive"
              checked={formData.playerIsActive}
              onChange={handleInputChange}
              className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">الملف الشخصي نشط</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ContactInformationStep;
