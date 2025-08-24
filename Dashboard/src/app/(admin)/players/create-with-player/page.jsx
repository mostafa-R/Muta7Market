"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../component/ui/dialog";
import {
  coachRoleTypes,
  currencyOptions,
  genderOptions,
  nationalities,
  playerRoleTypes,
  sportPositions,
  sportsOptions,
  statusOptions,
} from "./playerOptions";

// كومبوننت فرعي للدايالوج
function SuccessDialog({ open, onOpenChange, playerName, playerId, onViewPlayer, onCreateNewPlayer, onViewAllPlayers }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl">تم إنشاء اللاعب بنجاح</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-gray-600">
            لقد تم إنشاء اللاعب <span className="font-bold text-black">{playerName}</span> بنجاح. ماذا تريد أن تفعل الآن؟
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onViewPlayer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            عرض بيانات اللاعب
          </Button>
          <Button onClick={onCreateNewPlayer} className="w-full bg-green-600 hover:bg-green-700 text-white">
            إنشاء لاعب جديد
          </Button>
          <Button onClick={onViewAllPlayers} className="w-full bg-gray-600 hover:bg-gray-700 text-white">
            عرض جميع اللاعبين
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// كومبوننت فرعي لقسم الوسائط (فصلناه لوحده للتنظيم)
function MediaUpload({ files, setFiles, previews, setPreviews, handleFileChange, removeImage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الصورة الشخصية
        </label>
        <input
          type="file"
          name="profileImage"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
        />
        {previews.profileImage && (
          <div className="mt-2">
            <img
              src={previews.profileImage}
              alt="معاينة الصورة الشخصية"
              className="w-24 h-24 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          مقطع فيديو
        </label>
        <input
          type="file"
          name="playerVideo"
          onChange={handleFileChange}
          accept="video/*"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          مستند (CV/السيرة الذاتية)
        </label>
        <input
          type="file"
          name="document"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الصور الإضافية (حد أقصى 4)
        </label>
        <input
          type="file"
          name="images"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
        />
        {previews.images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {previews.images.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`معاينة الصورة الإضافية ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPlayerId, setCreatedPlayerId] = useState(null);
  const [createdPlayerName, setCreatedPlayerName] = useState("");
  const [showCustomFields, setShowCustomFields] = useState({
    nationality: false,
    birthCountry: false,
    roleType: false,
    position: false,
    sport: false,
  });

  // Form Data State
  const [formData, setFormData] = useState({
    // User data
    email: "",
    name: "",
    password: "",
    phone: "",
    role: "user",
    isActive: true,
    isEmailVerified: true,

    // Player data
    age: "",
    gender: "",
    nationality: "",
    customNationality: "",
    birthCountry: "",
    customBirthCountry: "",
    jop: "",
    roleType: "",
    customRoleType: "",
    position: "",
    customPosition: "",
    status: "",
    experience: 0,
    monthlySalary: {
      amount: 0,
      currency: "",
    },
    yearSalary: {
      amount: 0,
      currency: "",
    },
    contractEndDate: "",
    transferredTo: {
      club: "",
      startDate: "",
      endDate: "",
      amount: 0,
    },
    socialLinks: {
      instagram: "",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
    contactInfo: {
      email: "",
      phone: "",
      agent: {
        name: "",
        phone: "",
        email: "",
      },
    },
    game: "",
    customSport: "",
    isListed: true,
    playerIsActive: true,
  });

  // File States
  const [files, setFiles] = useState({
    profileImage: null,
    document: null,
    playerVideo: null,
    images: [],
  });

  const [previews, setPreviews] = useState({
    profileImage: null,
    images: [],
  });

  // Update positions when sport changes
  const availablePositions = sportPositions[formData.game] || [];
  const availableRoleTypes = formData.jop === "coach" ? coachRoleTypes : playerRoleTypes;

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
      "freestyle": "حر",
      "greco_roman": "رومانية",
      
      // Archery positions
      "white_arrow": "سهم أبيض",
      "black_arrow": "سهم أسود", 
      "blue_arrow": "سهم أزرق",
      "red_arrow": "سهم أحمر",
      "yellow_arrow": "سهم أصفر",
      "green_arrow": "سهم أخضر",
      
      // Handball positions
      "pivot": "محور",
      "right_wing": "جناح أيمن",
      "right_back": "ظهير أيمن",
      "playmaker": "صانع ألعاب",
      "left_back": "ظهير أيسر", 
      "left_wing": "جناح أيسر",
      
      // Athletics events
      "100m": "100 متر",
      "200m": "200 متر",
      "400m": "400 متر",
      "800m": "800 متر",
      "1500m": "1500 متر",
      "5000m": "5000 متر", 
      "10000m": "10000 متر",
      "marathon": "ماراثون",
      "100m_hurdles": "100 متر حواجز",
      "110m_hurdles": "110 متر حواجز",
      "400m_hurdles": "400 متر حواجز",
      "long_jump": "وثب طويل",
      "high_jump": "وثب عالي",
      "triple_jump": "وثب ثلاثي",
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
      
      // Taekwondo belts
      "black_belt": "حزام أسود",
      
      // Esports categories
      "moba": "موبا",
      "fighting_games": "ألعاب قتال",
      "rts": "استراتيجية في الوقت الفعلي",
      "fps": "منظور الشخص الأول",
      "battle_royale": "باتل رويال",
      "sports_simulation": "محاكاة رياضية",
      "racing_simulation": "محاكاة سباق",
      "mobile_games": "ألعاب الجوال",
      "fifa": "فيفا",
      "rocket_league": "روكيت ليغ",
      
      // Futsal positions
      "defender": "مدافع",
      "winger": "جناح",
      "pivot_flank": "محور جناح",
      "fixo_pivot": "محور ثابت",
      
      // Fencing levels
      "e_under": "تحت E",
      "d_under": "تحت D", 
      "c_under": "تحت C",
      "beginner": "مبتدئ",
      "unclassified": "غير مصنف",
      "foil": "سيف الشيش",
      "epee": "سيف السيف",
      "sabre": "سيف الصابر",
      
      // Swimming events
      "freestyle_50m": "حرة 50 متر",
      "freestyle_100m": "حرة 100 متر",
      "freestyle_200m": "حرة 200 متر",
      "backstroke_50m": "ظهر 50 متر",
      "backstroke_100m": "ظهر 100 متر", 
      "backstroke_200m": "ظهر 200 متر",
      "breaststroke_50m": "صدر 50 متر",
      "breaststroke_100m": "صدر 100 متر",
      "breaststroke_200m": "صدر 200 متر",
      "butterfly_50m": "فراشة 50 متر",
      "butterfly_100m": "فراشة 100 متر",
      "butterfly_200m": "فراشة 200 متر",
      "relay_200m": "تتابع 200 متر",
      "relay_400m": "تتابع 400 متر",
      "relay_800m": "تتابع 800 متر",
      "medley_race": "سباق متنوع",
      
      // Tennis/Table Tennis/Badminton
      "singles": "فردي",
      "doubles": "زوجي", 
      "mixed_doubles": "زوجي مختلط",
      
      // Judo/Boxing weight classes
      "lightweight": "وزن خفيف",
      "middleweight": "وزن متوسط",
      "heavyweight": "وزن ثقيل",
      "welterweight": "وزن ويلتر",
      "team": "فريق",
      
      // Cycling
      "road_racing": "سباق طريق",
      "track_cycling": "دراجات مضمار",
      "mountain_biking": "دراجات جبلية",
      "bmx": "بي إم إكس",
      "cyclocross": "دراجات عبر الضاحية",
      
      // Weightlifting
      "snatch": "خطف",
      "clean_jerk": "نتر",
      "powerlifting": "رفع قوة",
      
      // Gymnastics
      "floor_exercise": "حركات أرضية",
      "pommel_horse": "حصان الحلق",
      "still_rings": "الحلق",
      "vault": "حصان القفز",
      "parallel_bars": "متوازي",
      "horizontal_bar": "عقلة",
      "uneven_bars": "متوازي مختلف الارتفاع",
      "balance_beam": "عارضة التوازن",
      "rhythmic": "إيقاعية",
      "trampoline": "ترامبولين",
      
      // Billiards
      "eight_ball": "ثمانية كرات",
      "nine_ball": "تسع كرات",
      "snooker": "سنوكر",
      "straight_pool": "بلياردو مستقيم",
      
      // General
      "other": "أخرى"
    };
    
    return translations[value] || value;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Handle "other" selections
    if (value === "other") {
      setShowCustomFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    } else if (name === "nationality" || name === "birthCountry" || name === "roleType" || name === "position" || name === "game") {
      setShowCustomFields((prev) => ({
        ...prev,
        [name]: false,
      }));
    }

    // Clear position when sport changes
    if (name === "game") {
      setFormData((prev) => ({
        ...prev,
        position: "",
        customPosition: "",
      }));
      setShowCustomFields((prev) => ({
        ...prev,
        position: false,
      }));
    }
  };

  // Handle file changes (مع تحسين لعدد الصور إلى 4 وتحقق بسيط)
const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    
    if (name === "images") {
      const newImageFiles = Array.from(uploadedFiles).filter(file => file.type.startsWith('image/'));
      
      setFiles((prev) => {
        const updatedImages = [...prev.images, ...newImageFiles].slice(0, 4); // إضافة الجديد إلى القديم، مع اقتصار على 4
        if (prev.images.length + newImageFiles.length > 4) {
          toast.error("تم اقتصار الصور على 4 فقط (الحد الأقصى)", {
            description: "يمكنك إزالة صور أخرى لإضافة صور جديدة",
            duration: 4000
          });
        }
        return { ...prev, images: updatedImages };
      });
      
      // Create previews for new images only, and append to existing
      const newPreviews = newImageFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => ({ ...prev, images: [...prev.images, ...newPreviews].slice(0, 4) }));
      
      // Show success message for image upload
      if (newImageFiles.length > 0) {
        toast.success(`تم رفع ${newImageFiles.length} صورة بنجاح`, {
          description: `إجمالي الصور: ${Math.min(prev.images.length + newImageFiles.length, 4)}`,
          duration: 3000
        });
      }
    } else {
      const file = uploadedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      
      if (name === "profileImage" && file) {
        setPreviews((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
        toast.success("تم رفع الصورة الشخصية بنجاح", {
          description: "يمكنك معاينة الصورة أدناه",
          duration: 3000
        });
      } else if (name === "document" && file) {
        toast.success("تم رفع المستند بنجاح", {
          description: `تم رفع: ${file.name}`,
          duration: 3000
        });
      } else if (name === "playerVideo" && file) {
        toast.success("تم رفع الفيديو بنجاح", {
          description: `تم رفع: ${file.name}`,
          duration: 3000
        });
      }
    }
  };

  // Remove image (مع تحسين لإلغاء URL لتحرير الذاكرة)
  const removeImage = (index) => {
    setFiles((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages };
    });
    setPreviews((prev) => {
      const removedUrl = prev.images[index];
      if (removedUrl) URL.revokeObjectURL(removedUrl); // تحرير الذاكرة
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
    
    // Show success message for image removal
    toast.success("تم إزالة الصورة بنجاح", {
      description: "يمكنك الآن إضافة صورة جديدة",
      duration: 3000
    });
  };

  // Validate current step
  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.name || !formData.password) {
        toast.error("يرجى ملء جميع الحقول المطلوبة", {
          description: "الحقول المطلوبة: البريد الإلكتروني، الاسم، كلمة المرور",
          duration: 4000
        });
        return false;
      }
      
      if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        toast.error("يرجى إدخال بريد إلكتروني صحيح", {
          description: "تأكد من صحة تنسيق البريد الإلكتروني",
          duration: 4000
        });
        return false;
      }
      
      if (formData.password.length < 8) {
        toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل", {
          description: "أضف المزيد من الأحرف لتقوية كلمة المرور",
          duration: 4000
        });
        return false;
      }
      
      if (formData.phone && !formData.phone.match(/^[0-9]{10,15}$/)) {
        toast.error("يرجى إدخال رقم هاتف صحيح", {
          description: "يجب أن يكون الرقم بين 10-15 رقم",
          duration: 4000
        });
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.age || !formData.gender || !formData.nationality) {
        toast.error("يرجى ملء جميع الحقول المطلوبة", {
          description: "الحقول المطلوبة: العمر، الجنس، الجنسية",
          duration: 4000
        });
        return false;
      }
      
      if (formData.age < 15 || formData.age > 50) {
        toast.error("العمر يجب أن يكون بين 15 و 50", {
          description: "العمر المطلوب للانضمام للنظام",
          duration: 4000
        });
        return false;
      }
      
      if (formData.nationality === "other" && !formData.customNationality) {
        toast.error("يرجى تحديد الجنسية", {
          description: "اكتب الجنسية في الحقل المخصص",
          duration: 4000
        });
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.jop) {
        toast.error("يرجى اختيار الوظيفة", {
          description: "اختر ما إذا كنت لاعب أو مدرب",
          duration: 4000
        });
        return false;
      }
      
      if (!formData.game) {
        toast.error("يرجى اختيار نوع الرياضة", {
          description: "اختر نوع الرياضة التي تمارسها",
          duration: 4000
        });
        return false;
      }
      
      if (formData.game === "other" && !formData.customSport) {
        toast.error("يرجى تحديد نوع الرياضة", {
          description: "اكتب نوع الرياضة في الحقل المخصص",
          duration: 4000
        });
        return false;
      }
    }
    
    if (currentStep === 4) {
      // Check if contact info looks valid
      if (formData.contactInfo.email && !formData.contactInfo.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        toast.error("يرجى إدخال بريد إلكتروني صحيح للتواصل", {
          description: "تأكد من صحة تنسيق البريد الإلكتروني",
          duration: 4000
        });
        return false;
      }
      
      if (formData.contactInfo.phone && !formData.contactInfo.phone.match(/^[0-9]{10,15}$/)) {
        toast.error("يرجى إدخال رقم هاتف صحيح للتواصل", {
          description: "يجب أن يكون الرقم بين 10-15 رقم",
          duration: 4000
        });
        return false;
      }
      
      // Validate social links if provided
      if (formData.socialLinks.instagram && !formData.socialLinks.instagram.includes('instagram.com')) {
        toast.error("يرجى إدخال رابط إنستجرام صحيح", {
          description: "يجب أن يحتوي الرابط على instagram.com",
          duration: 4000
        });
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      // Show success message for step completion
      toast.success(`تم إكمال الخطوة ${currentStep} بنجاح`, {
        description: `انتقلت إلى الخطوة ${currentStep + 1}`,
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    // Show loading message
    toast.success("جاري إنشاء اللاعب", {
      description: "يرجى الانتظار حتى يتم إنشاء اللاعب في النظام",
      duration: 2000,
    });
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === "object" && formData[key] !== null) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append files
      if (files.profileImage) {
        formDataToSend.append("profileImage", files.profileImage);
      }
      if (files.document) {
        formDataToSend.append("document", files.document);
      }
      if (files.playerVideo) {
        formDataToSend.append("playerVideo", files.playerVideo);
      }
      files.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const token =  sessionStorage.getItem("accessToken") ||  localStorage.getItem("token")  

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users-with-player`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Show success message and set player info for the dialog
      toast.success("تم إنشاء اللاعب بنجاح", {
        description: `تم إنشاء اللاعب ${formData.name} بنجاح في النظام`,
        duration: 5000,
      });
      
      // Set player data for the dialog
      setCreatedPlayerId(response.data?.user?.player?._id || response.data?.player?._id);
      setCreatedPlayerName(formData.name);
      
      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error creating player:", error);
      
      // Handle error message in Arabic
      let errorMessage = "حدث خطأ أثناء إنشاء اللاعب";
      
      // Get more specific error message from the API if available
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("Email") && error.response.data.message.includes("already exists")) {
          errorMessage = "البريد الإلكتروني مستخدم بالفعل، الرجاء استخدام بريد آخر";
        } else if (error.response.data.message.includes("Phone") && error.response.data.message.includes("already exists")) {
          errorMessage = "رقم الهاتف مستخدم بالفعل، الرجاء استخدام رقم آخر";
        } else if (error.response.data.message.includes("Invalid") && error.response.data.message.includes("format")) {
          errorMessage = "تنسيق البيانات غير صحيح، يرجى التحقق من المدخلات";
        } else if (error.response.data.message.includes("Server")) {
          errorMessage = "حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقًا";
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      // Show error toast
      toast.error(errorMessage, {
        description: "يرجى التحقق من البيانات والمحاولة مرة أخرى",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (previews.profileImage) URL.revokeObjectURL(previews.profileImage);
      previews.images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Navigate functions
  const navigateToPlayersList = () => {
    router.push("/admin/players");
    setShowSuccessDialog(false);
    toast.success("تم الانتقال لقائمة اللاعبين", {
      description: "يمكنك عرض جميع اللاعبين في النظام",
      duration: 3000
    });
  };

  const navigateToPlayerView = () => {
    if (createdPlayerId) {
      router.push(`/admin/players/view/${createdPlayerId}`);
      setShowSuccessDialog(false);
      toast.success("تم الانتقال لصفحة اللاعب", {
        description: "يمكنك عرض وتعديل بيانات اللاعب",
        duration: 3000
      });
    }
  };

  const createNewPlayer = () => {
    // Reset form and states
    setFormData({
      // Reset to initial state
      email: "",
      name: "",
      password: "",
      phone: "",
      role: "user",
      isActive: true,
      isEmailVerified: true,
      age: "",
      gender: "",
      nationality: "",
      customNationality: "",
      birthCountry: "",
      customBirthCountry: "",
      jop: "",
      roleType: "",
      customRoleType: "",
      position: "",
      customPosition: "",
      status: "",
      experience: 0,
      monthlySalary: { amount: 0, currency: "" },
      yearSalary: { amount: 0, currency: "" },
      contractEndDate: "",
      transferredTo: { club: "", startDate: "", endDate: "", amount: 0 },
      socialLinks: { instagram: "", twitter: "", whatsapp: "", youtube: "" },
      contactInfo: {
        email: "",
        phone: "",
        agent: { name: "", phone: "", email: "" },
      },
      game: "",
      customSport: "",
      isListed: true,
      playerIsActive: true,
    });
    
    setFiles({
      profileImage: null,
      document: null,
      playerVideo: null,
      images: [],
    });
    
    setPreviews({
      profileImage: null,
      images: [],
    });
    
    setCurrentStep(1);
    setShowSuccessDialog(false);
    
    // Show success message for form reset
    toast.success("تم إعادة تعيين النموذج", {
      description: "يمكنك الآن إنشاء لاعب جديد",
      duration: 3000,
    });
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div>
              <h1 className="text-2xl font-bold">إنشاء لاعب جديد</h1>
              <p className="text-blue-100 mt-1">قم بإضافة لاعب جديد إلى النظام</p>
            </div>
          </div>
        </div>

                  {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform ${
                    currentStep >= step
                      ? "bg-[#1e293b] text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {currentStep > step ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-2 mx-3 rounded-full transition-all duration-300 ${
                      currentStep > step ? "bg-[#1e293b]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className={currentStep >= 1 ? "text-[#1e293b] font-medium" : "text-gray-500"}>
              معلومات الحساب
            </span>
            <span className={currentStep >= 2 ? "text-[#1e293b] font-medium" : "text-gray-500"}>
              المعلومات الشخصية
            </span>
            <span className={currentStep >= 3 ? "text-[#1e293b] font-medium" : "text-gray-500"}>
              المعلومات المهنية
            </span>
            <span className={currentStep >= 4 ? "text-[#1e293b] font-medium" : "text-gray-500"}>
              معلومات التواصل
            </span>
            <span className={currentStep >= 5 ? "text-[#1e293b] font-medium" : "text-gray-500"}>
              الوسائط
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <div className="bg-blue-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">معلومات الحساب</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 space-x-reverse">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 ml-5">الحساب نشط</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onChange={handleInputChange}
                    className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">البريد الإلكتروني مُحقق</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <div className="bg-green-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">المعلومات الشخصية</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العمر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="15"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل العمر"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      اختر الجنس
                    </option>
                    {genderOptions.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.value === "male" ? "ذكر" : "أنثى"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنسية <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      اختر الجنسية
                    </option>
                    {nationalities.map((option) => (
                      <option key={option.id} value={option.value}>
                       {option.value === "saudi" ? "السعودية" : 
                         option.value === "uae" ? "الإمارات" :
                         option.value === "egypt" ? "مصر" :
                         option.value === "morocco" ? "المغرب" :
                         option.value === "kuwait" ? "الكويت" :
                         option.value === "qatar" ? "قطر" :
                         option.value === "bahrain" ? "البحرين" :
                         option.value === "oman" ? "عُمان" :
                         option.value === "jordan" ? "الأردن" :
                         option.value === "lebanon" ? "لبنان" :
                         option.value === "syria" ? "سوريا" :
                         option.value === "iraq" ? "العراق" :
                         option.value === "libya" ? "ليبيا" :
                         option.value === "tunisia" ? "تونس" :
                         option.value === "algeria" ? "الجزائر" :
                         option.value === "sudan" ? "السودان" :
                         option.value === "yemen" ? "اليمن" :
                         "أخرى"}
                      </option>
                    ))}
                  </select>
                </div>

                {showCustomFields.nationality && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حدد الجنسية
                    </label>
                    <input
                      type="text"
                      name="customNationality"
                      value={formData.customNationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل الجنسية"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    بلد الولادة
                  </label>
                  <select
                    name="birthCountry"
                    value={formData.birthCountry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>
                      اختر بلد الولادة
                    </option>
                    {nationalities.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.value === "saudi" ? "السعودية" : 
                         option.value === "uae" ? "الإمارات" :
                         option.value === "egypt" ? "مصر" :
                         option.value === "morocco" ? "المغرب" :
                         option.value === "kuwait" ? "الكويت" :
                         option.value === "qatar" ? "قطر" :
                         option.value === "bahrain" ? "البحرين" :
                         option.value === "oman" ? "عُمان" :
                         option.value === "jordan" ? "الأردن" :
                         option.value === "lebanon" ? "لبنان" :
                         option.value === "syria" ? "سوريا" :
                         option.value === "iraq" ? "العراق" :
                         option.value === "libya" ? "ليبيا" :
                         option.value === "tunisia" ? "تونس" :
                         option.value === "algeria" ? "الجزائر" :
                         option.value === "sudan" ? "السودان" :
                         option.value === "yemen" ? "اليمن" :
                         "أخرى"}
                      </option>
                    ))}
                  </select>
                </div>

                {showCustomFields.birthCountry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حدد بلد الولادة
                    </label>
                    <input
                      type="text"
                      name="customBirthCountry"
                      value={formData.customBirthCountry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل بلد الولادة"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Professional Information */}
          {currentStep === 3 && (
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوظيفة <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jop"
                    value={formData.jop}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      اختر الوظيفة
                    </option>
                    <option value="player">لاعب</option>
                    <option value="coach">مدرب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرياضة <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>

                {showCustomFields.sport && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حدد الرياضة
                    </label>
                    <input
                      type="text"
                      name="customSport"
                      value={formData.customSport}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل نوع الرياضة"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الدور
                  </label>
                  <select
                    name="roleType"
                    value={formData.roleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر نوع الدور</option>
                    {availableRoleTypes.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.value === "youth_player" ? "لاعب ناشئ" :
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
                </div>

                {showCustomFields.roleType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حدد نوع الدور
                    </label>
                    <input
                      type="text"
                      name="customRoleType"
                      value={formData.customRoleType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل نوع الدور"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المركز
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>اختر المركز</option>
                    {availablePositions.map((option) => (
                      <option key={option.id} value={option.value}>
                        {translatePosition(option.value)}
                      </option>
                    ))}
                  </select>
                </div>

                {showCustomFields.position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حدد المركز
                    </label>
                    <input
                      type="text"
                      name="customPosition"
                      value={formData.customPosition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل المركز"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنوات الخبرة
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="عدد سنوات الخبرة"
                  />
                </div>
              </div>

              {/* Salary Information */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الراتب</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الراتب الشهري
                    </label>
                    <div className="flex space-x-2 space-x-reverse">
                      <input
                        type="number"
                        name="monthlySalary.amount"
                        value={formData.monthlySalary.amount}
                        onChange={handleInputChange}
                        min="0"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="المبلغ"
                      />
                      <select
                        name="monthlySalary.currency"
                        value={formData.monthlySalary.currency}
                        onChange={handleInputChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.id} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الراتب السنوي
                    </label>
                    <div className="flex space-x-2 space-x-reverse">
                      <input
                        type="number"
                        name="yearSalary.amount"
                        value={formData.yearSalary.amount}
                        onChange={handleInputChange}
                        min="0"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="المبلغ"
                      />
                      <select
                        name="yearSalary.currency"
                        value={formData.yearSalary.currency}
                        onChange={handleInputChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.id} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ انتهاء العقد
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="contractEndDate"
                        value={formData.contractEndDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Information */}
             {(formData.status === "transferred" || formData.status === "contracted")&& (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الانتقال</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        النادي المنتقل إليه
                      </label>
                      <input
                        type="text"
                        name="transferredTo.club"
                        value={formData.transferredTo.club}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="اسم النادي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مبلغ الانتقال
                      </label>
                      <input
                        type="number"
                        name="transferredTo.amount"
                        value={formData.transferredTo.amount}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="المبلغ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ بداية الانتقال
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="transferredTo.startDate"
                          value={formData.transferredTo.startDate}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ نهاية الانتقال
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="transferredTo.endDate"
                          value={formData.transferredTo.endDate}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
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
          )}

          {/* Step 5: Media Uploads */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">الوسائط</h2>
              </div>
              
              {/* File Uploads Component */}
              <MediaUpload 
                files={files}
                setFiles={setFiles}
                previews={previews}
                setPreviews={setPreviews}
                handleFileChange={handleFileChange}
                removeImage={removeImage}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    // Show success message for going back
                    toast.success(`تم العودة للخطوة ${currentStep - 1}`, {
                      description: "يمكنك تعديل البيانات أو العودة للخطوة التالية",
                      duration: 3000
                    });
                  }}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  السابق
                </button>
              )}
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإنشاء...
                  </>
                ) : currentStep === 5 ? (
                  <>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إنشاء اللاعب
                  </>
                ) : (
                  <>
                    التالي
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    
    <SuccessDialog
      open={showSuccessDialog}
      onOpenChange={setShowSuccessDialog}
      playerName={createdPlayerName}
      playerId={createdPlayerId}
      onViewPlayer={navigateToPlayerView}
      onCreateNewPlayer={createNewPlayer}
      onViewAllPlayers={navigateToPlayersList}
    />
    </>
  );
}