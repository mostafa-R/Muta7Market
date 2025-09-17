"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/component/ui/dialog";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import AdvertisementForm from "./AdvertisementForm";

const buildFormData = (data) => {
    const formData = new FormData();
    const payload = {
        title: { ar: data.titleAr, en: data.titleEn },
        description: { ar: data.descriptionAr, en: data.descriptionEn },
        source: data.source,
        type: data.type,
        position: data.position,
        link: { url: data.link },
        displayPeriod: { 
            startDate: new Date(data.startDate).toISOString(), 
            endDate: new Date(data.endDate).toISOString() 
        },
        isActive: data.isActive,
        priority: data.priority,
        advertiser: {
            name: data.advertiserName,
            email: data.advertiserEmail,
            phone: data.advertiserPhone,
        },
    };

    if (data.source === 'google') {
        payload.googleAd = {
            adSlotId: data.googleAdSlotId,
            adFormat: data.googleAdFormat
        }
    }

    const mediaFormData = new FormData();
    let hasMedia = false;
    if (data.desktopImage && data.desktopImage[0]) {
        mediaFormData.append('desktop', data.desktopImage[0]);
        hasMedia = true;
    }
    if (data.mobileImage && data.mobileImage[0]) {
        mediaFormData.append('mobile', data.mobileImage[0]);
        hasMedia = true;
    }
    
    return { payload, mediaFormData, hasMedia };
};

export default function EditAdvertisementDialog({ open, onOpenChange, advertisement, onUpdate }) {

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateAdvertisement = async (data) => {
    setIsLoading(true);
    
    // التحقق من الحقول المطلوبة
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
      
      // Find first empty field and navigate to its tab, then focus
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
        // Trigger tab navigation in AdvertisementForm component
        setTimeout(() => {
          // Dispatch custom event that AdvertisementForm can listen to
          window.dispatchEvent(new CustomEvent('navigateToField', { 
            detail: { fieldName: firstEmptyField } 
          }));
          
          // Focus the field after a small delay to ensure tab change is complete
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
      const { payload, mediaFormData, hasMedia } = buildFormData(data);

      await api.patch(`/advertisements/${advertisement._id}`, payload);
      
      if (hasMedia) {
        await api.patch(`/advertisements/${advertisement._id}/media`, mediaFormData);
        // Note: Don't set Content-Type manually for FormData - browser will set it automatically with boundary
      }
      toast.success("تم تحديث الإعلان بنجاح! ✅");

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      
      // Handle specific validation errors from server
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast.error(`خطأ في البيانات: ${error.response.data.message}`);
      } else if (error.response?.status === 422 && error.response?.data?.errors) {
        toast.error("هناك أخطاء في البيانات المرسلة");
      } else if (error.response?.status === 404) {
        toast.error("الإعلان غير موجود. قد يكون محذوفاً.");
      } else if (error.response?.status === 413) {
        toast.error("حجم الملفات كبير جداً. يرجى اختيار صور أصغر.");
      } else {
        toast.error("فشل تحديث الإعلان. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 gap-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white flex-shrink-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
              </svg>
              تعديل الإعلان
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              قم بتعديل تفاصيل الإعلان وإعداداته حسب احتياجاتك
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <AdvertisementForm
            advertisement={advertisement}
            onSubmit={handleUpdateAdvertisement}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
