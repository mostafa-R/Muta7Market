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
            <option value="" disabled>اختر الرياضة</option>
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
           الفئة
          </label>
          <select
            name="roleType"
            value={formData.roleType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
          >
            <option value="" disabled>اختر الفئة</option>
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
             <option value="" disabled>
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
            <option value="" disabled>اختر الحالة</option>
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
    "freestyle": "حرة",
    "greco_roman": "رومانية",
    
    // Archery positions
    "white_arrow": "سهم أبيض",
    "black_arrow": "سهم أسود",
    "blue_arrow": "سهم أزرق",
    "red_arrow": "سهم أحمر",
    "yellow_arrow": "سهم أصفر",
    "green_arrow": "سهم أخضر",
    
    // Handball positions
    "pivot":"دائرة",
    "right_wing": "جناح أيمن",
    "right_back": "ظهير أيمن",
    "playmaker": "صانع ألعاب",
    "left_back": "ظهير أيسر",
    "left_wing": "جناح أيسر",
    
    // Athletics positions
    "100m": "100 متر",
    "200m": "200 متر",
    "400m": "400 متر",
    "800m": "800 متر",
    "1500m": "1500 متر",
    "5000m": "5000 متر",
    "10000m": "10000 متر",
    "marathon": "ماراثون",
   
    "110m_hurdles": "110 متر حواجز",
    "400m_hurdles": "400 متر حواجز",
    "long_jump": "قفز طويل",
    "high_jump": "قفز عالي",
    "triple_jump": "قفز ثلاثي",
    "pole_vault": "قفز بالزانة",
    "shot_put": "دفع الجلة",
    "discus_throw": "رمي القرص",
    "hammer_throw": "رمي المطرقة",
    "javelin_throw": "رمي الرمح",
    "race_walking": "المشي السريع",
    
    // Karate belts
    "white_belt": "حزام أبيض",
    "yellow_belt": "حزام أصفر",
    "orange_belt": "حزام برتقالي",
    "green_belt": "حزام أخضر",
    "blue_belt": "حزام أزرق",
    "brown_belt": "حزام بني",
    "red_belt": "حزام أحمر",
    "black_belt": "حزام أسود",
    
    // Taekwondo belts
    // (Same as karate for consistency)
    
    // Esports positions
    "moba": "موبا",
    "fighting_games": "ألعاب قتال",
    "rts": "استراتيجية فورية",
    "fps": "منظور شخص أول",
    "battle_royale": "معركة ملكية",
    "sports_simulation": "محاكاة رياضية",
    "racing_simulation": "محاكاة سباق",
    "mobile_games": "ألعاب محمولة",
    "fifa": "فيفا",
    "rocket_league": "روكيت ليغ",
    
    // Futsal positions
    "defender": "مدافع",
    "winger": "جناح",
    "pivot_flank": "محور جناح",
    "fixo_pivot": "محور ثابت",
    
    // Fencing positions
    "e_under": "فئة E تحت",
    "d_under": "فئة D تحت",
    "c_under": "فئة C تحت",
    "beginner": "مبتدئ",
    "unclassified": "غير مصنف",
    "foil": "شيش",
    "epee": "إيبي",
    "sabre": "سيف",
    
    // Swimming positions
    "freestyle_50m": "50م حرة",
    "freestyle_100m": "100م حرة",
    "freestyle_200m": "200م حرة",
    "freestyle_400m": "400م حرة",
    "freestyle_800m": "800م حرة",
    "freestyle_1500m": "1500م حرة",
    "backstroke_50m": "50م ظهر",
    "backstroke_100m": "100م ظهر",
    "backstroke_200m": "200م ظهر",
    "breaststroke_50m": "50م صدر",
    "breaststroke_100m": "100م صدر",
    "breaststroke_200m": "200م صدر",
    "butterfly_50m": "50م فراشة",
    "butterfly_100m": "100م فراشة",
    "butterfly_200m": "200م فراشة",
    "individual_medley_200m": "200م متنوع فردي",
    "individual_medley_400m": "400م متنوع فردي",
    "relay_200m": "تتابع 200م",
    "relay_400m": "تتابع 400م",
    "relay_800m": "تتابع 800م",
    "medley_relay_400m": "تتابع متنوع 400م",
    "open_water_5km": "مياه مفتوحة 5كم",
    "open_water_10km": "مياه مفتوحة 10كم",
    "open_water_25km": "مياه مفتوحة 25كم",
    
    // Tennis/Table Tennis/Badminton positions
    "singles": "فردي",
    "doubles": "زوجي",
    "mixed_doubles": "زوجي مختلط",
    
    // Judo weight categories
    "team": "فريق",
    
    // Cycling positions
    "road_racing": "سباق طريق",
    "track_cycling": "دراجات مضمار",
    "mountain_biking": "دراجات جبلية",
    "bmx": "بي إم إكس",
    "cyclocross": "دراجات هجينة",
    
    // Weightlifting categories
    "snatch": "خطف",
    "clean_jerk": "نتر",
    "powerlifting": "رفع قوة",
    
    // Boxing weight classes
    "flyweight": "وزن الذبابة",
    "bantamweight": "وزن الديك",
    "featherweight": "وزن الريشة",
    "lightweight": "وزن خفيف",
    "welterweight": "وزن ولتر",
    "middleweight": "وزن متوسط",
    "light_heavyweight": "وزن ثقيل خفيف",
    "heavyweight": "وزن ثقيل",
    
    // Gymnastics events
    "floor_exercise": "حركات أرضية",
    "pommel_horse": "حصان الحلق",
    "still_rings": "الحلق",
    "vault": "قفز",
    "parallel_bars": "متوازي",
    "horizontal_bar": "عقلة",
    "uneven_bars": "غير متساوي",
    "balance_beam": "عارضة توازن",
    "rhythmic": "جمباز إيقاعي",
    "trampoline": "ترامبولين",
    
    // Billiards
    "eight_ball": "8 كرات",
    "nine_ball": "9 كرات",
    "snooker": "سنوكر",
    "carom": "كاروم",
    "straight_pool": "بول مستقيم",
  
      "goalkeeper": "حارس مرمى",
      "defender": "مدافع",
      "midfielder": "لاعب وسط",
      "forward": "مهاجم",
      "striker": "مهاجم",
      "center": "وسط",
      "point_guard": "صانع ألعاب",
      "shooting_guard": "مدافع مسدد",
      "small_forward": "جناح صغير",
      "power_forward": "جناح قوي",
      "setter": "ممرر",
      "outside_hitter": "مهاجم خارجي",
      "middle_blocker": "حاجز وسط",
      "libero": "ليبرو",
      "singles": "فردي",
      "doubles": "زوجي",
      "mixed_doubles": "زوجي مختلط",
      "team": "فريق",
      "individual": "فردي",
      "coach": "مدرب",
      "trainer": "مدرب لياقة",
      "instructor": "مدرب تعليمي",
      "other": "أخرى",
      "goalkeeper": "حارس مرمى",
        "left_wing": "جناح يسار",
        "leftWing": "جناح أيسر",
        "leftBack": "ظهير أيسر",
        "playmaker": "صانع ألعاب",
        "rightBack": "ظهير أيمن",
        "rightWing": "جناح أيمن",
        "pivot": "دائرة",
        "left_back": "ظهير أيسر",
        "right_back": "ظهير أيمن",
        "right_wing": "جناح أيمن",
      
      
        "pointGuard": "صانع الألعاب",
        "point_guard": "صانع الألعاب",
        "shootingGuard": "حارس الرماية",
        "shooting_guard": "حارس الرماية",
        "smallForward": "الجناح الصغير",
        "small_forward": "الجناح الصغير",
        "powerForward": "الجناح القوي",
        "power_forward": "الجناح القوي",
        "center": "المركز",
    
    
        "setter": "مُعد",
        "outsideHitter": "ضارب خارجي",
        "outside_hitter": "ضارب خارجي",
        "middleBlocker": "حاجب أوسط",
        "middle_blocker": "حاجب أوسط",
        "oppositeHitter": "مقابل",
        "opposite_hitter": "مقابل",
        "opposite_hit": "مقابل",
        "libero": "ليبيرو",
        "defensiveSpecialist": "متخصص دفاعي",
        "defensive_specialist": "متخصص دفاعي",
        "servingSpecialist": "متخصص إرسال",
        "serving_specialist": "متخصص إرسال",
        "spiker": "ضارب",
        "blocker": "حاجب",
        "server": "مرسل",
   
  
    
        "whiteBelt": "الحزام الأبيض",
        "white_belt": "الحزام الأبيض",
        "yellowBelt": "الحزام الأصفر",
        "yellow_belt": "الحزام الأصفر",
        "orangeBelt": "الحزام البرتقالي",
        "orange_belt": "الحزام البرتقالي",
        "greenBelt": "الحزام الأخضر",
        "green_belt": "الحزام الأخضر",
        "blueBelt": "الحزام الأزرق",
        "blue_belt": "الحزام الأزرق",
        "brownBelt": "الحزام البني",
        "brown_belt": "الحزام البني",
        "redBelt": "الحزام الأحمر",
        "red_belt": "الحزام الأحمر",
      
    
        "whiteBelt": "الحزام الأبيض",
        "white_belt": "الحزام الأبيض",
        "yellowBelt": "الحزام الأصفر",
        "yellow_belt": "الحزام الأصفر",
        "greenBelt": "الحزام الأخضر",
        "green_belt": "الحزام الأخضر",
        "blueBelt": "الحزام الأزرق",
        "blue_belt": "الحزام الأزرق",
        "redBelt": "الحزام الأحمر",
        "red_belt": "الحزام الأحمر",
        "blackBelt": "الحزام الأسود",
        "black_belt": "الحزام الأسود",
      
      
        "whiteArrow": "سهم أبيض",
        "white_arrow": "سهم أبيض",
        "blackArrow": "سهم أسود",
        "black_arrow": "سهم أسود",
        "blueArrow": "سهم أزرق",
        "blue_arrow": "سهم أزرق",
        "redArrow": "سهم أحمر",
        "red_arrow": "سهم أحمر",
        "yellowArrow": "سهم أصفر",
        "yellow_arrow": "سهم أصفر",
        "greenArrow": "سهم أخضر",
        "green_arrow": "سهم أخضر",
    
        "moba": "MOBA",
        "fightingGames": "ألعاب القتال",
        "fighting_games": "ألعاب القتال",
        "rts": "RTS",
       
        "sportsSimulation": "محاكاة الرياضة",
        "sports_simulation": "محاكاة الرياضة",
        "racingSimulation": "سباقات المحاكاة",
        "racing_simulation": "سباقات المحاكاة",
        "mobileGames": "الهواتف المحمولة",
        
       
     
        "goalkeeper": "حارس مرمى",
        "rightBack": "ظهير أيمن",
        "leftBack": "ظهير أيسر",
        "centerBack": "قلب دفاع",
        "cdm": "محور دفاعي",
        "rightWinger": "جناح يمين",
        "leftWinger": "جناح يسار",
        "midfielder": "وسط",
        "cam": "صانع ألعاب",
        "striker": "مهاجم",
        "right_back": "ظهير أيمن",
        "left_back": "ظهير أيسر",
        "center_back": "قلب دفاع",
        "right_winger": "جناح يمين",
        "left_winger": "جناح يسار",
        "forward": "مهاجم",
        "defender": "مدافع",
        "assistantcoach": "مدرب مساعد",
        "assistant_coach": "مدرب مساعد",
     
        "freestyle50m": "سباحة حرة 50م",
        "freestyle100m": "سباحة حرة 100م",
        "freestyle200m": "سباحة حرة 200م",
        "backstroke50m": "سباحة ظهر 50م",
        "backstroke100m": "سباحة ظهر 100م",
        "backstroke200m": "سباحة ظهر 200م",
        "breaststroke50m": "سباحة صدر 50م",
        "breaststroke100m": "سباحة صدر 100م",
        "breaststroke200m": "سباحة صدر 200م",
        "butterfly50m": "سباحة فراشة 50م",
        "butterfly100m": "سباحة فراشة 100م",
        "butterfly200m": "سباحة فراشة 200م",
        "relay200m": "سباقات تتابع 200م",
        "relay400m": "سباقات تتابع 400م",
        "relay800m": "سباقات تتابع 800م",
        "medleyRace": "سباق متنوع",
        "freestyle": "سباحة حرة",
        "backstroke": "سباحة ظهر",
        "breaststroke": "سباحة صدر",
        "butterfly": "سباحة فراشة",
        "freestyle_50m": "سباحة حرة 50م",
        "freestyle_100m": "سباحة حرة 100م",
        "freestyle_200m": "سباحة حرة 200م",
        "backstroke_50m": "سباحة ظهر 50م",
        "backstroke_100m": "سباحة ظهر 100م",
        "backstroke_200m": "سباحة ظهر 200م",
        "breaststroke_50m": "سباحة صدر 50م",
        "breaststroke_100m": "سباحة صدر 100م",
        "breaststroke_200m": "سباحة صدر 200م",
        "butterfly_50m": "سباحة فراشة 50م",
        "butterfly_100m": "سباحة فراشة 100م",
        "butterfly_200m": "سباحة فراشة 200م",
        "relay_200m": "سباقات تتابع 200م",
        "relay_400m": "سباقات تتابع 400م",
        "relay_800m": "سباقات تتابع 800م",
        "medley_race": "سباق متنوع",
 
  
        "singles": "فردي",
        "doubles": "زوجي",
  
      
        "snatch": "خطف",
        "cleanJerk": "نطر ونتر",
        "powerlifting": "رفع أثقال قوة",
     
        "goalkeeper": "حارس مرمى",
        "defender": "مدافع",
        "winger": "جناح",
        "pivotFlank": "لاعب متأخر",
        "fixoPivot": "مهاجم",
        "pivot_flank": "لاعب متأخر",
        "fixo_pivot": "مهاجم",
   
        "lightweight": "وزن خفيف",
        "welterweight": "وزن ولتر",
        "middleweight": "وزن متوسط",
        "heavyweight": "وزن ثقيل",
  
        "floorExercise": "حرة أرضي",
        "pommelHorse": "حصان حلق",
        "stillRings": "حلق ثابت",
        "vault": "حصان قفز",
        "parallelBars": "متوازي",
        "horizontalBar": "عقلة",
        "unevenBars": "متوازي مختلف",
        "balanceBeam": "عارضة التوازن",
        "rhythmic": "إيقاعي",
        "trampoline": "ترامبولين",
        "parallel_bars": "متوازي",
        "pommel_horse": "حصان حلق",
        "floor_exercise": "حرة أرضي",
        " still_rings": "حلق ثابت",
        "horizontal_bar": "عقلة",
        "uneven_bars": "متوازي مختلف",
        "balance_beam": "عارضة التوازن",
        "eightBall": "الكرة الثامنة",
        "nineBall": "الكرة التاسعة",
        "snooker": "سنوكر",
        "straightPool": "بركة مستقيمة",
        "freestyle": "مصارعة حرة",
        "grecoRoman": "مصارعة رومانية",
        "greco_roman": "مصارعة رومانية",
        "100m": "100م",
        "200m": "200م",
        "400m": "400م",
        "800m": "800م",
        "1500m": "1500م",
        "5000m": "5000م",
        "10000m": "10000م",
        "marathon": "الماراثون",
        "100mHurdles": "100م حواجز",
        "100m_hurdles": "100م حواجز",
        "110mHurdles": "110م حواجز",
        "110m_hurdles": "110م حواجز",
        "400mHurdles": "400م حواجز",
        "400m_hurdles": "400م حواجز",
        "longJump": "وثب طويل",
        "long_jump": "وثب طويل",
        "highJump": "وثب عالي",
        "high_jump": "وثب عالي",
        "tripleJump": "وثب ثلاثي",
        "triple_jump": "وثب ثلاثي",
        "poleVault": "قفز بالزانة",
        "pole_vault": "قفز بالزانة",
        "shotPut": "رمي الجلة",
        "shot_put": "رمي الجلة",
        "discusThrow": "رمي القرص",
        "discus_throw": "رمي القرص",
        "hammerThrow": "رمي المطرقة",
        "hammer_throw": "رمي المطرقة",
        "javelinThrow": "رمي الرمح",
        "javelin_throw": "رمي الرمح",
        "raceWalking": "سباق مشي",
        "race_walking": "سباق مشي",
        "beginner": "مبتدئ",
        "unclassified": "غير مصنف",
        "foil": "سلاح الشيش",
        "epee": "سلاح المبارزة",
        "sabre": "سلاح السابر",
        "lightweight": "وزن خفيف",
        "middleweight": "وزن متوسط",
        "heavyweight": "وزن ثقيل",
        "team": "فريق",
        "roadRacing": "سباق طريق",
        "road_racing": "سباق طريق",
        "trackCycling": "مضمار",
        "track_cycling": "مضمار",
        "mountainBiking": "دراجة جبلية",
        "mountain_biking": "دراجة جبلية",
        "bmx": "بي إم إكس",
        "cyclocross": "عبر البلاد",
        "singles": "فردي",
        "doubles": "زوجي",
        "mixedDoubles": "زوجي مختلط",
        "mixed_doubles": "زوجي مختلط",
        "singles": "فردي",
        "doubles": "زوجي",
        "mixedDoubles": "زوجي مختلط",
        "mixed_doubles": "زوجي مختلط",
        "singles": "فردي",
        "doubles": "زوجي",
        "mixedDoubles": "زوجي مختلط",
        "mixed_doubles": "زوجي مختلط",
    "other": "أخرى"
  };
  
  return translations[value] || value;
}
