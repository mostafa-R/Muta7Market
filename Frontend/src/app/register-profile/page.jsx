"use client";
import { Button } from "@/app/component/ui/button";
import axios from "axios";
import { useFormik } from "formik";
import { Save, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import { FinancialInfoCard } from "./components/FinancialInfoCard";
import { MediaUploadCard } from "./components/MediaUploadCard";
import PaymentBtn from "./components/PaymentBtn";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { SocialLinksCard } from "./components/SocialLinksCard";
import { SportsInfoCard } from "./components/SportsInfoCard";
import { TermsCard } from "./components/TermsCard";
import { TransferInfoCard } from "./components/TransferInfoCard";
import { playerFormSchema } from "./types/schema";

// Helpers to extract API messages consistently
const getSuccessMessage = (response, fallback) => {
  return (
    response?.data?.message ||
    response?.data?.msg ||
    response?.message ||
    fallback
  );
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

export default function RegisterProfile() {
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/webm"];
  const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const idParam = searchParams?.get("id");
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);

  // Re-add robust upload helper with fieldName support and cookie token
  const uploadFile = async (file, endpoint, fieldName = "file") => {
    const token = localStorage.getItem("token"); // FIX: use same source
    if (!token) {
      throw new Error("يرجى تسجيل الدخول");
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      setUploadStatus("جارٍ الرفع...");
      const response = await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });
      setUploadStatus("تم رفع الملف بنجاح!");
      setTimeout(() => setUploadStatus(null), 3000);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err, "فشل في رفع الملف");
      setUploadStatus("فشل في رفع الملف");
      setTimeout(() => setUploadStatus(null), 3000);
      throw new Error(message);
    }
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

  const appendFormData = (fd, data, parentKey = "") => {
    if (data == null) return;
    if (Array.isArray(data)) {
      data.forEach((v, i) => appendFormData(fd, v, `${parentKey}[${i}]`));
      return;
    }
    if (
      typeof data === "object" &&
      !(data instanceof File) &&
      !(data instanceof Blob)
    ) {
      Object.entries(data).forEach(([k, v]) => {
        appendFormData(fd, v, parentKey ? `${parentKey}[${k}]` : k);
      });
      return;
    }
    fd.append(parentKey, data);
  };

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("يرجى تسجيل الدخول"); return; }
  
    try {
      setIsLoading(true);
      const fd = new FormData();
  
      // files
      if (values.profilePictureFile) fd.append("profileImage", values.profilePictureFile);
      if (values.documentFile) {
        fd.append("document", values.documentFile);
        if (values.documentTitle) fd.append("documentTitle", values.documentTitle);
      }
  
      // map experience -> expreiance (backend field name)
      const payload = { ...values };
      if (payload.experience !== undefined) {
        payload.expreiance = Number(payload.experience) || 0;
        delete payload.experience;
      }
  
      // nested objects that backend expects as objects:
      const jsonKeys = [
        "monthlySalary",
        "yearSalary",
        "transferredTo",
        "socialLinks",
        "isPromoted",
        "contactInfo",
      ];
  
      // append primitives
      Object.entries(payload).forEach(([k, v]) => {
        if (["profilePictureFile","profilePicturePreview","documentFile","documentTitle","agreeToTerms","media","seo"].includes(k)) return;
        if (jsonKeys.includes(k)) return; // handle below
  
        if (v !== undefined && v !== null) fd.append(k, v);
      });
  
      // append JSON for nested objects
      jsonKeys.forEach((k) => {
        if (payload[k] !== undefined) {
          fd.append(k, JSON.stringify(payload[k]));
        }
      });
  
      const isUpdate = Boolean(idParam);
      const url = isUpdate ? `${API_URL}/players/${idParam}` : `${API_URL}/players/createPlayer`;
      const method = isUpdate ? "patch" : "post";
  
      const resp = await axios({
        method, url, data: fd,
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => {  
          if (e.total) setUploadProgress(Math.round((e.loaded*100)/e.total));
        },
      });
  
      toast.success(getSuccessMessage(resp, isUpdate ? "تم التحديث" : "تم الإنشاء"));
      if (!isUpdate) setCanPay(true);
    } catch (err) {
      // show backend validation details to see exactly what's wrong
      console.error("ERR 400 payload details:", err?.response?.data);
      toast.error(getErrorMessage(err, idParam ? "فشل التحديث" : "فشل الإنشاء"));
    } finally {
      setIsLoading(false);
    }
  };
  

  const initialValues = {
    name: "",
    age: "",
    gender: "",
    nationality: "",
    jop: "",
    position: "",
    status: "",
    experience: "",
    monthlySalary: { amount: 0, currency: "$" },
    yearSalary: { amount: 0, currency: "$" },
    contractEndDate: "",
    transferredTo: { club: "", date: "", amount: "" },
    media: {
      profileImage: { url: "", publicId: "" },
      videos: [],
      documents: [],
    },
    socialLinks: { instagram: "", twitter: "", whatsapp: "", youtube: "" },
    isPromoted: { status: false, startDate: "", endDate: "", type: "" },
    contactInfo: {
      isHidden: true,
      email: "",
      phone: "",
      agent: { name: "", phone: "", email: "" },
    },
    game: "",
    isActive: false,
    views: 0,
    seo: {
      metaTitle: { en: "", ar: "" },
      metaDescription: { en: "", ar: "" },
      keywords: [],
    },
    profilePicturePreview: "",
    profilePictureFile: undefined,
    agreeToTerms: false,

    documentFile: undefined,
    documentTitle: "",
  };

  // const formik = useFormik({
  //   initialValues,
  //   validate: (values) => {
  //     const { error } = playerFormSchema.validate(values, {
  //       abortEarly: false,
  //     });
  //     if (!error) return {};
  //     const errors = {};
  //     error.details.forEach((detail) => {
  //       const path = detail.path.join(".");
  //       errors[path] = detail.message;
  //     });
  //     return errors;
  //   },
  //   validateOnChange: true,
  //   validateOnBlur: true,
  //   onSubmit: handleSubmit,
  // });

  const formik = useFormik({
    initialValues,
    validate: (values) => {},
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    const fetchPlayer = async () => {
      if (idParam) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API_URL}/players/${idParam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const player = response.data.data;

          const mergedValues = {
            ...initialValues,
            name: player.name || "",
            age: player.age ? String(player.age) : "",
            gender: player.gender,
            nationality: player.nationality || "",
            jop: player.jop || "",
            position: player.position || "",
            status: player.status || "",
            experience: player.expreiance ? Number(player.expreiance) || 0 : 0,
            monthlySalary: player.monthlySalary || {
              amount: 0,
              currency: "SAR",
            },
            yearSalary: player.yearSalary || { amount: 0, currency: "SAR" },
            contractEndDate: player.contractEndDate || "",
            transferredTo: player.transferredTo || {
              club: "",
              date: "",
              amount: "",
            },
            media: {
              profileImage: player.media?.profileImage || {
                url: "",
                publicId: "",
              },
              videos: player.media?.videos || [],
              documents: player.media?.documents || [],
            },
            socialLinks: player.socialLinks || {
              instagram: "",
              twitter: "",
              whatsapp: "",
              youtube: "",
            },
            isPromoted: {
              status: player.isPromoted?.status || false,
              startDate: player.isPromoted?.startDate || "",
              endDate: player.isPromoted?.endDate || "",
              type: player.isPromoted?.type || "",
            },
            contactInfo: player.contactInfo || {
              isHidden: true,
              email: "",
              phone: "",
              agent: { name: "", phone: "", email: "" },
            },
            game: player.game || "",
            isActive: player.isActive || false,
            views: player.views || 0,
            seo: player.seo || {
              metaTitle: { en: "", ar: "" },
              metaDescription: { en: "", ar: "" },
              keywords: [],
            },
            profilePicturePreview: player.media?.profileImage?.url || "",
            profilePictureFile: undefined,
            agreeToTerms: true,
          };

          setPlayer(player);
          formik.setValues(mergedValues);
          toast.success(
            getSuccessMessage(response, "تم تحميل بيانات اللاعب بنجاح")
          );
        } catch (err) {
          toast.error(getErrorMessage(err, "فشل في جلب بيانات اللاعب"));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPlayer();
  }, [idParam, API_URL]);

  const handleFileValidation = (file, allowedTypes, maxSize) => {
    if (!file) return "لم يتم اختيار ملف";
    if (!allowedTypes.includes(file.type)) return "نوع الملف غير مدعوم";
    if (file.size > maxSize) return "حجم الملف كبير جدًا (الحد الأقصى 4MB)";
    return null;
  };

  // const handleFormSubmit = (e) => {
  //   e.preventDefault();
  //   formik.handleSubmit(e);
  // };

  const handleResetForm = () => {
    formik.resetForm();
    setCanPay(false);
    setUploadProgress(0);
    setUploadStatus(null);
    toast.info("تم إعادة تعيين النموذج");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" dir="rtl" />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {idParam ? "تعديل بياناتك" : "سجل بياناتك"}
          </h1>
          <p className="text-xl text-[#7e8c9a] max-w-2xl mx-auto">
            {idParam
              ? "قم بتعديل ملفك الشخصي الاحترافي"
              : "أنشئ ملفك الشخصي الاحترافي وابدأ رحلتك الرياضية معنا"}
          </p>
        </div>

        {isLoading && <p className="text-center">جارٍ التحميل...</p>}

        {uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center mt-2">
              {uploadStatus || `تقدم الرفع: ${uploadProgress}%`}
            </p>
          </div>
        )}

        {!isLoading && (
          <form onSubmit={formik.handleSubmit} className="space-y-6 p-4 w-full">
            <PersonalInfoCard
              formik={formik}
              handleFileValidation={handleFileValidation}
              ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
              MAX_FILE_SIZE={MAX_FILE_SIZE}
            />
            <SportsInfoCard formik={formik} />
            <FinancialInfoCard formik={formik} />
            <TransferInfoCard formik={formik} />
            <SocialLinksCard formik={formik} />
            <MediaUploadCard
              formik={formik}
              handleFileValidation={handleFileValidation}
              ALLOWED_VIDEO_TYPES={ALLOWED_VIDEO_TYPES}
              ALLOWED_DOCUMENT_TYPES={ALLOWED_DOCUMENT_TYPES}
              MAX_FILE_SIZE={MAX_FILE_SIZE}
            />
            <TermsCard formik={formik} />
            <div className="flex justify-center space-x-4">
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-1/2 bg-[hsl(var(--primary))] text-white flex items-center justify-center"
              >
                <Save className="w-5 h-5 ml-2" />
                {idParam ? "حفظ التغييرات" : "إنشاء الملف الشخصي"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                className="w-1/2 border-gray-300 flex items-center justify-center"
              >
                <X className="w-5 h-5 ml-2" />
                إلغاء
              </Button>
            </div>
            {!idParam && canPay && (
              <>
                <div className="text-center text-lg text-gray-700 mb-4">
                  ادفع الاشتراك لإكمال التفعيل
                </div>
                <PaymentBtn />
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
