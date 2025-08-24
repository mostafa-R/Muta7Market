"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
  : "http://localhost:5000/api/v1/admin";

// Helper function for error messages
const errText = (err, fallback = "حدث خطأ") => {
  const r = err?.response;
  const d = r?.data ?? {};
  const cands = [
    d.message,
    d.msg,
    d.error?.message,
    typeof d.error === "string" ? d.error : undefined,
    d.data?.message,
    err?.message,
  ].filter(Boolean);
  return cands.find((s) => typeof s === "string" && s.trim()) || fallback;
};

export default function UpdatePlayerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState({
    nationality: false,
    birthCountry: false,
    roleType: false,
    position: false,
    sport: false,
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

  // Existing media from API
  const [existingMedia, setExistingMedia] = useState({
    profileImage: null,
    document: null,
    video: null,
    images: [],
  });

  // Form Data State
  const [formData, setFormData] = useState({
    // Basic player data
      name: "",
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
    isActive: true,
    isConfirmed: false,
    views: 0,
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

  // Fetch existing player data
  useEffect(() => {
    const fetchPlayerData = async () => {
        if (!id) {
        toast.error("معرف اللاعب غير صحيح");
          setLoading(false);
          return;
        }

      try {
        const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          toast.error("يجب تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/players/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const player = response?.data?.data;
        if (!player) {
          toast.error("لا توجد بيانات لعرضها");
          setLoading(false);
          return;
        }

        // Populate form with player data
        setFormData({
          name: player.name || "",
          age: player.age || "",
          gender: player.gender || "",
          nationality: player.nationality || "",
          customNationality: player.customNationality || "",
          birthCountry: player.birthCountry || "",
          customBirthCountry: player.customBirthCountry || "",
          jop: player.jop || "",
          roleType: player.roleType || "",
          customRoleType: player.customRoleType || "",
          position: player.position || "",
          customPosition: player.customPosition || "",
          status: player.status || "",
          experience: player.expreiance || 0,
          monthlySalary: {
            amount: player.monthlySalary?.amount || 0,
            currency: player.monthlySalary?.currency || "",
          },
          yearSalary: {
            amount: player.yearSalary?.amount || 0,
            currency: player.yearSalary?.currency || "",
          },
          contractEndDate: player.contractEndDate ? new Date(player.contractEndDate).toISOString().split('T')[0] : "",
          transferredTo: {
            club: player.transferredTo?.club || "",
            startDate: player.transferredTo?.startDate ? new Date(player.transferredTo.startDate).toISOString().split('T')[0] : "",
            endDate: player.transferredTo?.endDate ? new Date(player.transferredTo.endDate).toISOString().split('T')[0] : "",
            amount: player.transferredTo?.amount || 0,
          },
          socialLinks: {
            instagram: player.socialLinks?.instagram || "",
            twitter: player.socialLinks?.twitter || "",
            whatsapp: player.socialLinks?.whatsapp || "",
            youtube: player.socialLinks?.youtube || "",
          },
          contactInfo: {
            email: player.contactInfo?.email || "",
            phone: player.contactInfo?.phone || "",
            agent: {
              name: player.contactInfo?.agent?.name || "",
              phone: player.contactInfo?.agent?.phone || "",
              email: player.contactInfo?.agent?.email || "",
            },
          },
          game: player.game || "",
          customSport: player.customSport || "",
          isListed: Boolean(player.isListed),
          isActive: Boolean(player.isActive),
          isConfirmed: Boolean(player.isConfirmed),
          views: player.views || 0,
        });

        // Set existing media data
        setExistingMedia({
          profileImage: player.media?.profileImage || null,
          document: player.media?.document || null,
          video: player.media?.video || null,
          images: player.media?.images || [],
        });

        // Set custom field visibility
        setShowCustomFields({
          nationality: player.nationality === "other",
          birthCountry: player.birthCountry === "other",
          roleType: player.roleType === "other",
          position: player.position === "other",
          sport: player.game === "other",
        });

      } catch (error) {
        console.error("Error fetching player:", error);
        toast.error(errText(error, "تعذر جلب بيانات اللاعب"));
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    
    if (name === "images") {
      const newImageFiles = Array.from(uploadedFiles).filter(file => file.type.startsWith('image/'));
      
      setFiles((prev) => {
        const updatedImages = [...prev.images, ...newImageFiles].slice(0, 4);
        if (prev.images.length + newImageFiles.length > 4) {
          toast.error("تم اقتصار الصور على 4 فقط (الحد الأقصى)", {
            style: {
              background: '#ff5555',
              color: '#fff',
              direction: 'rtl'
            }
          });
        }
        return { ...prev, images: updatedImages };
      });
      
      // Create previews for new images
      const newPreviews = newImageFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => ({ ...prev, images: [...prev.images, ...newPreviews].slice(0, 4) }));
    } else {
      const file = uploadedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      
      if (name === "profileImage" && file) {
        setPreviews((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
      }
    }
  };

  // Remove image
  const removeImage = (index) => {
    setFiles((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages };
    });
    setPreviews((prev) => {
      const removedUrl = prev.images[index];
      if (removedUrl) URL.revokeObjectURL(removedUrl);
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
  };

  // Remove existing media
  const removeExistingImage = (index) => {
    setExistingMedia((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Remove existing profile image
  const removeExistingProfileImage = () => {
    setExistingMedia((prev) => ({
      ...prev,
      profileImage: null
    }));
  };

  // Remove existing video
  const removeExistingVideo = () => {
    setExistingMedia((prev) => ({
      ...prev,
      video: null
    }));
  };

  // Remove existing document
  const removeExistingDocument = () => {
    setExistingMedia((prev) => ({
      ...prev,
      document: null
    }));
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (previews.profileImage) URL.revokeObjectURL(previews.profileImage);
      previews.images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      if (formData.name) formDataToSend.append("name", formData.name);
      if (formData.age) formDataToSend.append("age", String(formData.age));
      if (formData.gender) formDataToSend.append("gender", formData.gender);
      if (formData.nationality) formDataToSend.append("nationality", formData.nationality);
      if (formData.customNationality) formDataToSend.append("customNationality", formData.customNationality);
      if (formData.birthCountry) formDataToSend.append("birthCountry", formData.birthCountry);
      if (formData.customBirthCountry) formDataToSend.append("customBirthCountry", formData.customBirthCountry);
      if (formData.jop) formDataToSend.append("jop", formData.jop);
      if (formData.roleType) formDataToSend.append("roleType", formData.roleType);
      if (formData.customRoleType) formDataToSend.append("customRoleType", formData.customRoleType);
      if (formData.position) formDataToSend.append("position", formData.position);
      if (formData.customPosition) formDataToSend.append("customPosition", formData.customPosition);
      if (formData.status) formDataToSend.append("status", formData.status);
      if (formData.game) formDataToSend.append("game", formData.game);
      if (formData.customSport) formDataToSend.append("customSport", formData.customSport);
      if (formData.experience !== undefined) formDataToSend.append("expreiance", String(formData.experience));
      
      // Boolean fields
      formDataToSend.append("isListed", String(formData.isListed));
      formDataToSend.append("isActive", String(formData.isActive));
      formDataToSend.append("isConfirmed", String(formData.isConfirmed));
      if (formData.views !== undefined) formDataToSend.append("views", String(formData.views));

      // Nested objects as JSON
      if (formData.monthlySalary.amount || formData.monthlySalary.currency) {
        formDataToSend.append("monthlySalary", JSON.stringify(formData.monthlySalary));
      }
      if (formData.yearSalary.amount || formData.yearSalary.currency) {
        formDataToSend.append("yearSalary", JSON.stringify(formData.yearSalary));
      }
      if (formData.contractEndDate) formDataToSend.append("contractEndDate", formData.contractEndDate);
      
      if (formData.transferredTo.club || formData.transferredTo.startDate || formData.transferredTo.endDate || formData.transferredTo.amount) {
        formDataToSend.append("transferredTo", JSON.stringify(formData.transferredTo));
      }
      
      if (formData.socialLinks.instagram || formData.socialLinks.twitter || formData.socialLinks.whatsapp || formData.socialLinks.youtube) {
        formDataToSend.append("socialLinks", JSON.stringify(formData.socialLinks));
      }
      
      if (formData.contactInfo.email || formData.contactInfo.phone || formData.contactInfo.agent.name || formData.contactInfo.agent.phone || formData.contactInfo.agent.email) {
        formDataToSend.append("contactInfo", JSON.stringify(formData.contactInfo));
      }

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

      // Include existing media info (for backend to handle properly)
      formDataToSend.append("existingMedia", JSON.stringify(existingMedia));

      const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await axios.patch(
        `${API_BASE}/players/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      // Show success message
      toast.success("تم تحديث بيانات اللاعب بنجاح", {
        style: {
          background: '#22c55e',
          color: '#fff',
          direction: 'rtl'
        }
      });
      
      // Optionally navigate back or to player view
      // router.push(`/admin/players/view/${id}`);
      
    } catch (error) {
      console.error("Error updating player:", error);
      toast.error(errText(error, "فشل في تحديث بيانات اللاعب"));
    } finally {
      setSubmitting(false);
    }
  };

  // Basic form validation
  const validateForm = () => {
    const toastStyle = {
      style: {
        background: '#ff5555',
        color: '#fff',
        direction: 'rtl'
      },
      duration: 4000
    };

    if (!formData.name) {
      toast.error("يرجى إدخال اسم اللاعب", toastStyle);
      return false;
    }

    if (formData.age && (formData.age < 15 || formData.age > 50)) {
      toast.error("العمر يجب أن يكون بين 15 و 50", toastStyle);
      return false;
    }

    if (formData.contactInfo.email && !formData.contactInfo.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح للتواصل", toastStyle);
      return false;
    }

    if (formData.socialLinks.instagram && !formData.socialLinks.instagram.includes('instagram.com')) {
      toast.error("يرجى إدخال رابط إنستجرام صحيح", toastStyle);
      return false;
    }

    if (formData.socialLinks.youtube && !formData.socialLinks.youtube.includes('youtube.com')) {
      toast.error("يرجى إدخال رابط يوتيوب صحيح", toastStyle);
      return false;
    }

    return true;
  };

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-red-600">استخدم المسار: /players/update/&lt;id&gt;</p>
      </div>
    );
  }

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 max-w-md mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">جاري التحميل</h3>
            <p className="text-gray-600">يرجى الانتظار، جاري تحميل بيانات اللاعب...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
          <div>
                <h1 className="text-3xl font-bold text-gray-900">تعديل بيانات المدرب</h1>
                <p className="text-gray-600 mt-1">قم بتحديث وتعديل بيانات المدرب في النظام</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                رجوع
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
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
                />
          </div>

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
                />
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الجنس
                </label>
            <select
              name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                >
                  <option value="">اختر الجنس</option>
                  {genderOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.value === "male" ? "ذكر" : "أنثى"}
                    </option>
                  ))}
            </select>
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الجنسية
                </label>
                <select
              name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                >
                  <option value="">اختر الجنسية</option>
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

          {/* Professional Information Section */}
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
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الوظيفة
                </label>
                <select
              name="jop"
                  value={formData.jop}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            >
                  <option value="">اختر الوظيفة</option>
              <option value="player">لاعب</option>
              <option value="coach">مدرب</option>
            </select>
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الرياضة
                </label>
                <select
                  name="game"
                  value={formData.game}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                >
                  <option value="">اختر الرياضة</option>
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

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  المركز
                </label>
                <select
              name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                >
                  <option value="">اختر المركز</option>
                  {availablePositions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {translatePosition(option.value)}
                    </option>
                  ))}
                </select>
              </div>

              {showCustomFields.position && (
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
                      {option.value === "available" ? "متاح" :
                       option.value === "contracted" ? "متعاقد" :
                       "منتقل"}
                    </option>
                  ))}
                </select>
              </div>

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

          {/* Salary Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-8">
              <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-xl">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">معلومات الراتب</h3>
                <p className="text-sm text-gray-500 mt-1">الرواتب والمكافآت المالية</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الراتب الشهري
                </label>
                <div className="flex space-x-2 space-x-reverse">
            <input
                    type="number"
                    name="monthlySalary.amount"
                    value={formData.monthlySalary.amount}
                    onChange={handleInputChange}
                    min="0"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="المبلغ"
                  />
                  <select
                    name="monthlySalary.currency"
                    value={formData.monthlySalary.currency}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الراتب السنوي
                </label>
                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="number"
                    name="yearSalary.amount"
                    value={formData.yearSalary.amount}
                    onChange={handleInputChange}
                    min="0"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="المبلغ"
                  />
                  <select
                    name="yearSalary.currency"
                    value={formData.yearSalary.currency}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  تاريخ انتهاء العقد
                </label>
                <input
                  type="date"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Transfer Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-8">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-xl">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">معلومات الانتقال</h3>
                <p className="text-sm text-gray-500 mt-1">تفاصيل العقود والانتقالات</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  النادي المنتقل إليه
                </label>
                <input
                  type="text"
                  name="transferredTo.club"
                  value={formData.transferredTo.club}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                  placeholder="اسم النادي"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  مبلغ الانتقال
                </label>
                <input
                  type="number"
                  name="transferredTo.amount"
                  value={formData.transferredTo.amount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                  placeholder="المبلغ"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  تاريخ بداية الانتقال
                </label>
                <input
                  type="date"
                  name="transferredTo.startDate"
                  value={formData.transferredTo.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  تاريخ نهاية الانتقال
                </label>
                <input
                  type="date"
                  name="transferredTo.endDate"
                  value={formData.transferredTo.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <h4 className="text-md font-medium mt-6 mb-4">معلومات الوكيل</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-8">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-xl">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">إعدادات النظام</h3>
                <p className="text-sm text-gray-500 mt-1">حالة وإعدادات الملف الشخصي</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">مدرج في القوائم</span>
                    <p className="text-xs text-gray-500">ظهور في القوائم العامة</p>
                  </div>
                </div>
                <input
              type="checkbox"
                  name="isListed"
                  checked={formData.isListed}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
          </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">نشط</span>
                    <p className="text-xs text-gray-500">الحساب فعال ومتاح</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">مؤكد</span>
                    <p className="text-xs text-gray-500">تم تأكيد البيانات</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="isConfirmed"
                  checked={formData.isConfirmed}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-8">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">الوسائط والملفات</h2>
                <p className="text-sm text-gray-500 mt-1">الصور والفيديوهات والمستندات</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الصورة الشخصية
                </label>
                
                {/* Show existing profile image if available */}
                {existingMedia.profileImage && !previews.profileImage && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-blue-800">الصورة الحالية:</p>
                      <button
                        type="button"
                        onClick={removeExistingProfileImage}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        title="حذف الصورة"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="relative inline-block">
                      <img
                        src={existingMedia.profileImage.url}
                        alt="الصورة الشخصية الحالية"
                        className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* Show new preview if uploaded */}
                {previews.profileImage && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-3">الصورة الجديدة:</p>
                    <div className="relative inline-block">
                      <img
                        src={previews.profileImage}
                        alt="معاينة الصورة الشخصية الجديدة"
                        className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-green-300"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  مستند (CV/السيرة الذاتية)
                </label>
                
                {/* Show existing document if available */}
                {existingMedia.document && (
                  <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-3">المستند الحالي:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">{existingMedia.document.title}</span>
                          <span className="text-xs text-gray-500">{existingMedia.document.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <a
                          href={existingMedia.document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          عرض
                        </a>
            <button
              type="button"
                          onClick={removeExistingDocument}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          title="حذف المستند"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
            </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  name="document"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {files.document && (
                  <p className="text-sm text-green-600 mt-2">
                    مستند جديد محدد: {files.document.name}
                  </p>
                )}
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  مقطع فيديو
                </label>
                
                {/* Show existing video if available */}
                {existingMedia.video && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-sm font-medium text-purple-800 mb-3">الفيديو الحالي:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 01.293.707V14" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block truncate max-w-xs">{existingMedia.video.title}</span>
                          <span className="text-xs text-gray-500">مدة: {existingMedia.video.duration || 'غير محدد'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <a
                          href={existingMedia.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          عرض
                        </a>
                        <button
                          type="button"
                          onClick={removeExistingVideo}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          title="حذف الفيديو"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  name="playerVideo"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {files.playerVideo && (
                  <p className="text-sm text-green-600 mt-2">
                    فيديو جديد محدد: {files.playerVideo.name}
                  </p>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  الصور الإضافية (حد أقصى 4)
                </label>
                
                {/* Show existing images */}
                {existingMedia.images.length > 0 && (
                  <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-3">الصور الحالية:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {existingMedia.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`صورة إضافية ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-md border-2 border-white transition-transform duration-200 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-md"
                          >
                            ×
            </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                            {index + 1}
          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  name="images"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* Show new image previews */}
                {previews.images.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-3">صور جديدة محددة:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {previews.images.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`معاينة الصورة الجديدة ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-md border-2 border-green-300 transition-transform duration-200 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-md"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                            جديد
    </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-8 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                سيتم حفظ التغييرات وتحديث بيانات اللاعب في النظام
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}