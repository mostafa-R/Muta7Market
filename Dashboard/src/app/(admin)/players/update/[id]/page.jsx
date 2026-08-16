"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import BasicInfoSection from "./components/BasicInfoSection";
import ContactInfoSection from "./components/ContactInfoSection";
import FinancialInfoSection from "./components/FinancialInfoSection";
import MediaUploadSection from "./components/MediaUploadSection";
import ProfessionalInfoSection from "./components/ProfessionalInfoSection";
import PromotionSettingsSection from "./components/PromotionSettingsSection";
import { useSportsData } from "./hooks/useSportsData";
import { playerFormSchema } from "./types/scheme";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
  : "http://localhost:5000/api/v1/admin";

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

const initialFormData = {
  name: "",
  age: "",
  gender: "",
  nationality: "",
  customNationality: "",
  birthCountry: "",
  customBirthCountry: "",
  job: "",
  roleType: null,
  customRoleType: "",
  position: null, 
  customPosition: "",
  status: "",
  experience: 0,
  monthlySalary: {
    amount: 0,
    currency: "SAR",
  },
  yearSalary: {
    amount: 0,
    currency: "SAR",
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
  isPromoted: {
    status: false,
    startDate: "",
    endDate: "",
    type: "",
  },
  game: null, 
  customSport: "",
  isListed: true,
  isActive: true,
  isConfirmed: false,
  views: 0,
};

const initialCustomFields = {
  nationality: false,
  birthCountry: false,
  roleType: false,
  position: false,
  sport: false,
};

export default function UpdatePlayerPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(initialCustomFields);
  const [formData, setFormData] = useState(initialFormData);
  
  
  const { getSportBySlug, getPositionBySlug, getRoleTypeBySlug } = useSportsData();

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

  const [existingMedia, setExistingMedia] = useState({
    profileImage: null,
    document: null,
    video: null,
    images: [],
  });

  const computedShowCustomFields = {
    nationality: formData.nationality === "other",
    birthCountry: formData.birthCountry === "other",
    roleType: formData.roleType?.slug === "other",
    position: formData.position?.slug === "other",
    game: formData.game?.slug === "other",
  };

  useEffect(() => {
    const fetchPlayerData = async () => {
        if (!id) {
          toast.error(" معرف اللاعب غير صحيح", {
            style: { direction: 'rtl' }
          });
          setLoading(false);
          return;
        }

      try {
    
        toast.loading("⏳ جاري تحميل بيانات اللاعب...", { 
          id: 'loading-player',
          style: { direction: 'rtl' }
        });

        const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          toast.error(" يجب تسجيل الدخول أولاً", {
            id: 'loading-player',
            style: { direction: 'rtl' }
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/players/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const player = response?.data?.data;
        if (!player) {
          toast.error(" لا توجد بيانات لعرضها", {
            id: 'loading-player',
            style: { direction: 'rtl' }
          });
          setLoading(false);
          return;
        }

 
        toast.success("✅ تم تحميل بيانات اللاعب بنجاح", {
          id: 'loading-player',
          style: { direction: 'rtl' }
        });

        const sportObject = typeof player.game === 'object' ? player.game : getSportBySlug(player.game);
        const positionObject = typeof player.position === 'object' ? player.position : getPositionBySlug(player.game, player.position);
        const roleTypeObject = typeof player.roleType === 'object' ? player.roleType : getRoleTypeBySlug(player.game, player.roleType, player.job);


        setFormData({
          name: player.name || "",
          age: player.age || "",
          gender: player.gender || "",
          nationality: player.nationality || "",
          customNationality: player.customNationality || "",
          birthCountry: player.birthCountry || "",
          customBirthCountry: player.customBirthCountry || "",
          job: player.job || "",
          roleType: roleTypeObject,
          customRoleType: player.customRoleType || "",
          position: positionObject,
          customPosition: player.customPosition || "",
          status: player.status || "",
          experience: player.experience || 0,
          monthlySalary: {
            amount: player.monthlySalary?.amount || 0,
            currency: player.monthlySalary?.currency || "SAR",
          },
          yearSalary: {
            amount: player.yearSalary?.amount || 0,
            currency: player.yearSalary?.currency || "SAR",
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
          isPromoted: {
            status: Boolean(player.isPromoted?.status),
            startDate: player.isPromoted?.startDate ? new Date(player.isPromoted.startDate).toISOString().split('T')[0] : "",
            endDate: player.isPromoted?.endDate ? new Date(player.isPromoted.endDate).toISOString().split('T')[0] : "",
            type: player.isPromoted?.type || "",
          },
          game: sportObject,
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

        setShowCustomFields({
          nationality: player.nationality === "other",
          birthCountry: player.birthCountry === "other",
          roleType: (typeof player.roleType === 'string' && player.roleType === "other") || (typeof player.roleType === 'object' && player.roleType?.slug === "other"),
          position: (typeof player.position === 'string' && player.position === "other") || (typeof player.position === 'object' && player.position?.slug === "other"),
          sport: (typeof player.game === 'string' && player.game === "other") || (typeof player.game === 'object' && player.game?.slug === "other"),
        });

      } catch (error) {
       
        toast.error(` تعذر تحميل بيانات اللاعب: ${errText(error)}`, {
          id: 'loading-player',
          style: { direction: 'rtl' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id, getSportBySlug, getPositionBySlug, getRoleTypeBySlug]);

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    
    if (name === "images") {
      const newImageFiles = Array.from(uploadedFiles).filter(file => file.type.startsWith('image/'));
      
      setFiles((prev) => {
        const updatedImages = [...prev.images, ...newImageFiles].slice(0, 4);
        if (prev.images.length + newImageFiles.length > 4) {
          toast.error("⚠️ تم اقتصار الصور على 4 فقط (الحد الأقصى)", {
            style: {
              background: '#f59e0b',
              color: '#fff',
              direction: 'rtl'
            }
          });
        }
        return { ...prev, images: updatedImages };
      });
      
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

  const removeExistingImage = (index) => {
    setExistingMedia((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingProfileImage = () => {
    setExistingMedia((prev) => ({
      ...prev,
      profileImage: null
    }));
  };

  const removeExistingVideo = () => {
    setExistingMedia((prev) => ({
      ...prev,
      video: null
    }));
  };

  const removeExistingDocument = () => {
    setExistingMedia((prev) => ({
      ...prev,
      document: null
    }));
  };

  useEffect(() => {
    return () => {
      if (previews.profileImage) URL.revokeObjectURL(previews.profileImage);
      previews.images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "game") {
      const sportObject = getSportBySlug(value);
      setFormData(prev => ({
        ...prev,
        game: sportObject,
        position: null, 
        roleType: null,
        customPosition: "",
        customRoleType: "",
        customSport: sportObject?.slug === "other" ? prev.customSport : "",
      }));
      return;
    }
    if (name === "position") {
      const positionObject = getPositionBySlug(formData.game?.slug, value);
      setFormData(prev => ({
        ...prev,
        position: positionObject,
        customPosition: positionObject?.slug === "other" ? prev.customPosition : "",
      }));
      return;
    }
    if (name === "roleType") {
      const roleTypeObject = getRoleTypeBySlug(formData.game?.slug, value, formData.job);
      setFormData(prev => ({
        ...prev,
        roleType: roleTypeObject,
        customRoleType: roleTypeObject?.slug === "other" ? prev.customRoleType : "",
      }));
      return;
    }

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
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        if (name === "job") {
          updated.roleType = null;
          updated.customRoleType = "";
          if (value === "coach") {
            updated.position = null;
            updated.customPosition = "";
          }
        }
        
        const fieldsWithCustomOption = {
          nationality: "customNationality",
          birthCountry: "customBirthCountry",
        };

        if (fieldsWithCustomOption[name] && value !== "other") {
          updated[fieldsWithCustomOption[name]] = "";
        }

        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    toast.loading("⏳ جاري تحديث بيانات اللاعب...", { 
      id: 'update-player',
      style: { direction: 'rtl', fontSize: '14px' }
    });
    
    if (!validateForm()) {
      toast.dismiss('update-player');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      if (formData.name) formDataToSend.append("name", formData.name);
      if (formData.age) formDataToSend.append("age", String(formData.age));
      if (formData.gender) formDataToSend.append("gender", formData.gender);
      if (formData.nationality) formDataToSend.append("nationality", formData.nationality);
      if (formData.customNationality) formDataToSend.append("customNationality", formData.customNationality);
      if (formData.birthCountry) formDataToSend.append("birthCountry", formData.birthCountry);
      if (formData.customBirthCountry) formDataToSend.append("customBirthCountry", formData.customBirthCountry);
      if (formData.job) formDataToSend.append("job", formData.job);
      
      if (formData.roleType) formDataToSend.append("roleType", JSON.stringify(formData.roleType));
      if (formData.customRoleType) formDataToSend.append("customRoleType", formData.customRoleType);
      if (formData.position) formDataToSend.append("position", JSON.stringify(formData.position));
      if (formData.customPosition) formDataToSend.append("customPosition", formData.customPosition);
      if (formData.status) formDataToSend.append("status", formData.status);
      if (formData.game) formDataToSend.append("game", JSON.stringify(formData.game));
      if (formData.customSport) formDataToSend.append("customSport", formData.customSport);
      if (formData.experience !== undefined) formDataToSend.append("experience", String(formData.experience));
      
      formDataToSend.append("isListed", String(formData.isListed));
      formDataToSend.append("isActive", String(formData.isActive));
      formDataToSend.append("isConfirmed", String(formData.isConfirmed));
      if (formData.views !== undefined) formDataToSend.append("views", String(formData.views));

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
      
    
      
      toast.success("🎉 تم تحديث بيانات اللاعب بنجاح! سيتم التوجيه الآن...", {
        id: 'update-player',
        duration: 3000,
        style: {
          background: '#22c55e',
          color: '#fff',
          direction: 'rtl',
          fontSize: '16px',
          padding: '16px'
        }
      });
      
      setTimeout(() => {
        router.push(`/players/table`);
      }, 1500);
      
    } catch (error) {
      console.error("❌ خطأ في تحديث اللاعب:", error);
      
      const response = error?.response;
      const data = response?.data;
      const status = response?.status;
   
      
    
      toast.dismiss('update-player');
      
    
      if (status === 400) {
        if (data?.error?.stack) {
          const validationErrors = data.error.stack;
         
          
          Object.keys(validationErrors).forEach((field, index) => {
            const fieldErrors = validationErrors[field];
            const errorMsg = Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors;
            
            setTimeout(() => {
              toast.error(`❌ خطأ في ${field}: ${errorMsg}`, {
                duration: 5000,
                style: {
                  background: '#dc2626',
                  color: '#fff',
                  direction: 'rtl',
                  fontSize: '14px'
                }
              });
            }, index * 300);
          });
        } else {
          toast.error(`❌ خطأ في البيانات: ${data?.message || 'بيانات غير صالحة'}`, {
            duration: 5000,
            style: {
              background: '#dc2626',
              color: '#fff',
              direction: 'rtl'
            }
          });
        }
      } else if (status === 401) {
        toast.error("❌ غير مسموح! يرجى تسجيل الدخول مرة أخرى", {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', direction: 'rtl' }
        });
      } else if (status === 403) {
        toast.error("❌ ليس لديك صلاحية لتعديل هذا اللاعب!", {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', direction: 'rtl' }
        });
      } else if (status === 404) {
        toast.error("❌ اللاعب غير موجود!", {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', direction: 'rtl' }
        });
      } else if (status >= 500) {
        toast.error("❌ خطأ في الخادم! يرجى المحاولة مرة أخرى", {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', direction: 'rtl' }
        });
      } else {
        const errorMessage = error.message || data?.message || "حدث خطأ غير متوقع";
        toast.error(`❌ فشل التحديث: ${errorMessage}`, {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', direction: 'rtl' }
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const { error } = playerFormSchema.validate(formData, {
      abortEarly: false, 
      allowUnknown: true, 
    });

    if (error) {
      error.details.forEach((err, index) => {
        setTimeout(() => {
          toast.error(`⚠️ ${err.message}`, {
            style: { direction: 'rtl', background: '#f59e0b', color: '#fff', textAlign: 'right' },
            duration: 4000 + index * 500,
          });
        }, index * 300);
      });
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
    <>
      <Toaster position="top-center" />
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
                <h1 className="text-3xl font-bold text-gray-900">تعديل بيانات اللاعب</h1>
                <p className="text-gray-600 mt-1">قم بتحديث وتعديل بيانات اللاعب في النظام</p>
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
          <BasicInfoSection 
            formData={formData}
            handleInputChange={handleInputChange}
            showCustomFields={computedShowCustomFields}
          />

          {/* Professional Information Section */}
          <ProfessionalInfoSection 
            formData={formData}
            handleInputChange={handleInputChange}
            showCustomFields={computedShowCustomFields}
          />

          {/* Financial Information Sections */}
          <FinancialInfoSection 
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Contact and Social Information Sections */}
          <ContactInfoSection 
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Promotion and System Settings Sections */}
          <PromotionSettingsSection 
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Media Upload Section */}
          <MediaUploadSection 
            files={files}
            previews={previews}
            existingMedia={existingMedia}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            removeExistingImage={removeExistingImage}
            removeExistingProfileImage={removeExistingProfileImage}
            removeExistingVideo={removeExistingVideo}
            removeExistingDocument={removeExistingDocument}
          />

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
    </>
  );
}