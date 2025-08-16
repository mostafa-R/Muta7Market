"use client";
import { Button } from "@/app/component/ui/button";
import axios from "axios";
import { useFormik } from "formik";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import LoadingSpinner from "../../../component/LoadingSpinner";
import {
  cleanupMediaPreviews,
  prepareMediaFormData,   // must append: profileImage, playerVideo, document
  processMediaResponse,
} from "../../../utils/mediaUtils";
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

// ------- helpers to surface backend messages cleanly -------
const getSuccessMessage = (resp, fallback = "تم بنجاح") => {
  const d = resp?.data ?? {};
  return d.message || d.msg || d.data?.message || resp?.message || fallback;
};

const extractFieldErrors = (errs) => {
  const out = {};
  if (!errs) return out;

  if (Array.isArray(errs)) {
    errs.forEach((e) => {
      const key =
        (Array.isArray(e.path) ? e.path.join(".") : e.path) ||
        e.param ||
        e.field ||
        "form";
      out[key] = e.message || e.msg || String(e);
    });
  } else if (typeof errs === "object") {
    Object.entries(errs).forEach(([k, v]) => {
      out[k] = Array.isArray(v) ? (v[0]?.message || v[0]) : (v?.message || v);
      if (typeof out[k] !== "string") out[k] = JSON.stringify(out[k]);
    });
  }
  return out;
};

const getErrorMessage = (error, fallback = "حدث خطأ") => {
  const r = error?.response;
  const d = r?.data ?? {};

  const candidates = [
    d.message,
    d.msg,
    d.error?.message,                 // e.g. "Player profile already exists"
    typeof d.error === "string" ? d.error : undefined,
    d.data?.message,
    error?.message,
  ].filter(Boolean);

  const first = candidates.find((v) => typeof v === "string" && v.trim());
  if (first) return first;

  if (d.errors) {
    const fields = extractFieldErrors(d.errors);
    const msg = Object.values(fields).filter(Boolean).join("\n");
    if (msg) return msg;
  }

  if (d && typeof d === "object") return JSON.stringify(d);
  return fallback;
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  // pick whatever you actually use in your app
  const API_URL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api/v1/admin";

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState("rtl");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];
  const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const formSections = [
    { id: "personal", title: "المعلومات الشخصية", icon: "👤" },
    { id: "sports", title: "المعلومات الرياضية", icon: "🏆" },
    { id: "financial", title: "المعلومات المالية", icon: "💰" },
    { id: "transfer", title: "معلومات الانتقال", icon: "🔄" },
    { id: "contact", title: "معلومات التواصل", icon: "📞" },
    { id: "social", title: "روابط التواصل", icon: "🔗" },
    { id: "media", title: "الوسائط والمستندات", icon: "📎" },
    { id: "terms", title: "الشروط والأحكام", icon: "📝" },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      age: "",
      gender: "",
      nationality: "",
      jop: "",
      jopSelected: false,
      position: "",
      status: "",
      statusSelected: false,
      experience: "0",
      monthlySalary: { amount: "", currency: "SAR" },
      yearSalary: { amount: "", currency: "SAR" },
      contractEndDate: "",
      transferredTo: { club: "", date: "", amount: "" },
      socialLinks: { instagram: "", twitter: "", whatsapp: "", youtube: "" },
      contactInfo: {
        isHidden: true,
        email: "",
        phone: "",
        agent: { name: "", phone: "", email: "" },
      },
      isPromoted: { status: false, startDate: "", endDate: "", type: "featured" },
      media: {
        video: { url: null, publicId: null, title: null, duration: 0, uploadedAt: null },
        document: { url: null, publicId: null, title: null, type: null, size: 0, uploadedAt: null },
      },
      profilePicturePreview: "",
      profilePictureFile: null,
      documentFile: null,
      game: "",
      isActive: true,
      agreeToTerms: false,
    },
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      try {
        validateWithJoi(values, playerFormSchema);
        const errors = {};
        if (!values.name || values.name.trim() === "") errors.name = "الاسم مطلوب";
        if (!values.age || isNaN(Number(values.age))) errors.age = "العمر مطلوب ويجب أن يكون رقمًا";
        else if (Number(values.age) < 15 || Number(values.age) > 50) errors.age = "العمر يجب أن يكون بين 15 و 50 سنة";
        if (!values.gender) errors.gender = "الجنس مطلوب";
        if (!values.nationality || values.nationality.trim() === "") errors.nationality = "الجنسية مطلوبة";
        if (!values.game || values.game.trim() === "") errors.game = "الرياضة مطلوبة";
        if (!values.jop) errors.jop = "الفئة مطلوبة";
        if (!values.position) errors.position = "المركز/التخصص مطلوب";
        if (!values.status) errors.status = "الحالة الحالية مطلوبة";
        if (!values.agreeToTerms) errors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
        if (!values.contactInfo?.email) errors["contactInfo.email"] = "يجب ادخال البريد الالكترونى";
        return errors;
      } catch (err) {
        return { [err.path[0]]: err.message };
      }
    },
    onSubmit: async (values) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("يرجى تسجيل الدخول");
        return;
      }
      if (!API_URL) {
        toast.error("إعدادات الخادم غير مضبوطة (API_URL)");
        return;
      }
      if (!values.agreeToTerms) {
        toast.error("يجب الموافقة على الشروط والأحكام");
        return;
      }

      try {
        setIsLoading(true);
        setUploadProgress(10);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.floor(Math.random() * 8) + 2;
          });
        }, 800);

        const isUpdate = Boolean(idParam);
        const url = isUpdate
          ? `${API_URL}/players/${idParam}`
          : `${API_URL}/players`; // your router.post("/createPlayer", ...)

        const method = isUpdate ? "patch" : "post";

        if (!values.game || values.game.trim() === "") {
          toast.error("الرياضة مطلوبة (Game field is required)");
          setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
          setIsLoading(false);
          clearInterval(progressInterval);
          return;
        }

        // ------ build payload + normalize enums/numbers ------
        const payload = { ...values };
        if (payload.experience !== undefined) {
          payload.expreiance = Number(payload.experience) || 0;
          delete payload.experience;
        }
        if (payload.age !== undefined && payload.age !== "") payload.age = Number(payload.age);
        if (payload.monthlySalary?.amount !== undefined && payload.monthlySalary.amount !== "") {
          payload.monthlySalary.amount = Number(payload.monthlySalary.amount);
        }
        if (payload.yearSalary?.amount !== undefined && payload.yearSalary.amount !== "") {
          payload.yearSalary.amount = Number(payload.yearSalary.amount);
        }
        if (payload.transferredTo?.amount !== undefined && payload.transferredTo.amount !== "") {
          payload.transferredTo.amount = Number(payload.transferredTo.amount);
        }

        payload.isActive = Boolean(payload.isActive);
        if (!payload.contactInfo) payload.contactInfo = {};
        if (!payload.contactInfo.agent) payload.contactInfo.agent = {};
        if (payload.contactInfo) payload.contactInfo.isHidden = Boolean(payload.contactInfo.isHidden);
        if (payload.isPromoted) payload.isPromoted.status = Boolean(payload.isPromoted.status);

        // enums to lowercase to satisfy backend
        payload.gender = (payload.gender || "").toLowerCase();        // "male" | "female"
        payload.status = (payload.status || "").toLowerCase();        // "available" | "contracted" | "transferred"
        payload.jop    = (payload.jop || "").toLowerCase();           // "player" | "coach"

        delete payload.agreeToTerms;
        delete payload.profilePicturePreview;
        delete payload.profilePictureFile;
        delete payload.documentFile;

        // ------ ALWAYS multipart: uploadMixed.fields + parseJsonFields ------
        const fd = new FormData();
        // primitives
        fd.append("name", payload.name || "");
        fd.append("age", String(payload.age ?? ""));
        fd.append("gender", payload.gender || "");
        fd.append("nationality", payload.nationality || "");
        fd.append("game", payload.game || "");
        fd.append("jop", payload.jop || "");
        fd.append("position", payload.position || "");
        fd.append("status", payload.status || "");
        fd.append("expreiance", String(payload.expreiance ?? "0"));
        if (payload.contractEndDate) fd.append("contractEndDate", payload.contractEndDate);
        if (typeof payload.isActive !== "undefined") fd.append("isActive", String(Boolean(payload.isActive)));

        // JSON strings for parseJsonFields([...])
        if (payload.monthlySalary)  fd.append("monthlySalary", JSON.stringify(payload.monthlySalary));
        if (payload.yearSalary)     fd.append("yearSalary", JSON.stringify(payload.yearSalary));
        if (payload.transferredTo)  fd.append("transferredTo", JSON.stringify(payload.transferredTo));
        if (payload.socialLinks)    fd.append("socialLinks", JSON.stringify(payload.socialLinks));
        if (payload.isPromoted)     fd.append("isPromoted", JSON.stringify(payload.isPromoted));
        if (payload.contactInfo)    fd.append("contactInfo", JSON.stringify(payload.contactInfo));

        // files (field names must be: profileImage, playerVideo, document)
        prepareMediaFormData(values, player?.media, fd);

        // Fallback: if utils didn’t append, add first available files explicitly
        if (values.profilePictureFile) {
          fd.append("profileImage", values.profilePictureFile);
        }
        const maybeVideoFile = values.media?.video?.file;
        if (maybeVideoFile) {
          fd.append("playerVideo", maybeVideoFile);
        }
        const maybeDocFile = values.media?.document?.file || values.documentFile;
        if (maybeDocFile) {
          fd.append("document", maybeDocFile);
        }

        // ---- send ----
        const resp = await axios({
          method,
          url,
          data: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // if your auth is cookie-based, this helps
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / (e.total || 100));
            setUploadProgress(percent);
          },
        });

        toast.success(getSuccessMessage(resp, isUpdate ? "تم التحديث" : "تم الإنشاء"));
        setCanPay(true);

        if (resp?.data?.data?.media) {
          const processedMedia = processMediaResponse(resp.data.data.media);
          setPlayer((prev) => ({ ...prev, media: processedMedia }));
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadStatus("success");
      } catch (error) {
        // IMPORTANT: avoid Next overlay by not calling console.error(error)
        console.warn("Create/Update player failed:", getErrorMessage(error));
        setUploadStatus("error");

        // Show backend message clearly
        toast.error(getErrorMessage(error, "حدث خطأ أثناء رفع البيانات."));

        // Push field-level errors to the form if backend sent them
        const fieldErrs = extractFieldErrors(error?.response?.data?.errors);
        if (Object.keys(fieldErrs).length) formik.setErrors(fieldErrs);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Load existing player
  useEffect(() => {
    if (idParam && API_URL) {
      (async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("يجب تسجيل الدخول أولاً");
            router.push("/login");
            return;
          }
          const response = await axios.get(`${API_URL}/players/${idParam}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          const p = response.data.data;

          const mergedValues = {
            ...formik.values,
            name: p.name || "",
            age: p.age || "",
            gender: p.gender || "",
            nationality: p.nationality || "",
            jop: p.jop || "",
            jopSelected: true,
            position: p.position || "",
            status: p.status || "",
            statusSelected: true,
            experience: p.expreiance?.toString() || "0",
            contractEndDate: p.contractEndDate || "",
            monthlySalary: p.monthlySalary || { amount: "", currency: "SAR" },
            yearSalary: p.yearSalary || { amount: "", currency: "SAR" },
            transferredTo: p.transferredTo || { club: "", date: "", amount: "" },
            socialLinks: p.socialLinks || { instagram: "", twitter: "", whatsapp: "", youtube: "" },
            contactInfo: p.contactInfo || {
              isHidden: true, email: "", phone: "", agent: { name: "", phone: "", email: "" },
            },
            isPromoted: p.isPromoted || { status: false, startDate: "", endDate: "", type: "featured" },
            media: p.media ? {
              video: p.media.video || { url: null, publicId: null, title: null, duration: 0, uploadedAt: null },
              document: p.media.document || { url: null, publicId: null, title: null, type: null, size: 0, uploadedAt: null },
            } : {
              video: { url: null, publicId: null, title: null, duration: 0, uploadedAt: null },
              document: { url: null, publicId: null, title: null, type: null, size: 0, uploadedAt: null },
            },
            game: p.game || "",
            isActive: p.isActive || false,
            views: p.views || 0,
            profilePicturePreview: p.media?.profileImage?.url || "",
            profilePictureFile: undefined,
            agreeToTerms: true,
          };

          setPlayer(p);
          formik.setValues(mergedValues);
          toast.success(getSuccessMessage(response, "تم تحميل بيانات اللاعب بنجاح"));
        } catch (err) {
          console.warn("Fetch player failed:", getErrorMessage(err));
          toast.error(getErrorMessage(err, "فشل في جلب بيانات اللاعب"));
        } finally {
          setIsLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, API_URL]);

  useEffect(() => {
    return () => {
      if (formik.values.profilePicturePreview?.startsWith("blob:")) {
        try { URL.revokeObjectURL(formik.values.profilePicturePreview); } catch {}
      }
      cleanupMediaPreviews(formik.values.media);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const sectionRequiredFields = {
    personal: ["name", "age", "gender", "nationality"],
    sports: ["game", "jop", "status"],
    financial: [],
    transfer: [],
    contact: [],
    social: [],
    media: [],
    terms: ["agreeToTerms"],
  };

  const validateFields = (fields, values) => {
    const errors = {};
    if (fields.includes("name") && (!values.name || values.name.trim() === "")) errors.name = "الاسم مطلوب";
    if (fields.includes("age")) {
      if (!values.age || values.age === "") errors.age = "العمر مطلوب";
      else if (isNaN(Number(values.age))) errors.age = "العمر يجب أن يكون رقمًا";
      else if (Number(values.age) < 15 || Number(values.age) > 50) errors.age = "العمر يجب أن يكون بين 15 و 50 سنة";
    }
    if (fields.includes("gender") && !values.gender) errors.gender = "الجنس مطلوب";
    if (fields.includes("nationality") && (!values.nationality || values.nationality.trim() === "")) errors.nationality = "الجنسية مطلوبة";
    if (fields.includes("game") && (!values.game || values.game.trim() === "")) errors.game = "الرياضة مطلوبة";
    if (fields.includes("jop")) {
      if (!values.jopSelected) errors.jop = "الفئة مطلوبة - يرجى اختيار الفئة";
      else if (!values.jop || !["player", "coach"].includes(values.jop)) errors.jop = "الفئة مطلوبة - يجب اختيار لاعب أو مدرب";
    }
    if (fields.includes("status")) {
      if (!values.statusSelected) errors.status = "الحالة الحالية مطلوبة - يرجى اختيار الحالة";
      else if (!values.status || !["available", "contracted", "transferred"].includes(values.status)) {
        errors.status = "الحالة الحالية مطلوبة - يجب اختيار حالة صالحة";
      }
    }
    if (fields.includes("agreeToTerms") && !values.agreeToTerms) errors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
    return errors;
  };

  const nextStep = async () => {
    const currentSection = formSections[currentStep].id;
    const requiredFields = sectionRequiredFields[currentSection] || [];
    requiredFields.forEach((field) => formik.setFieldTouched(field, true, true));

    const _errors = await formik.validateForm();
    const customErrors = validateFields(requiredFields, formik.values);
    const mergedErrors = { ..._errors, ...customErrors };
    const currentSectionErrors = {};
    if (mergedErrors && Object.keys(mergedErrors).length > 0) {
      Object.keys(mergedErrors).forEach((path) => {
        if (requiredFields.includes(path)) currentSectionErrors[path] = mergedErrors[path];
      });
    }
    if (Object.keys(currentSectionErrors).length > 0) {
      const firstError = currentSectionErrors[Object.keys(currentSectionErrors)[0]];
      toast.error(typeof firstError === "string" ? firstError : "يرجى مراجعة الحقول المطلوبة في هذا القسم");
      return;
    }
    if (currentStep < formSections.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderFormSection = () => {
    const section = formSections[currentStep];
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoCard
            formik={formik}
            handleFileValidation={handleFileValidation}
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
          />
        );
      case "sports":
        return <SportsInfoCard formik={formik} />;
      case "financial":
        return <FinancialInfoCard formik={formik} />;
      case "transfer":
        return <TransferInfoCard formik={formik} />;
      case "contact":
        return <ContactInfoCard formik={formik} />;
      case "social":
        return <SocialLinksCard formik={formik} />;
      case "media":
        return (
          <MediaUploadCard
            formik={formik}
            handleFileValidation={handleFileValidation}
            ALLOWED_VIDEO_TYPES={ALLOWED_VIDEO_TYPES}
            ALLOWED_DOCUMENT_TYPES={ALLOWED_DOCUMENT_TYPES}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
          />
        );
      case "terms":
        return <TermsCard formik={formik} />;
      default:
        return null;
    }
  };

  const toggleDirection = () => {
    setDirection(direction === "rtl" ? "ltr" : "rtl");
    document.documentElement.dir = direction === "rtl" ? "ltr" : "rtl";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // quick front checks for better UX
    if (!formik.values.name?.trim()) {
      toast.error("الاسم مطلوب - يرجى إدخال اسمك");
      formik.setFieldTouched("name", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "personal"));
      return;
    }
    if (!formik.values.age || isNaN(Number(formik.values.age))) {
      toast.error("العمر مطلوب ويجب أن يكون رقمًا");
      formik.setFieldTouched("age", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "personal"));
      return;
    } else if (Number(formik.values.age) < 15 || Number(formik.values.age) > 50) {
      toast.error("العمر يجب أن يكون بين 15 و 50 سنة");
      formik.setFieldTouched("age", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "personal"));
      return;
    }
    if (!formik.values.gender) {
      toast.error("الجنس مطلوب - يرجى اختيار الجنس");
      formik.setFieldTouched("gender", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "personal"));
      return;
    }
    if (!formik.values.nationality?.trim()) {
      toast.error("الجنسية مطلوبة - يرجى اختيار الجنسية");
      formik.setFieldTouched("nationality", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "personal"));
      return;
    }

    if (!formik.values.game?.trim()) {
      toast.error("الرياضة مطلوبة - يرجى اختيار رياضة");
      formik.setFieldTouched("game", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
      return;
    }
    if (!formik.values.jopSelected) {
      toast.error("الفئة مطلوبة - يرجى اختيار الفئة بشكل صريح");
      formik.setFieldTouched("jop", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
      return;
    }
    if (!formik.values.jop || !["player", "coach"].includes(formik.values.jop)) {
      toast.error("الفئة مطلوبة - يرجى اختيار الفئة (لاعب/مدرب)");
      formik.setFieldTouched("jop", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
      return;
    }
    if (!formik.values.statusSelected) {
      toast.error("الحالة الحالية مطلوبة - يرجى اختيار الحالة بشكل صريح");
      formik.setFieldTouched("status", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
      return;
    }
    if (!formik.values.status || !["available", "contracted", "transferred"].includes(formik.values.status)) {
      toast.error("الحالة الحالية مطلوبة - يرجى اختيار الحالة الحالية");
      formik.setFieldTouched("status", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "sports"));
      return;
    }

    if (!formik.values.agreeToTerms) {
      toast.error("يجب الموافقة على الشروط والأحكام");
      formik.setFieldTouched("agreeToTerms", true, true);
      setCurrentStep(formSections.findIndex((s) => s.id === "terms"));
      return;
    }

    // mark required touched & delegate to formik
    ["name","age","gender","nationality","game","jop","status","agreeToTerms"].forEach((f) =>
      formik.setFieldTouched(f, true, true)
    );
    const _errors = await formik.validateForm();
    if (Object.keys(_errors).length) {
      const firstKey = Object.keys(_errors)[0];
      toast.error(_errors[firstKey] || "يرجى مراجعة الحقول المطلوبة");
      return;
    }
    formik.handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir={direction}>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop rtl={direction === "rtl"} />
      <button
        onClick={toggleDirection}
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-xs"
        aria-label="Toggle language direction"
      >
        {direction === "rtl" ? "English" : "العربية"}
      </button>

      <div className="container mx-auto pt-8 pb-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold text-[#00183D] ${direction === "rtl" ? "text-right" : "text-left"}`}>
              {idParam ? "تعديل ملف لاعب" : "إنشاء ملف لاعب جديد"}
            </h1>
            <p className={`text-gray-500 mt-1 ${direction === "rtl" ? "text-right" : "text-left"}`}>
              {direction === "rtl" ? "أكمل المعلومات المطلوبة لإنشاء ملف شخصي" : "Complete the required information to create a profile"}
            </p>
          </div>
          <Link href="/profile" className="flex items-center text-[#00183D] hover:text-[#002c65] font-medium transition-colors">
            {direction === "rtl" ? (
              <>
                العودة للملف الشخصي
                <ArrowLeft className="w-4 h-4 mr-1" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Profile
              </>
            )}
          </Link>
        </div>

        {/* progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {direction === "rtl" ? "الخطوة" : "Step"} {currentStep + 1}/{formSections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{formSections[currentStep].title}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / formSections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* step pills */}
        <div className="hidden md:flex mb-8 overflow-x-auto justify-between">
          {formSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col items-center mx-1 min-w-[80px] ${
                currentStep === index ? "text-blue-600 font-medium" : index < currentStep ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
                  currentStep === index
                    ? "bg-blue-100 text-blue-600"
                    : index < currentStep
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {section.icon}
              </div>
              <span className="text-xs whitespace-nowrap">{section.title}</span>
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">{direction === "rtl" ? "جاري تحميل البيانات..." : "Loading data..."}</p>
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleFormSubmit} className="w-full">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              <div className="p-6 md:p-8">{renderFormSection()}</div>

              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 sm:flex-initial flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
                    >
                      {direction === "rtl" ? (
                        <>
                          الخطوة السابقة
                          <ChevronRight className="w-4 h-4 mr-1" />
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </>
                      )}
                    </Button>
                  )}
                  {currentStep === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetForm}
                      className="flex-1 sm:flex-initial flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {direction === "rtl" ? "إعادة تعيين" : "Reset"}
                    </Button>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {currentStep < formSections.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 sm:flex-initial flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      {direction === "rtl" ? (
                        <>
                          الخطوة التالية
                          <ChevronLeft className="w-4 h-4 mr-1" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex-1 sm:flex-initial flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {idParam
                        ? direction === "rtl"
                          ? "حفظ التغييرات"
                          : "Save Changes"
                        : direction === "rtl"
                        ? "إنشاء الملف الشخصي"
                        : "Create Profile"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {direction === "rtl" ? "جاري الرفع..." : "Uploading..."}
                  </span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!idParam && canPay && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-700">
                      {direction === "rtl" ? "تم إنشاء الملف بنجاح!" : "Profile created successfully!"}
                    </h3>
                    <p className="text-emerald-600">
                      {direction === "rtl"
                        ? "يمكنك الآن تعزيز ظهور ملفك والحصول على المزيد من الفرص."
                        : "You can now promote your profile to get more opportunities."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Suspense fallback={<div className="py-4 text-center text-gray-500">{direction === "rtl" ? "جاري التحميل..." : "Loading..."}</div>}>
                    <PaymentBtn playerId={player?._id} />
                  </Suspense>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      <Toaster position="top-right" />

      {isMobile && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center z-10 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-3 py-2 ${currentStep === 0 ? "opacity-50" : ""}`}
          >
            {direction === "rtl" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>

          <div className="text-center">
            <span className="text-sm font-medium">
              {currentStep + 1}/{formSections.length}
            </span>
          </div>

          {currentStep < formSections.length - 1 ? (
            <Button type="button" onClick={nextStep} className="px-3 py-2 bg-blue-600 hover:bg-blue-700">
              {direction === "rtl" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFormSubmit}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
              disabled={formik.isSubmitting}
            >
              <Save className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
