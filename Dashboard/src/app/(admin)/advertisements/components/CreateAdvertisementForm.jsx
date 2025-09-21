"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import AdvertisementForm from "./AdvertisementForm";

const buildFormData = (data) => {
  const formData = new FormData();


  formData.append("title[ar]", data.titleAr);
  formData.append("title[en]", data.titleEn);
  if (data.descriptionAr) formData.append("description[ar]", data.descriptionAr);
  if (data.descriptionEn) formData.append("description[en]", data.descriptionEn);
  
  formData.append("source", data.source);
  if (data.source === 'google') {
    if(data.googleAdSlotId) formData.append("googleAd[adSlotId]", data.googleAdSlotId);
    if(data.googleAdFormat) formData.append("googleAd[adFormat]", data.googleAdFormat);
  }

  formData.append("type", data.type);
  formData.append("position", data.position);
  if (data.source === 'internal' && data.link) formData.append("link[url]", data.link);
  
  formData.append("displayPeriod[startDate]", new Date(data.startDate).toISOString());
  formData.append("displayPeriod[endDate]", new Date(data.endDate).toISOString());
  formData.append("isActive", data.isActive);
  formData.append("priority", data.priority);

  // Advertiser
  formData.append("advertiser[name]", data.advertiserName);
  formData.append("advertiser[email]", data.advertiserEmail);
  if (data.advertiserPhone) formData.append("advertiser[phone]", data.advertiserPhone);
  
  // Media
  if (data.desktopImage && data.desktopImage[0]) {
    formData.append("desktop", data.desktopImage[0]);
  }
  if (data.mobileImage && data.mobileImage[0]) {
    formData.append("mobile", data.mobileImage[0]);
  }

  return formData;
};

export default function CreateAdvertisementForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  

  const handleCreateAdvertisement = async (data) => {
    setIsLoading(true);
    
 
    const errors = [];

    
    if (!data.titleAr || data.titleAr.trim() === "") {
      errors.push("العنوان بالعربية مطلوب");
    }
    if (!data.titleEn || data.titleEn.trim() === "") {
      errors.push("العنوان بالإنجليزية مطلوب");
    }
    if (!data.advertiserName || data.advertiserName.trim() === "") {
      errors.push("اسم المعلن مطلوب");
    }
    if (!data.advertiserEmail || data.advertiserEmail.trim() === "") {
      errors.push("البريد الإلكتروني للمعلن مطلوب");
    }
    
    if (data.source === 'google') {
      if (!data.googleAdSlotId || data.googleAdSlotId.trim() === "") {
        errors.push("معرف الوحدة الإعلانية مطلوب للإعلانات من Google");
      }
    } else if (data.source === 'internal') {
      if (!data.link || data.link.trim() === "") {
        errors.push("رابط الإعلان مطلوب للإعلانات الداخلية");
      }
    }
    
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      errors.push("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء");
    }
    
 
    
    if (errors.length > 0) {
      setIsLoading(false);
      toast.error("يرجى ملء جميع الحقول المطلوبة: " + errors.join(", "));
      
      
      const firstEmptyField = (() => {
        if (!data.titleAr || data.titleAr.trim() === "") return 'titleAr';
        if (!data.titleEn || data.titleEn.trim() === "") return 'titleEn';
        if (!data.advertiserName || data.advertiserName.trim() === "") return 'advertiserName';
        if (!data.advertiserEmail || data.advertiserEmail.trim() === "") return 'advertiserEmail';
        if (data.source === 'google' && (!data.googleAdSlotId || data.googleAdSlotId.trim() === "")) return 'googleAdSlotId';
        if (data.source === 'internal' && (!data.link || data.link.trim() === "")) return 'link';
        return null;
      })();

      if (firstEmptyField) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToField', { 
            detail: { fieldName: firstEmptyField } 
          }));
          
          setTimeout(() => {
            const field = document.querySelector(`input[name="${firstEmptyField}"]`);
            if (field) {
              field.focus();
              field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }, 100);
      }
      
      return;
    }
    
    try {
      const formData = buildFormData(data);
      await api.post("/advertisements", formData);
      toast.success("تم إنشاء الإعلان بنجاح! 🎉");
      onSuccess();
    } catch (error) {
      console.error("Error creating advertisement:", error);
      
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast.error(`خطأ في البيانات: ${error.response.data.message}`);
      } else if (error.response?.status === 422 && error.response?.data?.errors) {
        toast.error("هناك أخطاء في البيانات المرسلة");
      } else if (error.response?.status === 413) {
        toast.error("حجم الملفات كبير جداً. يرجى اختيار صور أصغر.");
      } else {
        toast.error("فشل إنشاء الإعلان. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdvertisementForm onSubmit={handleCreateAdvertisement} isLoading={isLoading} />
  );
}
