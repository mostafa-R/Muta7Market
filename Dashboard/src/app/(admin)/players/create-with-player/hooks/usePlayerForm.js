import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const usePlayerForm = () => {
  const router = useRouter();
  
  // Form State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPlayerId, setCreatedPlayerId] = useState(null);
  const [createdPlayerName, setCreatedPlayerName] = useState("");
  
  // Custom Fields State
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
    game: "",
    customSport: "",
    isListed: true,
    playerIsActive: true,
    isConfirmed: false,
    isPromoted: {
      status: false,
      startDate: null,
      endDate: null,
      type: null,
    },
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

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    
    if (name === "images") {
      const newImageFiles = Array.from(uploadedFiles).filter(file => file.type.startsWith('image/'));
      
      setFiles((prev) => {
        const updatedImages = [...prev.images, ...newImageFiles].slice(0, 4);
        if (prev.images.length + newImageFiles.length > 4) {
          toast.error("تم اقتصار الصور على 4 فقط (الحد الأقصى)", {
            description: "يمكنك إزالة صور أخرى لإضافة صور جديدة",
            duration: 4000
          });
        }
        return { ...prev, images: updatedImages };
      });
      
      const newPreviews = newImageFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => ({ ...prev, images: [...prev.images, ...newPreviews].slice(0, 4) }));
      
      if (newImageFiles.length > 0) {
        toast.success(`تم رفع ${newImageFiles.length} صورة بنجاح`, {
          description: `إجمالي الصور: ${Math.min(files.images.length + newImageFiles.length, 4)}`,
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
    
    toast.success("تم إزالة الصورة بنجاح", {
      description: "يمكنك الآن إضافة صورة جديدة",
      duration: 3000
    });
  };

  // Step validation
  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.name || !formData.password || !formData.phone) {
        toast.error("يرجى ملء جميع الحقول المطلوبة", {
          description: "الحقول المطلوبة: البريد الإلكتروني، الاسم، كلمة المرور، رقم الهاتف",
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
      
      if (!formData.phone.match(/^[0-9]{10,15}$/)) {
        toast.error("يرجى إدخال رقم هاتف صحيح", {
          description: "يجب أن يكون الرقم بين 10-15 رقم ويحتوي على أرقام فقط",
          duration: 4000
        });
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.age || !formData.gender || !formData.nationality || !formData.birthCountry) {
        toast.error("يرجى ملء جميع الحقول المطلوبة", {
          description: "الحقول المطلوبة: العمر، الجنس، الجنسية، بلد الولادة",
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
      
      if (formData.birthCountry === "other" && !formData.customBirthCountry) {
        toast.error("يرجى تحديد بلد الولادة", {
          description: "اكتب بلد الولادة في الحقل المخصص",
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
      
      if (!formData.roleType) {
        toast.error("يرجى اختيار نوع الدور", {
          description: `اختر نوع ${formData.jop === "player" ? "اللاعب" : "المدرب"}`,
          duration: 4000
        });
        return false;
      }
      
      if (formData.roleType === "other" && !formData.customRoleType) {
        toast.error("يرجى تحديد نوع الدور", {
          description: "اكتب نوع الدور في الحقل المخصص",
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
      
      // Position validation only for players
      if (formData.jop === "player") {
        // If sport is "other", we only need to check customPosition
        if (formData.game === "other") {
          if (!formData.customPosition) {
            toast.error("يرجى تحديد المركز", {
              description: "اكتب المركز في الحقل المخصص",
              duration: 4000
            });
            return false;
          }
        } else {
          // For other sports, check position first
          if (!formData.position && !formData.customPosition) {
            toast.error("يرجى اختيار المركز", {
              description: "اختر المركز الذي تلعب فيه",
              duration: 4000
            });
            return false;
          }
          
          // If position is "other", check customPosition
          if (formData.position === "other" && !formData.customPosition) {
            toast.error("يرجى تحديد المركز", {
              description: "اكتب المركز في الحقل المخصص",
              duration: 4000
            });
            return false;
          }
        }
      }
      
      if (!formData.status) {
        toast.error("يرجى اختيار الحالة الحالية", {
          description: "حدد الحالة الحالية للشخص",
          duration: 4000
        });
        return false;
      }
    }
    
    if (currentStep === 4) {
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
      toast.success(`تم إكمال الخطوة ${currentStep} بنجاح`, {
        description: `انتقلت إلى الخطوة ${currentStep + 1}`,
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    toast.success("جاري إنشاء اللاعب", {
      description: "يرجى الانتظار حتى يتم إنشاء اللاعب في النظام",
      duration: 2000,
    });
    
    try {

      
      const formDataToSend = new FormData();
      
      // Append all form data - مطابق لما يتوقعه الباك اند
      const fieldsToStringify = [
        "monthlySalary", 
        "yearSalary", 
        "transferredTo", 
        "socialLinks", 
        "contactInfo",
        "isPromoted"
      ];
      
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        
        // تخطي القيم undefined أو null
        if (value === undefined || value === null) {
          formDataToSend.append(key, "");
          return;
        }
        
        if (typeof value === "object") {
          // فقط stringify الحقول المحددة في الباك اند
          if (fieldsToStringify.includes(key)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            // تحويل Objects إلى string فارغ إذا لم يكن في القائمة
            formDataToSend.append(key, "");
          }
        } else {
          // القيم العادية (strings, numbers, booleans)
          formDataToSend.append(key, String(value));
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



      const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const endpoint = "/admin/users-with-player";
      const fullUrl = `${baseUrl}${endpoint}`;
      
      const response = await axios.post(
        fullUrl,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success("تم إنشاء اللاعب بنجاح", {
        description: `تم إنشاء اللاعب ${formData.name} بنجاح في النظام`,
        duration: 5000,
      });
      
      setCreatedPlayerId(response.data?.user?.player?._id || response.data?.player?._id);
      setCreatedPlayerName(formData.name);
      setShowSuccessDialog(true);
    } catch (error) {
      
      // استخراج رسالة الخطأ من الباك اند
      let errorMessage = "حدث خطأ أثناء إنشاء اللاعب";
      let errorDescription = "";
      
      if (error.response?.data && typeof error.response.data === 'object') {
        // التحقق من وجود رسالة في الباك اند
        const backendData = error.response.data;
        
        // استخراج الرسالة من structures مختلفة
        let backendMessage = "";
        
        if (typeof backendData.message === 'string') {
          backendMessage = backendData.message;
        } else if (typeof backendData.error === 'string') {
          backendMessage = backendData.error;
        } else if (typeof backendData.error === 'object' && backendData.error?.message) {
          backendMessage = backendData.error.message;
        } else if (typeof backendData.error === 'object' && backendData.error?.error) {
          backendMessage = backendData.error.error;
        } else if (backendData.errors && Array.isArray(backendData.errors) && backendData.errors.length > 0) {
          // إذا كان array من الأخطاء
          backendMessage = backendData.errors.map(err => {
            if (typeof err === 'string') return err;
            if (typeof err === 'object' && err.message) return err.message;
            if (typeof err === 'object') return JSON.stringify(err);
            return String(err);
          }).join(', ');
        } else {
          // محاولة أخيرة - تحويل كامل object إلى string
          try {
            backendMessage = JSON.stringify(backendData);
          } catch {
            backendMessage = String(backendData);
          }
        }
        

        
        // التأكد من أن backendMessage هو string وليس فارغ قبل استخدام includes
        if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
          // ترجمة الرسائل الشائعة للعربية
          if (backendMessage.includes("User with this email") && backendMessage.includes("already exists")) {
            errorMessage = "البريد الإلكتروني مستخدم بالفعل";
            errorDescription = "الرجاء استخدام بريد إلكتروني آخر";
          } else if (backendMessage.includes("User with this phone") && backendMessage.includes("already exists")) {
            errorMessage = "رقم الهاتف مستخدم بالفعل";
            errorDescription = "الرجاء استخدام رقم هاتف آخر";
          } else if (backendMessage.includes("validation") || backendMessage.includes("required")) {
            errorMessage = "بيانات غير صحيحة";
            errorDescription = backendMessage;
          } else if (backendMessage.includes("unauthorized") || backendMessage.includes("forbidden")) {
            errorMessage = "ليس لديك صلاحية للقيام بهذا الإجراء";
            errorDescription = "تحقق من صلاحياتك أو قم بتسجيل الدخول مرة أخرى";
          } else {
            // عرض الرسالة الأصلية من الباك اند
            errorMessage = backendMessage;
            errorDescription = `كود الخطأ: ${error.response?.status || 'غير معروف'}`;
          }
        } else {
          // إذا لم نتمكن من الحصول على string message
          errorMessage = "حدث خطأ في الخادم";
          errorDescription = `كود الخطأ: ${error.response?.status || 'غير معروف'} - ${JSON.stringify(backendData)}`;
        }
      } else if (error.code === "NETWORK_ERROR" || error.message.includes("Network Error")) {
        errorMessage = "خطأ في الاتصال بالخادم";
        errorDescription = "تحقق من اتصالك بالإنترنت وحاول مرة أخرى";
      } else if (error.code === "TIMEOUT" || error.message.includes("timeout")) {
        errorMessage = "انتهت مهلة الاتصال";
        errorDescription = "يرجى المحاولة مرة أخرى";
      } else {
        // عرض رسالة الخطأ الأصلية إذا لم نتمكن من تحديد النوع
        errorMessage = error.message || "حدث خطأ غير متوقع";
        errorDescription = "يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني";
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000, // وقت أطول لقراءة الرسالة
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
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
    
    toast.success("تم إعادة تعيين النموذج", {
      description: "يمكنك الآن إنشاء لاعب جديد",
      duration: 3000,
    });
  };

  // Next/Previous step functions
  const nextStep = () => {
    if (validateStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      toast.success(`تم إكمال الخطوة ${currentStep} بنجاح`, {
        description: `انتقلت إلى الخطوة ${currentStep + 1}`,
        duration: 3000
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.success(`تم العودة للخطوة ${currentStep - 1}`, {
        description: "يمكنك تعديل البيانات أو العودة للخطوة التالية",
        duration: 3000
      });
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (previews.profileImage) URL.revokeObjectURL(previews.profileImage);
      previews.images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return {
    // State
    loading,
    currentStep,
    showPassword,
    setShowPassword,
    showSuccessDialog,
    setShowSuccessDialog,
    createdPlayerId,
    createdPlayerName,
    showCustomFields,
    formData,
    files,
    previews,
    
    // Functions
    handleInputChange,
    handleFileChange,
    removeImage,
    handleSubmit,
    validateStep,
    nextStep,
    prevStep,
    navigateToPlayersList,
    navigateToPlayerView,
    createNewPlayer,
  };
};
