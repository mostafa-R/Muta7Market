"use client";

import { statusOptions, useSportsData } from "../hooks/useSportsData";

export default function ProfessionalInfoSection({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) {
  const { 
    sportsOptions, 
    isLoading,
    formatObject,
  } = useSportsData();
  
  const selectedSport = sportsOptions.find(s => s.slug === formData.game?.slug);

  const availablePositions = selectedSport?.positions?.map(p => ({
    ...formatObject(p),
    id: p._id,
  })) || [];
  
  const availableRoleTypes = selectedSport?.roleTypes
    ?.filter(r => r.jop === formData.jop)
    .map(r => ({ ...formatObject(r), id: r._id })) || [];
  
  if (selectedSport && formData.jop === 'player') {
    availablePositions.push({ ar: "أخرى", en: "Other", slug: "other", id: "other" });
  }
  if (selectedSport && formData.jop) {
    availableRoleTypes.push({ ar: "أخرى", en: "Other", slug: "other", id: "other" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center space-x-3 space-x-reverse mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H10a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">المعلومات المهنية</h2>
          <p className="text-sm text-gray-500 mt-1">الوظيفة والرياضة والمركز والخبرة</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الوظيفة
          </label>
          <select
            name="jop"
            value={formData.jop}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            required
          >
            <option value="" disabled>اختر الوظيفة</option>
            <option value="player">لاعب</option>
            <option value="coach">مدرب</option>
          </select>
        </div>

        {/* Sport/Game */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الرياضة
          </label>
          <select
            name="game"
            value={formData.game?.slug || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={isLoading}
          >
            <option value="" disabled>
              {isLoading ? "جاري التحميل..." : "اختر الرياضة"}
            </option>
            {sportsOptions.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.ar}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Sport Field - Conditional */}
        {showCustomFields.sport && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              حدد الرياضة
            </label>
            <input
              type="text"
              name="customSport"
              value={formData.customSport}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="أدخل نوع الرياضة"
            />
          </div>
        )}

        {/* Role Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
           الفئة
          </label>
          <select
            name="roleType"
            value={formData.roleType?.slug || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isLoading || !formData.jop || !formData.game}
          >
            <option value="" disabled>
              {isLoading ? "جاري التحميل..." : !formData.jop ? "اختر الوظيفة أولاً" : !formData.game ? "اختر الرياضة أولاً" : "اختر الفئة"}
            </option>
            {availableRoleTypes.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.ar}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Role Type Field - Conditional */}
        {showCustomFields.roleType && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              حدد نوع الدور
            </label>
            <input
              type="text"
              name="customRoleType"
              value={formData.customRoleType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="أدخل نوع الدور"
            />
          </div>
        )}

        {/* Position */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            المركز
          </label>
          <select
            name="position"
            value={formData.position?.slug || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!formData.game || formData.jop === "coach"}
          >
            <option value="" disabled>
              {formData.jop === "coach" ? "غير متاح للمدربين" : !formData.game ? "اختر الرياضة أولاً" : "اختر المركز"}
            </option>
            {formData.jop !== "coach" && availablePositions.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.ar}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Position Field - Conditional */}
        {showCustomFields.position && formData.jop !== "coach" && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              حدد المركز
            </label>
            <input
              type="text"
              name="customPosition"
              value={formData.customPosition}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="أدخل المركز"
            />
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الحالة
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
          >
            <option value="" disabled>اختر الحالة</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            سنوات الخبرة
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            placeholder="عدد سنوات الخبرة"
          />
        </div>

        {/* Views */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            عدد المشاهدات
          </label>
          <input
            type="number"
            name="views"
            value={formData.views}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            placeholder="عدد المشاهدات"
          />
        </div>
      </div>
    </div>
  );
}