"use client";
import { useState, useCallback } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { playerFormSchema } from "./types/schema";

// Import all components
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { SportsInfoCard } from "./components/SportsInfoCard";
import { FinancialInfoCard } from "./components/FinancialInfoCard";
import { TransferInfoCard } from "./components/TransferInfoCard";
import { SocialLinksCard } from "./components/SocialLinksCard";
import { ContactInfoCard } from "./components/ContactInfoCard";
import { MediaUploadCard } from "./components/MediaUploadCard";
import { TermsCard } from "./components/TermsCard";

// Helper function to get cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export default function RegisterProfile() {
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/webm"];
  const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

  const uploadFile = async (file: File, endpoint: string) => {
    const token = getCookie("accessToken");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw new Error("فشل في رفع الملف");
    }
  };

  const handleSubmit = useCallback(
    async (values: any, { setSubmitting, setErrors, resetForm }: any) => {
      try {
        let profileImage = values.media.profileImage;
        if (values.profilePictureFile) {
          const uploadedImage = await uploadFile(
            values.profilePictureFile,
            "http://localhost:5000/api/v1/upload/image"
          );
          profileImage = {
            url: uploadedImage.url,
            publicId: uploadedImage.publicId,
          };
        }

        const videos = await Promise.all(
          values.media.videos.map(async (video: any) => {
            if (video.file) {
              const uploadedVideo = await uploadFile(
                video.file,
                "http://localhost:5000/api/v1/upload/video"
              );
              return {
                ...video,
                url: uploadedVideo.url,
                publicId: uploadedVideo.publicId,
                file: undefined,
              };
            }
            return video;
          })
        );

        const documents = await Promise.all(
          values.media.documents.map(async (doc: any) => {
            if (doc.file) {
              const uploadedDoc = await uploadFile(
                doc.file,
                "http://localhost:5000/api/v1/upload/document"
              );
              return {
                ...doc,
                url: uploadedDoc.url,
                publicId: uploadedDoc.publicId,
                file: undefined,
              };
            }
            return doc;
          })
        );

        const payload = {
          ...values,
          gender: values.gender?.toLowerCase(),
          status: values.status?.toUpperCase(),
          jop: values.category,
          yearSalary: values.yearSalary ? Number(values.yearSalary) : null,
          media: {
            ...values.media,
            profileImage,
            videos,
            documents,
          },
          contractEndDate: values.contractEndDate
            ? new Date(values.contractEndDate).toISOString()
            : null,
        };

        if (!values.isPromoted.type) {
          delete values.isPromoted.type;
        }

        const res = await axios.post(
          "http://localhost:5000/api/v1/players/createPlayer",
          payload,
          { withCredentials: true }
        );

        alert("تم إرسال البيانات بنجاح!");
        resetForm();
      } catch (error: any) {
        if (error.response) {
          setErrors(error.response.data.errors || {});
          console.log(error);
          alert(error.response.data?.message || "حدث خطأ أثناء إرسال البيانات");
        } else if (error.request) {
          alert("لم يتم تلقي رد من السيرفر");
        } else {
          alert("خطأ غير متوقع");
          console.log(error);
        }
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      age: "",
      gender: "",
      nationality: "",
      category: "",
      position: "",
      status: "",
      expreiance: "",
      monthlySalary: { amount: 0, currency: "SAR" },
      yearSalary: "",
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
      agreeToTerms: false,
      profilePicturePreview: "",
      profilePictureFile: undefined,
    },
    validate: (values) => {
      const { error } = playerFormSchema.validate(values, {
        abortEarly: false,
      });
      if (!error) return {};
      const errors: Record<string, string> = {};
      error.details.forEach((detail) => {
        const path = detail.path.join(".");
        errors[path] = detail.message;
      });
      return errors;
    },
    onSubmit: handleSubmit,
  });

  const handleFileValidation = (
    file: File,
    allowedTypes: string[],
    maxSize: number
  ) => {
    if (!allowedTypes.includes(file.type)) {
      return "نوع الملف غير مدعوم";
    }
    if (file.size > maxSize) {
      return "حجم الملف كبير جدًا (الحد الأقصى 2MB)";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            سجل بياناتك
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أنشئ ملفك الشخصي الاحترافي وابدأ رحلتك الرياضية معنا
          </p>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className="max-w-3xl mx-auto space-y-6 p-4"
        >
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

          <ContactInfoCard formik={formik} />

          <MediaUploadCard
            formik={formik}
            handleFileValidation={handleFileValidation}
            ALLOWED_VIDEO_TYPES={ALLOWED_VIDEO_TYPES}
            ALLOWED_DOCUMENT_TYPES={ALLOWED_DOCUMENT_TYPES}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
          />

          <TermsCard formik={formik} />
        </form>
      </div>
    </div>
  );
}
