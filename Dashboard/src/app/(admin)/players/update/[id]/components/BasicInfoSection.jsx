"use client";

import { genderOptions, nationalities } from "../playerOptions";

export default function BasicInfoSection({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center space-x-3 space-x-reverse mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">المعلومات الأساسية</h2>
          <p className="text-sm text-gray-500 mt-1">البيانات الشخصية الأساسية للاعب</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الاسم الكامل
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            placeholder="أدخل الاسم الكامل"
            required
          />
        </div>

        {/* Age Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            العمر
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="15"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            placeholder="أدخل العمر"
            required
          />
        </div>

        {/* Gender Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الجنس
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            required
          >
            <option value="" disabled>اختر الجنس</option>
            {genderOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "male" ? "ذكر" : "أنثى"}
              </option>
            ))}
          </select>
        </div>

        {/* Nationality Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الجنسية
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            required
          >
            <option value="">اختر الجنسية</option>
            {nationalities.map((option) => (
              <option key={option.id} value={option.value}>
                {getNationalityLabel(option.value)}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Nationality Field - Conditional */}
        {showCustomFields.nationality && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              حدد الجنسية
            </label>
            <input
              type="text"
              name="customNationality"
              value={formData.customNationality}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="أدخل الجنسية"
            />
          </div>
        )}

        {/* Birth Country Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            بلد الولادة
          </label>
          <select
            name="birthCountry"
            value={formData.birthCountry}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
          >
            <option value="">اختر بلد الولادة</option>
            {nationalities.map((option) => (
              <option key={option.id} value={option.value}>
                {getNationalityLabel(option.value)}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Birth Country Field - Conditional */}
        {showCustomFields.birthCountry && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              حدد بلد الولادة
            </label>
            <input
              type="text"
              name="customBirthCountry"
              value={formData.customBirthCountry}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="أدخل بلد الولادة"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get nationality labels
function getNationalityLabel(value) {
  const labels = {
    "saudi": "السعودية",
    "uae": "الإمارات", 
    "egypt": "مصر",
    "morocco": "المغرب",
    "kuwait": "الكويت",
    "qatar": "قطر",
    "bahrain": "البحرين",
    "oman": "عُمان",
    "jordan": "الأردن",
    "lebanon": "لبنان",
    "syria": "سوريا",
    "iraq": "العراق",
    "libya": "ليبيا",
    "tunisia": "تونس",
    "algeria": "الجزائر",
    "sudan": "السودان",
    "yemen": "اليمن",
    "other": "أخرى"
  };
  
  return labels[value] || value;
}
