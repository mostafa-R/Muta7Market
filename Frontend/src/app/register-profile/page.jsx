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
import LoadingSpinner from "../component/LoadingSpinner";
import {
  cleanupMediaPreviews,
  prepareMediaFormData,
  processMediaResponse,
} from "../utils/mediaUtils";
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
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// Form sections for multi-step navigation - titles hardcoded in Arabic
const formSections = [
  { id: "personal", title: "معلومات شخصية", icon: "👤" },
  { id: "sports", title: "معلومات رياضية", icon: "🏆" },
  { id: "financial", title: "معلومات مالية", icon: "💰" },
  { id: "transfer", title: "معلومات انتقال", icon: "🔄" },
  { id: "contact", title: "معلومات الاتصال", icon: "📞" },
  { id: "social", title: "روابط اجتماعية", icon: "🔗" },
  { id: "media", title: "وسائط", icon: "📎" },
  { id: "terms", title: "الشروط", icon: "📝" },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Allowed file types
  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ];
  const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const formik = useFormik({
    initialValues: {
      name: "",
      age: "",
      gender: "",
      nationality: "",
      jop: "",
      jopSelected: false, // Track if user explicitly selected jop
      position: "",
      status: "",
      statusSelected: false, // Track if user explicitly selected status
      experience: "0",
      monthlySalary: {
        amount: "",
        currency: "SAR",
      },
      yearSalary: {
        amount: "",
        currency: "SAR",
      },
      contractEndDate: "",
      transferredTo: {
        club: "",
        date: "",
        amount: "",
      },
      socialLinks: {
        instagram: "",
        twitter: "",
        whatsapp: "",
        youtube: "",
      },
      contactInfo: {
        isHidden: true,
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
        type: "featured",
      },
      media: {
        video: {
          url: null,
          publicId: null,
          title: null,
          duration: 0,
          uploadedAt: null,
        },
        document: {
          url: null,
          publicId: null,
          title: null,
          type: null,
          size: 0,
          uploadedAt: null,
        },
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
        // First use Joi for schema validation
        validateWithJoi(values, playerFormSchema);

        // Additional manual validation for all required fields
        const errors = {};

        // Personal section validation
        if (!values.name || values.name.trim() === "") {
          errors.name = "الاسم مطلوب";
        }

        if (!values.age || isNaN(Number(values.age))) {
          errors.age = "العمر مطلوب ويجب أن يكون رقمًا";
        } else if (Number(values.age) < 15 || Number(values.age) > 50) {
          errors.age = "العمر يجب أن يكون بين 15 و 50 سنة";
        }

        if (!values.gender) {
          errors.gender = "الجنس مطلوب";
        }

        if (!values.nationality || values.nationality.trim() === "") {
          errors.nationality = "الجنسية مطلوبة";
        }

        // Sports section validation
        if (!values.game || values.game.trim() === "") {
          errors.game = "الرياضة مطلوبة";
        }

        if (!values.jop) {
          errors.jop = "الفئة مطلوبة";
        }

        if (!values.position) {
          errors.position = "المركز/التخصص مطلوب";
        }

        if (!values.status) {
          errors.status = "الحالة الحالية مطلوبة";
        }

        // Terms validation
        if (!values.agreeToTerms) {
          errors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
        }

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

      // Double-check terms agreement even within the submit handler
      if (!values.agreeToTerms) {
        toast.error("يجب الموافقة على الشروط والأحكام");
        return;
      }

      try {
        setIsLoading(true);
        setUploadProgress(10); // Show initial progress

        // Simulate progress for better UX since the API might not report progress correctly
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
          : `${API_URL}/players/createPlayer`;
        const method = isUpdate ? "patch" : "post";

        // Double check all required fields before proceeding
        const requiredFieldsCheck = {
          // Personal section
          name: !values.name || values.name.trim() === "",
          age:
            !values.age ||
            isNaN(Number(values.age)) ||
            Number(values.age) < 15 ||
            Number(values.age) > 50,
          gender: !values.gender,
          nationality: !values.nationality || values.nationality.trim() === "",

          // Sports section
          game: !values.game || values.game.trim() === "",
          jop: !values.jop || !values.jopSelected, // Must have a value AND be explicitly selected
          status: !values.status || !values.statusSelected, // Must have a value AND be explicitly selected
          // position is optional, not checked

          // Terms section
          agreeToTerms: !values.agreeToTerms,
        };

        // Check for any validation errors
        const errors = Object.entries(requiredFieldsCheck)
          .filter(([_, hasError]) => hasError)
          .map(([field]) => field);

        if (errors.length > 0) {
          // Determine which section to navigate to based on the first error
          let sectionToNavigate = "personal"; // Default

          if (["game", "jop", "status"].includes(errors[0])) {
            sectionToNavigate = "sports";
          } else if (errors[0] === "agreeToTerms") {
            sectionToNavigate = "terms";
          }

          // Show error for the first field
          const errorMessages = {
            name: "الاسم مطلوب - يرجى إدخال اسمك",
            age: "العمر مطلوب ويجب أن يكون بين 15 و 50",
            gender: "الجنس مطلوب - يرجى اختيار الجنس",
            nationality: "الجنسية مطلوبة - يرجى اختيار الجنسية",
            game: "الرياضة مطلوبة - لا يمكن إنشاء الملف بدون اختيار رياضة",
            jop: "الفئة مطلوبة - يرجى اختيار الفئة بشكل صريح",
            status: "الحالة الحالية مطلوبة - يرجى اختيار الحالة بشكل صريح",
            agreeToTerms: "يجب الموافقة على الشروط والأحكام",
          };

          toast.error(errorMessages[errors[0]]);
          setCurrentStep(
            formSections.findIndex(
              (section) => section.id === sectionToNavigate
            )
          );
          setIsLoading(false);
          clearInterval(progressInterval);
          return;
        }

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

        // Ensure contact info is properly formed
        if (!payload.contactInfo) payload.contactInfo = {};
        if (!payload.contactInfo.agent) payload.contactInfo.agent = {};

        // Convert some fields to booleans to match backend expectations
        payload.isActive = Boolean(payload.isActive);
        if (payload.contactInfo) {
          payload.contactInfo.isHidden = Boolean(payload.contactInfo.isHidden);
        }
        if (payload.isPromoted) {
          payload.isPromoted.status = Boolean(payload.isPromoted.status);
        }

        // remove form-only fields that the API doesn't need
        delete payload.agreeToTerms;
        delete payload.profilePicturePreview;
        delete payload.profilePictureFile;
        delete payload.documentFile;

        // If there are no files, we can send as JSON
        // Ensure game field is properly set and not empty
        if (!payload.game || payload.game.trim() === "") {
          toast.error("الرياضة مطلوبة (Game field is required)");
          setCurrentStep(
            formSections.findIndex((section) => section.id === "sports")
          );
          setIsLoading(false);
          clearInterval(progressInterval);
          return;
        }

        const hasFiles =
          values.profilePictureFile ||
          values.documentFile ||
          values.media?.document?.file ||
          values.media?.video?.file;

        if (!hasFiles) {
          try {
            const resp = await axios({
              method,
              url,
              data: payload,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            toast.success(getSuccessMessage(resp, "تم الإنشاء"));
            setCanPay(true);
            return;
          } catch (error) {
            if (error.response) {
              let errorMsg =
                error.response.data?.message ||
                error.response.data?.error ||
                `خطأ ${error.response.status}`;
              toast.error(`خطأ في إرسال البيانات: ${errorMsg}`);
            }
            setIsLoading(false);
            clearInterval(progressInterval);
            return;
          }
        }

        // Otherwise build multipart FormData for file upload
        const fd = new FormData();

        // First, add all critical fields directly to ensure they're properly set
        fd.append("name", payload.name || "");
        fd.append("age", payload.age || "");
        fd.append("gender", payload.gender || "");
        fd.append("nationality", payload.nationality || "");
        fd.append("game", payload.game || "");
        fd.append("jop", payload.jop || "");
        fd.append("position", payload.position || "");
        fd.append("status", payload.status || "");
        fd.append("expreiance", payload.expreiance || "0");

        // Use our utility to handle media files
        prepareMediaFormData(values, player?.media, fd);

        // Show toast notifications for media updates
        if (values.profilePictureFile && player?.media?.profileImage?.url) {
          toast.info("سيتم استبدال الصورة الشخصية السابقة");
        }

        const hasNewDocument =
          values.media?.document?.file || values.documentFile;
        if (hasNewDocument && player?.media?.document?.url) {
          toast.info("سيتم استبدال المستند السابق بالمستند الجديد");
        }

        const hasNewVideo = values.media?.video?.file;
        if (hasNewVideo && player?.media?.video?.url) {
          toast.info("سيتم استبدال الفيديو السابق بالفيديو الجديد");
        }

        // For multipart, send remaining primitive fields
        Object.entries(payload).forEach(([k, v]) => {
          // Skip fields we've already added directly and objects
          if (
            ![
              "name",
              "age",
              "gender",
              "nationality",
              "game",
              "jop",
              "position",
              "status",
              "expreiance",
            ].includes(k) &&
            v !== undefined &&
            v !== null &&
            typeof v !== "object"
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

        let resp;
        try {
          resp = await axios({
            method,
            url,
            data: fd,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 100)
              );
              setUploadProgress(percentCompleted);
            },
          });
        } catch (error) {
          if (error.response) {
            let errorMessage = "خطأ في إرسال البيانات: ";
            if (error.response.data && error.response.data.message) {
              errorMessage += error.response.data.message;
            } else if (error.response.data && error.response.data.error) {
              errorMessage += error.response.data.error;
            } else {
              errorMessage += `خطأ ${error.response.status}`;
            }

            toast.error(errorMessage);
          } else if (error.request) {
            toast.error("لم يتم تلقي رد من الخادم. تحقق من اتصالك بالإنترنت.");
          } else {
            toast.error(`خطأ في إعداد الطلب: ${error.message}`);
          }

          // Clear loading state
          setIsLoading(false);
          clearInterval(progressInterval);
          setUploadProgress(0);
          setUploadStatus("error");
          return; // Stop execution here
        }

        const respData = resp;

        // Process the returned media data
        if (respData.data?.data?.media) {
          const processedMedia = processMediaResponse(respData.data.data.media);
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            media: processedMedia,
          }));
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadStatus("success");

        toast.success(
          getSuccessMessage(
            respData,
            isUpdate ? "تم التحديث بنجاح" : "تم الإنشاء بنجاح"
          )
        );
        setCanPay(true);

        // On successful profile creation, redirect to profile view
        // if (!isUpdate) {
        //   setTimeout(() => {
        //     router.push("/profile");
        //   }, 2000);
        // }
      } catch (error) {
        setUploadStatus("error");
        toast.error(
          getErrorMessage(error, "حدث خطأ أثناء رفع البيانات. حاول مرة أخرى.")
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Load existing player data if editing
  useEffect(() => {
    if (idParam && API_URL) {
      const fetchPlayer = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("يجب تسجيل الدخول أولاً");
            router.push("/login");
            return;
          }

          const response = await axios.get(`${API_URL}/players/${idParam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const player = response.data.data;

          // Map backend expreiance to frontend experience field
          const mergedValues = {
            ...formik.values,
            name: player.name || "",
            age: player.age || "",
            gender: player.gender || "",
            nationality: player.nationality || "",
            jop: player.jop || "",
            jopSelected: true, // Mark as selected for existing players
            position: player.position || "",
            status: player.status || "",
            statusSelected: true, // Mark as selected for existing players
            experience: player.expreiance?.toString() || "0",
            contractEndDate: player.contractEndDate || "",
            monthlySalary: player.monthlySalary || {
              amount: "",
              currency: "SAR",
            },
            yearSalary: player.yearSalary || {
              amount: "",
              currency: "SAR",
            },
            transferredTo: player.transferredTo || {
              club: "",
              date: "",
              amount: "",
            },
            socialLinks: player.socialLinks || {
              instagram: "",
              twitter: "",
              whatsapp: "",
              youtube: "",
            },
            contactInfo: player.contactInfo || {
              isHidden: true,
              email: "",
              phone: "",
              agent: {
                name: "",
                phone: "",
                email: "",
              },
            },
            isPromoted: player.isPromoted || {
              status: false,
              startDate: "",
              endDate: "",
              type: "featured",
            },
            media: player.media
              ? {
                  video: player.media.video || {
                    url: null,
                    publicId: null,
                    title: null,
                    duration: 0,
                    uploadedAt: null,
                  },
                  document: player.media.document || {
                    url: null,
                    publicId: null,
                    title: null,
                    type: null,
                    size: 0,
                    uploadedAt: null,
                  },
                }
              : {
                  video: {
                    url: null,
                    publicId: null,
                    title: null,
                    duration: 0,
                    uploadedAt: null,
                  },
                  document: {
                    url: null,
                    publicId: null,
                    title: null,
                    type: null,
                    size: 0,
                    uploadedAt: null,
                  },
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
      };

      fetchPlayer();
    }
  }, [idParam, API_URL]);

  // Cleanup function for media previews when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any object URLs when component unmounts
      if (formik.values.profilePicturePreview?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(formik.values.profilePicturePreview);
        } catch {}
      }

      // Use our utility to clean up all media previews
      cleanupMediaPreviews(formik.values.media);
    };
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Pre-submission validation for all required fields
    // Personal section fields
    if (!formik.values.name || formik.values.name.trim() === "") {
      toast.error("الاسم مطلوب - يرجى إدخال اسمك");
      formik.setFieldTouched("name", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "personal")
      );
      return;
    }

    if (!formik.values.age || isNaN(Number(formik.values.age))) {
      toast.error("العمر مطلوب ويجب أن يكون رقمًا");
      formik.setFieldTouched("age", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "personal")
      );
      return;
    } else if (
      Number(formik.values.age) < 15 ||
      Number(formik.values.age) > 50
    ) {
      toast.error("العمر يجب أن يكون بين 15 و 50 سنة");
      formik.setFieldTouched("age", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "personal")
      );
      return;
    }

    if (!formik.values.gender) {
      toast.error("الجنس مطلوب - يرجى اختيار الجنس");
      formik.setFieldTouched("gender", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "personal")
      );
      return;
    }

    if (!formik.values.nationality || formik.values.nationality.trim() === "") {
      toast.error("الجنسية مطلوبة - يرجى اختيار الجنسية");
      formik.setFieldTouched("nationality", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "personal")
      );
      return;
    }

    // Sports section fields
    if (!formik.values.game || formik.values.game.trim() === "") {
      toast.error("الرياضة مطلوبة - يرجى اختيار رياضة");
      formik.setFieldTouched("game", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "sports")
      );
      return;
    }

    // Check if the user has explicitly selected jop (category)
    if (!formik.values.jopSelected) {
      toast.error("الفئة مطلوبة - يرجى اختيار الفئة بشكل صريح");
      formik.setFieldTouched("jop", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "sports")
      );
      return;
    }

    // Ensure jop has a valid value
    if (
      !formik.values.jop ||
      !["player", "coach"].includes(formik.values.jop)
    ) {
      toast.error("الفئة مطلوبة - يرجى اختيار الفئة (لاعب/مدرب)");
      formik.setFieldTouched("jop", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "sports")
      );
      return;
    }

    // Check if the user has explicitly selected status
    if (!formik.values.statusSelected) {
      toast.error("الحالة الحالية مطلوبة - يرجى اختيار الحالة بشكل صريح");
      formik.setFieldTouched("status", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "sports")
      );
      return;
    }

    // Ensure status has a valid value
    if (
      !formik.values.status ||
      !["available", "contracted", "transferred"].includes(formik.values.status)
    ) {
      toast.error("الحالة الحالية مطلوبة - يرجى اختيار الحالة الحالية");
      formik.setFieldTouched("status", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "sports")
      );
      return;
    }

    // Terms and conditions agreement
    if (!formik.values.agreeToTerms) {
      toast.error("يجب الموافقة على الشروط والأحكام");
      formik.setFieldTouched("agreeToTerms", true, true);
      setCurrentStep(
        formSections.findIndex((section) => section.id === "terms")
      );
      return;
    }

    // Get all required fields from all sections
    const allRequiredFields = Object.values(sectionRequiredFields).flat();

    // Mark all required fields as touched for validation
    allRequiredFields.forEach((field) => {
      formik.setFieldTouched(field, true, true);
    });

    // Run full form validation
    const _errors = await formik.validateForm();

    // Show the first error if any validation fails
    if (_errors && Object.keys(_errors).length > 0) {
      const errorField = Object.keys(_errors)[0];
      const errorMessage = _errors[errorField];

      toast.error(errorMessage || "يرجى مراجعة الحقول المطلوبة");

      // Navigate to the appropriate section based on the error
      if (errorField === "game") {
        setCurrentStep(
          formSections.findIndex((section) => section.id === "sports")
        );
      } else if (
        ["name", "age", "gender", "nationality"].includes(errorField)
      ) {
        setCurrentStep(
          formSections.findIndex((section) => section.id === "personal")
        );
      } else if (errorField === "agreeToTerms") {
        setCurrentStep(
          formSections.findIndex((section) => section.id === "terms")
        );
      }

      return;
    }

    // If validation passes, submit the form
    formik.handleSubmit(e);
  };

  // Define required fields per section
  const sectionRequiredFields = {
    personal: ["name", "age", "gender", "nationality"],
    sports: ["game", "jop", "status"], // position is optional
    financial: [], // Optional fields
    transfer: [], // Optional fields
    contact: [], // Optional fields
    social: [], // Optional fields
    media: [], // Optional fields
    terms: ["agreeToTerms"],
  };

  // Enhanced validation for all fields
  const validateFields = (fields, values) => {
    const errors = {};

    // Personal section validations
    if (
      fields.includes("name") &&
      (!values.name || values.name.trim() === "")
    ) {
      errors.name = "الاسم مطلوب";
    }

    if (fields.includes("age")) {
      if (!values.age || values.age === "") {
        errors.age = "العمر مطلوب";
      } else if (isNaN(Number(values.age))) {
        errors.age = "العمر يجب أن يكون رقمًا";
      } else if (Number(values.age) < 15 || Number(values.age) > 50) {
        errors.age = "العمر يجب أن يكون بين 15 و 50 سنة";
      }
    }

    if (fields.includes("gender") && !values.gender) {
      errors.gender = "الجنس مطلوب";
    }

    if (
      fields.includes("nationality") &&
      (!values.nationality || values.nationality.trim() === "")
    ) {
      errors.nationality = "الجنسية مطلوبة";
    }

    // Sports section validations
    if (
      fields.includes("game") &&
      (!values.game || values.game.trim() === "")
    ) {
      errors.game = "الرياضة مطلوبة";
    }

    // Strengthen jop validation - must be explicitly selected by user
    if (fields.includes("jop")) {
      if (!values.jopSelected) {
        // If jop has not been explicitly selected by user
        errors.jop = "الفئة مطلوبة - يرجى اختيار الفئة";
      } else if (!values.jop || !["player", "coach"].includes(values.jop)) {
        // If jop has an invalid value
        errors.jop = "الفئة مطلوبة - يجب اختيار لاعب أو مدرب";
      }
    }

    // Strengthen status validation - must be explicitly selected by user
    if (fields.includes("status")) {
      if (!values.statusSelected) {
        // If status has not been explicitly selected by user
        errors.status = "الحالة الحالية مطلوبة - يرجى اختيار الحالة";
      } else if (
        !values.status ||
        !["available", "contracted", "transferred"].includes(values.status)
      ) {
        // If status has an invalid value
        errors.status = "الحالة الحالية مطلوبة - يجب اختيار حالة صالحة";
      }
    }

    // position is optional, no validation needed

    // Terms section validation
    if (fields.includes("agreeToTerms") && !values.agreeToTerms) {
      errors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
    }

    return errors;
  };

  // Handle step navigation
  const nextStep = async () => {
    const currentSection = formSections[currentStep].id;
    const requiredFields = sectionRequiredFields[currentSection] || [];

    // Mark required fields as touched
    requiredFields.forEach((field) => {
      formik.setFieldTouched(field, true, true);
    });

    // Use both Joi validation and our custom validation
    const _errors = await formik.validateForm();

    // Add our custom validation
    const customErrors = validateFields(requiredFields, formik.values);

    // Merge errors
    const mergedErrors = { ..._errors, ...customErrors };
    const currentSectionErrors = {};

    // Filter errors for current section only
    if (mergedErrors && Object.keys(mergedErrors).length > 0) {
      Object.keys(mergedErrors).forEach((path) => {
        if (requiredFields.includes(path)) {
          currentSectionErrors[path] = mergedErrors[path];
        }
      });
    }

    // Check if current section has validation errors
    if (Object.keys(currentSectionErrors).length > 0) {
      const firstError =
        currentSectionErrors[Object.keys(currentSectionErrors)[0]];
      toast.error(
        typeof firstError === "string"
          ? firstError
          : "يرجى مراجعة الحقول المطلوبة في هذا القسم"
      );
      return;
    }

    // Proceed to next step if validation passes
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

  // Get the current form section component
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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
      dir="rtl"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={true}
      />

      <div className="container mx-auto pt-8 pb-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-[#00183D] text-right">
              {idParam ? "تعديل ملف اللاعب" : "إنشاء ملف لاعب جديد"}
            </h1>
            <p className="text-gray-500 mt-1 text-right">
              أكمل المعلومات المطلوبة أدناه
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center text-[#00183D] hover:text-[#002c65] font-medium transition-colors"
          >
            العودة إلى الملف الشخصي
            <ArrowLeft className="w-4 h-4 mr-1" />
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              الخطوة {currentStep + 1}/{formSections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {formSections[currentStep].title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep + 1) / formSections.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Step indicators for larger screens */}
        <div className="hidden md:flex mb-8 overflow-x-auto justify-between">
          {formSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col items-center mx-1 min-w-[80px] ${
                currentStep === index
                  ? "text-blue-600 font-medium"
                  : index < currentStep
                  ? "text-green-600"
                  : "text-gray-400"
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
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleFormSubmit} className="w-full">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              {/* Form content */}
              <div className="p-6 md:p-8">{renderFormSection()}</div>

              {/* Navigation buttons */}
              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 sm:flex-initial flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
                    >
                      الخطوة السابقة
                      <ChevronRight className="w-4 h-4 mr-1" />
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
                      إعادة تعيين
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
                      الخطوة التالية
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex-1 sm:flex-initial flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {idParam ? "حفظ التغييرات" : "إنشاء الملف"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload progress indicator */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">جاري الرفع...</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Success message with payment option */}
            {!idParam && canPay && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-700">
                      تم إنشاء الملف بنجاح
                    </h3>
                    <p className="text-emerald-600">
                      يمكنك الترقية لزيادة الرؤية
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Suspense
                    fallback={
                      <div className="py-4 text-center text-gray-500">
                        جاري التحميل...
                      </div>
                    }
                  >
                    <PaymentBtn playerId={player?._id} />
                  </Suspense>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
      <Toaster position="top-right" />

      {/* Fixed bottom navigation for mobile */}
      {isMobile && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center z-10 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-3 py-2 ${currentStep === 0 ? "opacity-50" : ""}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <span className="text-sm font-medium">
              {currentStep + 1}/{formSections.length}
            </span>
          </div>

          {currentStep < formSections.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="w-5 h-5" />
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
