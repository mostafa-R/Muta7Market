"use client";
import { Button } from "@/app/component/ui/button";
import axios from "axios";
import { useFormik } from "formik";
import { Save, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import LoadingSpinner from "../component/LoadingSpinner";
import { ContactInfoCard } from "./components/ContactInfoCard";
import { FinancialInfoCard } from "./components/FinancialInfoCard";
import { MediaUploadCard } from "./components/MediaUploadCard";
import PaymentBtn from "./components/PaymentBtn";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { SocialLinksCard } from "./components/SocialLinksCard";
import { SportsInfoCard } from "./components/SportsInfoCard";
import { TermsCard } from "./components/TermsCard";
import { TransferInfoCard } from "./components/TransferInfoCard";
import { playerFormSchema } from "./types/schema";
import { validateWithJoi } from "./types/validateWithJoi";

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
  const firstFromErrors = (() => {
    try {
      const errs = error?.response?.data?.errors;
      if (errs && typeof errs === "object") {
        const [k, arr] = Object.entries(errs)[0] || [];
        if (k && Array.isArray(arr) && arr.length) {
          return `${k}: ${arr[0]}`;
        }
      }
    } catch {}
    return null;
  })();
  if (firstFromErrors) return firstFromErrors;
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

function RegisterProfileContent() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
  const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/quicktime", // mov
    "video/x-msvideo", // avi
    "video/x-ms-wmv", // wmv
    "video/x-matroska", // mkv
  ];
  const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
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
    if (!token) {
      toast.error("يرجى تسجيل الدخول");
      return;
    }
    if (!API_URL) {
      toast.error("إعدادات الخادم غير مضبوطة (API_URL)");
      return;
    }

    try {
      setIsLoading(true);

      const isUpdate = Boolean(idParam);
      const url = isUpdate
        ? `${API_URL}/players/${idParam}`
        : `${API_URL}/players/createPlayer`;
      const method = isUpdate ? "patch" : "post";

      // map experience -> expreiance (backend field name)
      const payload = { ...values };
      if (payload.experience !== undefined) {
        payload.expreiance = Number(payload.experience) || 0;
        delete payload.experience;
      }

      // ensure numeric conversions for numeric fields
      if (payload.age !== undefined && payload.age !== "") {
        payload.age = Number(payload.age);
      }
      if (
        payload.monthlySalary?.amount !== undefined &&
        payload.monthlySalary.amount !== ""
      ) {
        payload.monthlySalary.amount = Number(payload.monthlySalary.amount);
      }
      if (
        payload.yearSalary?.amount !== undefined &&
        payload.yearSalary.amount !== ""
      ) {
        payload.yearSalary.amount = Number(payload.yearSalary.amount);
      }
      if (
        payload.transferredTo?.amount !== undefined &&
        payload.transferredTo.amount !== ""
      ) {
        payload.transferredTo.amount = Number(payload.transferredTo.amount);
      }

      // sanitize empty date fields to avoid cast errors on create
      if (payload.contractEndDate === "") {
        payload.contractEndDate = null;
      }
      if (payload.transferredTo) {
        if (payload.transferredTo.date === "") {
          payload.transferredTo.date = null;
        }
        if (payload.transferredTo.club === "") {
          payload.transferredTo.club = null;
        }
      }

      // remove UI-only fields and fields handled separately
      const hasFiles = Boolean(
        values.profilePictureFile || values.documentFile
      );
      delete payload.profilePictureFile;
      delete payload.profilePicturePreview;
      delete payload.agreeToTerms;
      delete payload.documentFile;
      delete payload.documentTitle;
      delete payload.media; // handled by dedicated endpoints
      delete payload.seo; // not part of backend schema

      if (!isUpdate) {
        // Always use multipart for create route (multer + parseJsonFields)
        const fdCreate = new FormData();
        if (values.profilePictureFile)
          fdCreate.append("profileImage", values.profilePictureFile);
        // Prefer newly selected doc/video from MediaUploadCard; fallback to legacy fields
        const firstDocFile =
          values.media?.documents?.find((d) => d && d.file)?.file ||
          values.documentFile ||
          null;
        const firstVideoFile =
          values.media?.videos?.find((v) => v && v.file)?.file || null;
        if (firstDocFile) {
          fdCreate.append("document", firstDocFile);
        }
        if (firstVideoFile) {
          fdCreate.append("playerVideo", firstVideoFile);
        }

        // Append primitives
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null && typeof v !== "object") {
            fdCreate.append(k, v);
          }
        });

        // Append nested objects as JSON for backend parser
        [
          "monthlySalary",
          "yearSalary",
          "transferredTo",
          "socialLinks",
          "isPromoted",
          "contactInfo",
        ].forEach((key) => {
          if (payload[key] && typeof payload[key] === "object") {
            fdCreate.append(key, JSON.stringify(payload[key]));
          }
        });

        const resp = await axios.post(url, fdCreate, {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => {
            if (e.total)
              setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        });

        toast.success(getSuccessMessage(resp, "تم الإنشاء"));
        setCanPay(true);
        return;
      }

      // Otherwise build multipart FormData for file upload
      const fd = new FormData();
      if (values.profilePictureFile)
        fd.append("profileImage", values.profilePictureFile);
      // Update supports adding a single document; only send if it's newly selected
      const updDocFile =
        values.media?.documents?.find((d) => d && d.file)?.file ||
        values.documentFile ||
        null;
      if (updDocFile) {
        fd.append("document", updDocFile);
      }
      // Backend update does not process playerVideo; skip here

      // For multipart, send only primitives to avoid nested parsing issues
      Object.entries(payload).forEach(([k, v]) => {
        if (
          v !== undefined &&
          v !== null &&
          typeof v !== "object" // skip nested objects here
        ) {
          fd.append(k, v);
        }
      });
      // And append nested objects as JSON so backend parseJsonFields can handle them
      [
        "monthlySalary",
        "yearSalary",
        "transferredTo",
        "socialLinks",
        "isPromoted",
        "contactInfo",
      ].forEach((key) => {
        if (payload[key] && typeof payload[key] === "object") {
          fd.append(key, JSON.stringify(payload[key]));
        }
      });

      const uploadResp = await axios({
        method,
        url,
        data: fd,
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => {
          if (e.total)
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      // No follow-up PATCH: nested JSON is already included in multipart and parsed server-side

      toast.success(
        getSuccessMessage(uploadResp, isUpdate ? "تم التحديث" : "تم الإنشاء")
      );
      if (!isUpdate) setCanPay(true);
    } catch (err) {
      console.error("ERR 400 payload details:", err?.response?.data);
      const msg = getErrorMessage(err, idParam ? "فشل التحديث" : "فشل الإنشاء");

      // If profile already exists, try to fetch its ID and redirect to edit
      if (err?.response?.status === 400 && /exists/i.test(String(msg))) {
        try {
          const token = localStorage.getItem("token");
          const me = await axios.get(`${API_URL}/players/playerprofile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pid = me?.data?.data?._id;
          if (pid) {
            toast.info("لديك ملف موجود مسبقًا، سيتم فتحه للتعديل");
            router.replace(`/register-profile?id=${pid}`);
            return;
          }
        } catch {}
      }

      toast.error(msg);
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
    status: "available",
    experience: "",
    monthlySalary: { amount: 0, currency: "SAR" },
    yearSalary: { amount: 0, currency: "SAR" },
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

  const formik = useFormik({
    initialValues,
    validate: validateWithJoi(playerFormSchema),
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

          const existingVideos = Array.isArray(player.media?.videos)
            ? player.media.videos
            : player.media?.videos?.url
            ? [player.media.videos]
            : [];
          const existingDocuments = Array.isArray(player.media?.documents)
            ? player.media.documents
            : player.media?.documents?.url
            ? [player.media.documents]
            : [];

          const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");

          const mergedValues = {
            ...initialValues,
            name: player.name || "",
            age: player.age ? String(player.age) : "",
            gender: player.gender,
            nationality: player.nationality || "",
            jop: player.jop || "",
            position: player.position || "",
            status: player.status || "available",
            experience: player.expreiance ? Number(player.expreiance) || 0 : 0,
            monthlySalary: player.monthlySalary || {
              amount: 0,
              currency: "SAR",
            },
            yearSalary: player.yearSalary || { amount: 0, currency: "SAR" },
            contractEndDate: toDateInput(player.contractEndDate),
            transferredTo: {
              club: player.transferredTo?.club || "",
              date: toDateInput(player.transferredTo?.date),
              amount: player.transferredTo?.amount || "",
            },
            media: {
              profileImage: player.media?.profileImage || {
                url: "",
                publicId: "",
              },
              videos: existingVideos,
              documents: existingDocuments,
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
    if (file.size > maxSize) return "حجم الملف كبير جدًا (الحد الأقصى 10MB)";
    return null;
  };

  const handleResetForm = () => {
    formik.resetForm();
    setCanPay(false);
    setUploadProgress(0);
    setUploadStatus(null);
    toast.info("تم إعادة تعيين النموذج");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const _errors = await formik.validateForm();
    if (_errors && Object.keys(_errors).length > 0) {
      Object.keys(_errors).forEach((path) =>
        formik.setFieldTouched(path, true, true)
      );
      const firstError = _errors[Object.keys(_errors)[0]];
      toast.error(
        typeof firstError === "string"
          ? firstError
          : "يرجى مراجعة الحقول المطلوبة"
      );
      return;
    }
    formik.handleSubmit(e);
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

        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <form onSubmit={handleFormSubmit} className="space-y-6 p-4 w-full">
            <PersonalInfoCard
              formik={formik}
              handleFileValidation={handleFileValidation}
              ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
              MAX_FILE_SIZE={MAX_FILE_SIZE}
            />
            <SportsInfoCard formik={formik} />
            <FinancialInfoCard formik={formik} />
            <TransferInfoCard formik={formik} />
            <ContactInfoCard formik={formik} />
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

export default function RegisterProfile() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <RegisterProfileContent />
    </Suspense>
  );
}
