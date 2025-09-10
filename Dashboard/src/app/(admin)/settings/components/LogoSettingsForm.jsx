"use client";

import { Button } from "@/app/component/ui/button";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function LogoSettingsForm({ settings, setSettings }) {
  const [isSubmittingLogo, setIsSubmittingLogo] = useState(false);
  const [isSubmittingFavicon, setIsSubmittingFavicon] = useState(false);
  const [logoPreview, setLogoPreview] = useState(settings?.logo?.url || null);
  const [faviconPreview, setFaviconPreview] = useState(settings?.favicon?.url || null);
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جدًا. الحد الأقصى هو 2 ميجابايت");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    
    if (file.size > 1 * 1024 * 1024) {
      toast.error("حجم الأيقونة كبير جدًا. الحد الأقصى هو 1 ميجابايت");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    
    if (!logoInputRef.current.files[0]) {
      toast.error("يرجى اختيار شعار للموقع");
      return;
    }
    
    setIsSubmittingLogo(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const formData = new FormData();
      formData.append('logo', logoInputRef.current.files[0]);
      
      const response = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          logo: result.data.logo
        });
        toast.success("تم تحديث شعار الموقع بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث شعار الموقع");
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmittingLogo(false);
    }
  };

  const handleFaviconSubmit = async (e) => {
    e.preventDefault();
    
    if (!faviconInputRef.current.files[0]) {
      toast.error("يرجى اختيار أيقونة للموقع");
      return;
    }
    
    setIsSubmittingFavicon(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const formData = new FormData();
      formData.append('favicon', faviconInputRef.current.files[0]);
      
      const response = await fetch(`${API_BASE_URL}/settings/favicon`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          favicon: result.data.favicon
        });
        toast.success("تم تحديث أيقونة الموقع بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث أيقونة الموقع");
      }
    } catch (error) {
      console.error("Error updating favicon:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmittingFavicon(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">شعار الموقع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800">
              {logoPreview ? (
                <div className="relative w-full h-32 mb-4">
                  <Image 
                    src={logoPreview} 
                    alt="شعار الموقع" 
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center text-gray-400 mb-4">
                  لا يوجد شعار حالياً
                </div>
              )}
              
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
              >
                اختيار شعار جديد
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                يفضل استخدام صورة بصيغة SVG أو PNG بخلفية شفافة. الحد الأقصى للحجم: 2 ميجابايت
              </p>
            </div>
            
            <Button 
              onClick={handleLogoSubmit} 
              disabled={isSubmittingLogo || !logoPreview}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmittingLogo ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  جاري الرفع...
                </>
              ) : "تحديث الشعار"}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800">
              {faviconPreview ? (
                <div className="relative w-16 h-16 mb-4">
                  <Image 
                    src={faviconPreview} 
                    alt="أيقونة الموقع" 
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 flex items-center justify-center text-gray-400 mb-4">
                  لا توجد أيقونة
                </div>
              )}
              
              <input
                type="file"
                ref={faviconInputRef}
                onChange={handleFaviconChange}
                accept="image/*"
                className="hidden"
                id="favicon-upload"
              />
              <label
                htmlFor="favicon-upload"
                className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
              >
                اختيار أيقونة جديدة
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                يفضل استخدام صورة مربعة بصيغة ICO أو PNG. الحد الأقصى للحجم: 1 ميجابايت
              </p>
            </div>
            
            <Button 
              onClick={handleFaviconSubmit} 
              disabled={isSubmittingFavicon || !faviconPreview}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmittingFavicon ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  جاري الرفع...
                </>
              ) : "تحديث الأيقونة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
