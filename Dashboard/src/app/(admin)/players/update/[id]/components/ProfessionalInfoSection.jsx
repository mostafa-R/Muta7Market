"use client";

import {
  coachRoleTypes,
  playerRoleTypes,
  sportPositions,
  sportsOptions,
  statusOptions
} from "../playerOptions";

export default function ProfessionalInfoSection({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) {
  // Get available positions based on selected sport
  const availablePositions = sportPositions[formData.game] || [];
  // Get available role types based on job type
  const availableRoleTypes = formData.jop === "coach" ? coachRoleTypes : playerRoleTypes;

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
            value={formData.game}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            required
          >
            <option value="">اختر الرياضة</option>
            {sportsOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {getSportLabel(option.value)}
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
            نوع الدور
          </label>
          <select
            name="roleType"
            value={formData.roleType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
          >
            <option value="">اختر نوع الدور</option>
            {availableRoleTypes.map((option) => (
              <option key={option.id} value={option.value}>
                {getRoleTypeLabel(option.value)}
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
             value={formData.position}
             onChange={handleInputChange}
             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
             disabled={!formData.game || formData.jop === "coach"}
           >
             <option value="">
               {formData.jop === "coach" ? "غير متاح للمدربين" : "اختر المركز"}
             </option>
             {formData.jop !== "coach" && availablePositions.map((option) => (
               <option key={option.id} value={option.value}>
                 {translatePosition(option.value)}
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
            <option value="">اختر الحالة</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {getStatusLabel(option.value)}
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

// Helper functions
function getSportLabel(value) {
  const labels = {
    "volleyball": "كرة طائرة",
    "basketball": "كرة سلة", 
    "wrestling": "مصارعة",
    "archery": "رماية بالقوس",
    "handball": "كرة يد",
    "athletics": "ألعاب قوى",
    "karate": "كاراتيه",
    "taekwondo": "تايكواندو",
    "esports": "الرياضات الإلكترونية",
    "football": "كرة القدم",
    "futsal": "كرة الصالات",
    "fencing": "سلاح الشيش",
    "swimming": "سباحة",
    "tennis": "تنس",
    "tabletennis": "تنس الطاولة",
    "badminton": "ريشة طائرة",
    "judo": "جودو",
    "cycling": "دراجات",
    "squash": "اسكواش",
    "weightlifting": "رفع أثقال",
    "boxing": "ملاكمة",
    "gymnastics": "جمباز",
    "billiards": "بلياردو",
    "other": "أخرى"
  };
  
  return labels[value] || value;
}

function getRoleTypeLabel(value) {
  const labels = {
    "youth_player": "لاعب شباب",
    "junior_player": "لاعب صغار",
    "first_team_player": "لاعب فريق أول",
    "reserve_player": "لاعب احتياطي",
    "professional_player": "لاعب محترف",
    "amateur_player": "لاعب هاوي",
    "academy_player": "لاعب أكاديمية",
    "head_coach": "مدرب رئيسي",
    "assistant_coach": "مدرب مساعد",
    "goalkeeper_coach": "مدرب حراس مرمى",
    "fitness_coach": "مدرب لياقة",
    "technical_coach": "مدرب تقني",
    "youth_coach": "مدرب ناشئين",
    "physio": "أخصائي علاج طبيعي",
    "tactical_analyst": "محلل تكتيكي",
    "strength_conditioning_coach": "مدرب قوة وتكييف",
    "other": "أخرى"
  };
  
  return labels[value] || value;
}

function getStatusLabel(value) {
  const labels = {
    "available": "متاح",
    "contracted": "متعاقد",
    "transferred": "منتقل"
  };
  
  return labels[value] || value;
}

// Position translation function
function translatePosition(value) {
  const translations = {
    // Football positions
    "goalkeeper": "حارس مرمى",
    "right_back": "ظهير أيمن",
    "left_back": "ظهير أيسر",
    "center_back": "مدافع وسط",
    "cdm": "مدافع وسط مهاجم",
    "right_winger": "جناح أيمن",
    "left_winger": "جناح أيسر",
    "midfielder": "لاعب وسط",
    "cam": "صانع ألعاب",
    "striker": "مهاجم",
    
    // Basketball positions
    "point_guard": "صانع ألعاب",
    "shooting_guard": "حارس هجومي",
    "small_forward": "جناح صغير",
    "power_forward": "جناح قوي",
    "center": "محور",
    
    // Volleyball positions
    "outside_hitter": "ضارب خارجي",
    "opposite_hitter": "ضارب معاكس",
    "setter": "معد",
    "middle_blocker": "صاد وسط",
    "libero": "ليبرو",
    "defensive_specialist": "أخصائي دفاع",
    "serving_specialist": "أخصائي إرسال",
    
    // Wrestling positions
    "freestyle": "حر",
    "greco_roman": "رومانية",
    
    // Archery positions
    "white_arrow": "سهم أبيض",
    "black_arrow": "سهم أسود",
    "blue_arrow": "سهم أزرق",
    "red_arrow": "سهم أحمر",
    "yellow_arrow": "سهم أصفر",
    "green_arrow": "سهم أخضر",
    
    // Additional positions...
    "other": "أخرى"
  };
  
  return translations[value] || value;
}
