import {
  coachRoleTypes,
  currencyOptions,
  playerRoleTypes,
  sportPositions,
  sportsOptions,
  statusOptions
} from '../playerOptions';

const ProfessionalInformationStep = ({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) => {
  const availablePositions = sportPositions[formData.game] || [];
  const availableRoleTypes = formData.jop === "coach" ? coachRoleTypes : playerRoleTypes;

  // Enhanced handleInputChange to handle automatic position setting when sport is "other"
  const handleEnhancedInputChange = (e) => {
    const { name, value } = e.target;
    
    // Call the original handleInputChange first
    handleInputChange(e);
    
    // Special logic: when sport is "other", automatically set position to "other" for players
    if (name === "game" && value === "other" && formData.jop === "player") {
      const positionEvent = {
        target: {
          name: "position",
          value: "other"
        }
      };
      handleInputChange(positionEvent);
    }
  };

  // Function to translate position names
  const translatePosition = (value) => {
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
          "battleRoyale": "Battle Royale",
          "battle_royale": "Battle Royale",
          "sportsSimulation": "محاكاة الرياضة",
          "sports_simulation": "محاكاة الرياضة",
          "racingSimulation": "سباقات المحاكاة",
          "racing_simulation": "سباقات المحاكاة",
          "mobileGames": "الهواتف المحمولة",
          "fifa": "FIFA",
          "rocketLeague": "Rocket League",
       
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
          "eUnder": "E & Under",
          "e_under": "E & Under",
          "dUnder": "D & Under",
          "d_under": "D & Under",
          "cUnder": "C & Under",
          "c_under": "C & Under",
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="bg-purple-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H10a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">المعلومات المهنية</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الفئة - الوظيفة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            name="jop"
            value={formData.jop}
            onChange={(e) => {
              handleEnhancedInputChange(e);
              // Clear position and role type when changing job category
              const roleEvent = { target: { name: "roleType", value: "" } };
              handleInputChange(roleEvent);
              const posEvent = { target: { name: "position", value: "" } };
              handleInputChange(posEvent);
            }}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            required
          >
            <option value="" disabled>
              اختر الفئة
            </option>
            <option value="player">لاعب</option>
            <option value="coach">مدرب</option>
          </select>

          {/* نوع الدور - يظهر بعد اختيار الفئة */}
          {formData.jop && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {formData.jop === "player" ? "نوع اللاعب" : "نوع المدرب"}
                <span className="text-red-500 mr-1 ml-1">*</span>
              </label>
              <select
                name="roleType"
                value={formData.roleType}
                onChange={handleEnhancedInputChange}
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              >
                <option value="" disabled>
                  {formData.jop === "player" ? "اختر نوع اللاعب" : "اختر نوع المدرب"}
                </option>
                {availableRoleTypes.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value === "youth_player" ? "لاعب شباب" :
                     option.value === "junior_player" ? "لاعب صغار" :
                     option.value === "first_team_player" ? "لاعب فريق أول" :
                     option.value === "reserve_player" ? "لاعب احتياطي" :
                     option.value === "professional_player" ? "لاعب محترف" :
                     option.value === "amateur_player" ? "لاعب هاوي" :
                     option.value === "academy_player" ? "لاعب أكاديمية" :
                     option.value === "head_coach" ? "مدرب رئيسي" :
                     option.value === "assistant_coach" ? "مدرب مساعد" :
                     option.value === "goalkeeper_coach" ? "مدرب حراس مرمى" :
                     option.value === "fitness_coach" ? "مدرب لياقة" :
                     option.value === "technical_coach" ? "مدرب تقني" :
                     option.value === "youth_coach" ? "مدرب ناشئين" :
                     option.value === "physio" ? "أخصائي علاج طبيعي" :
                     option.value === "tactical_analyst" ? "محلل تكتيكي" :
                     option.value === "strength_conditioning_coach" ? "مدرب قوة وتكييف" :
                     "أخرى"}
                  </option>
                ))}
              </select>

              {/* Custom role type input field when "other" is selected */}
              {formData.roleType === "other" && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {formData.jop === "player" ? "حدد نوع اللاعب" : "حدد نوع المدرب"}
                    <span className="text-red-500 mx-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="customRoleType"
                    value={formData.customRoleType}
                    onChange={handleEnhancedInputChange}
                    placeholder={
                      formData.jop === "player" ? "أدخل نوع اللاعب" : "أدخل نوع المدرب"
                    }
                    className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                  />
                  <div className="text-gray-500 text-xs mt-1">
                    {formData.jop === "player" ? "أدخل نوع اللاعب" : "أدخل نوع المدرب"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* الرياضة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الرياضة <span className="text-red-500">*</span>
          </label>
          <select
            name="game"
            value={formData.game}
            onChange={handleEnhancedInputChange}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            required
          >
            <option value="" disabled>
              اختر الرياضة
            </option>
            {sportsOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "volleyball" ? "كرة طائرة" :
                 option.value === "basketball" ? "كرة سلة" :
                 option.value === "wrestling" ? "مصارعة" :
                 option.value === "archery" ? "رماية بالقوس" :
                 option.value === "handball" ? "كرة يد" :
                 option.value === "athletics" ? "ألعاب قوى" :
                 option.value === "karate" ? "كاراتيه" :
                 option.value === "taekwondo" ? "تايكواندو" :
                 option.value === "esports" ? "الرياضات الإلكترونية" :
                 option.value === "football" ? "كرة القدم" :
                 option.value === "futsal" ? "كرة الصالات" :
                 option.value === "fencing" ? "سلاح الشيش" :
                 option.value === "swimming" ? "سباحة" :
                 option.value === "tennis" ? "تنس" :
                 option.value === "tabletennis" ? "تنس الطاولة" :
                 option.value === "badminton" ? "ريشة طائرة" :
                 option.value === "judo" ? "جودو" :
                 option.value === "cycling" ? "دراجات" :
                 option.value === "squash" ? "اسكواش" :
                 option.value === "weightlifting" ? "رفع أثقال" :
                 option.value === "boxing" ? "ملاكمة" :
                 option.value === "gymnastics" ? "جمباز" :
                 option.value === "billiards" ? "بلياردو" :
                 "أخرى"}
              </option>
            ))}
          </select>

          {/* Custom sport input field when "other" is selected */}
          {formData.game === "other" && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                حدد الرياضة
                <span className="text-red-500 mx-1">*</span>
              </label>
              <input
                type="text"
                name="customSport"
                value={formData.customSport}
                onChange={handleEnhancedInputChange}
                placeholder="أدخل نوع الرياضة"
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              />
              <div className="text-gray-500 text-xs mt-1">
                أدخل نوع الرياضة
              </div>
            </div>
          )}
        </div>

        {/* المركز/التخصص - للاعبين فقط */}
        {formData.jop === "player" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              المركز <span className="text-red-500">*</span>
            </label>
            {formData.game ? (
              <>
                {/* إذا كانت الرياضة "أخرى" - اظهار حقل المركز المخصص مباشرة */}
                {formData.game === "other" ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="customPosition"
                      value={formData.customPosition}
                      onChange={handleEnhancedInputChange}
                      placeholder="أدخل المركز"
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                    />
                    <div className="text-gray-500 text-xs mt-1">
                      أدخل المركز المخصص
                    </div>
                  </div>
                ) : availablePositions.length > 0 ? (
                  /* إذا كانت الرياضة محددة ولديها مراكز - اظهار select مع المراكز */
                  <>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleEnhancedInputChange}
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                    >
                      <option value="" disabled>اختر المركز</option>
                      {availablePositions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {translatePosition(option.value)}
                        </option>
                      ))}
                    </select>

                    {/* Custom position input field when "other" is selected */}
                    {formData.position === "other" && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          حدد المركز
                          <span className="text-red-500 mx-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="customPosition"
                          value={formData.customPosition}
                          onChange={handleEnhancedInputChange}
                          placeholder="أدخل المركز"
                          className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                        />
                        <div className="text-gray-500 text-xs mt-1">
                          أدخل المركز
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* إذا كانت الرياضة محددة ولكن لا توجد مراكز محددة - اظهار حقل مخصص */
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="customPosition"
                      value={formData.customPosition}
                      onChange={handleEnhancedInputChange}
                      placeholder="أدخل المركز"
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                    />
                    <div className="text-gray-500 text-xs mt-1">
                      أدخل المركز لهذه الرياضة
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* إذا لم يتم اختيار رياضة بعد */
              <div className="h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                <span className="text-gray-500">
                  اختر الرياضة أولاً
                </span>
              </div>
            )}
            <div className="text-gray-500 text-xs mt-1">
              {!formData.game ? "اختر الرياضة أولاً" : 
               formData.game === "other" ? "أدخل المركز المخصص" : 
               "اختر أو أدخل المركز"}
            </div>
          </div>
        )}

        {/* الحالة الحالية */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الحالة الحالية <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleEnhancedInputChange}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
          >
            <option value="" disabled>
              اختر الحالة
            </option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "available" ? "متاح" :
                 option.value === "contracted" ? "متعاقد" :
                 "منتقل"}
              </option>
            ))}
          </select>
          <div className="text-gray-500 text-xs mt-1">
            حدد الحالة الحالية للشخص
          </div>
        </div>

        {/* سنوات الخبرة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            سنوات الخبرة
            <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleEnhancedInputChange}
            min="0"
            max="30"
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            placeholder="عدد سنوات الخبرة"
          />
          <div className="text-gray-500 text-xs mt-1">
            عدد سنوات الخبرة في الرياضة
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-green-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">معلومات الراتب</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الراتب الشهري
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="monthlySalary.amount"
                value={formData.monthlySalary.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="flex-1 h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <select
                name="monthlySalary.currency"
                value={formData.monthlySalary.currency}
                onChange={handleEnhancedInputChange}
                className="h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              الراتب الشهري الحالي أو المطلوب
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الراتب السنوي
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="yearSalary.amount"
                value={formData.yearSalary.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="flex-1 h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <select
                name="yearSalary.currency"
                value={formData.yearSalary.currency}
                onChange={handleEnhancedInputChange}
                className="h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              الراتب السنوي الحالي أو المطلوب
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              تاريخ انتهاء العقد
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleEnhancedInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = e.target.parentElement.querySelector('input[type="date"]');
                  if (input) {
                    input.focus();
                    input.showPicker && input.showPicker();
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              تاريخ انتهاء العقد الحالي (إن وُجد)
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Information */}
      {(formData.status === "transferred" || formData.status === "contracted") && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="bg-orange-100 rounded-lg p-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">معلومات الانتقال</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                النادي المنتقل إليه
              </label>
              <input
                type="text"
                name="transferredTo.club"
                value={formData.transferredTo.club}
                onChange={handleEnhancedInputChange}
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="اسم النادي"
              />
              <div className="text-gray-500 text-xs mt-1">
                اسم النادي المنتقل إليه
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                مبلغ الانتقال
              </label>
              <input
                type="number"
                name="transferredTo.amount"
                value={formData.transferredTo.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <div className="text-gray-500 text-xs mt-1">
                قيمة الانتقال (إن وُجدت)
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                تاريخ بداية الانتقال
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transferredTo.startDate"
                  value={formData.transferredTo.startDate}
                  onChange={handleEnhancedInputChange}
                  className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.target.parentElement.querySelector('input[type="date"]');
                    if (input) {
                      input.focus();
                      input.showPicker && input.showPicker();
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                تاريخ بداية الانتقال أو التعاقد
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                تاريخ نهاية الانتقال
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transferredTo.endDate"
                  value={formData.transferredTo.endDate}
                  onChange={handleEnhancedInputChange}
                  className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.target.parentElement.querySelector('input[type="date"]');
                    if (input) {
                      input.focus();
                      input.showPicker && input.showPicker();
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                تاريخ انتهاء الانتقال أو التعاقد
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Info Section */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-4 flex items-start">
          <div className="text-blue-500 mr-3 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">
              معلومات هامة
            </h4>
            <p className="text-sm text-blue-700">
              جميع المعلومات المهنية ستظهر في الملف الشخصي للمساعدة في عملية البحث والاختيار. تأكد من دقة البيانات المدخلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInformationStep;
