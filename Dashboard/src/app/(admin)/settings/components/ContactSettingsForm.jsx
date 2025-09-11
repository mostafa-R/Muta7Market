"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import { Facebook, Info, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Save, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    email: settings?.contactInfo?.email || "",
    phone: settings?.contactInfo?.phone || "",
    address: {
      ar: settings?.contactInfo?.address?.ar || "",
      en: settings?.contactInfo?.address?.en || ""
    },
    socialMedia: {
      facebook: settings?.contactInfo?.socialMedia?.facebook || "",
      twitter: settings?.contactInfo?.socialMedia?.twitter || "",
      instagram: settings?.contactInfo?.socialMedia?.instagram || "",
      youtube: settings?.contactInfo?.socialMedia?.youtube || "",
      linkedin: settings?.contactInfo?.socialMedia?.linkedin || ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      
      if (parts.length === 2) {
        setFormData({
          ...formData,
          [parts[0]]: {
            ...formData[parts[0]],
            [parts[1]]: value
          }
        });
      } else if (parts.length === 3) {
        setFormData({
          ...formData,
          [parts[0]]: {
            ...formData[parts[0]],
            [parts[1]]: {
              ...formData[parts[0]][parts[1]],
              [parts[2]]: value
            }
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    setHasChanges(true);
  };
  
  // Validate URL format for social media links
  const isValidUrl = (url) => {
    if (!url) return true; // Empty is valid (optional field)
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate social media URLs
    const socialMediaFields = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'];
    for (const field of socialMediaFields) {
      const url = formData.socialMedia[field];
      if (url && !isValidUrl(url)) {
        toast.error(`رابط ${field} غير صالح. يرجى إدخال رابط صحيح`);
        return;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
      
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactInfo: formData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          contactInfo: formData
        });
        setHasChanges(false);
        toast.success("تم تحديث معلومات الاتصال بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث معلومات الاتصال");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <div className="space-y-6">
        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              لديك تغييرات غير محفوظة
            </p>
          </div>
        )}
        
        <div className=" dark:bg-blue-900/10 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            معلومات الاتصال
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">هذه المعلومات سيتم عرضها للزوار في صفحة الاتصال وفي تذييل الموقع</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-500" />
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="أدخل البريد الإلكتروني للاتصال"
                  className="pr-10 focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">سيتم استخدام هذا البريد للتواصل مع العملاء</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-500" />
                رقم الهاتف
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="أدخل رقم الهاتف للاتصال"
                  className="pr-10 focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">سيتم عرض رقم الهاتف في صفحة الاتصال</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="address.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                العنوان (بالعربية)
              </label>
              <div className="relative">
                <Textarea
                  id="address.ar"
                  name="address.ar"
                  value={formData.address.ar}
                  onChange={handleChange}
                  placeholder="أدخل العنوان بالعربية"
                  rows={2}
                  className="focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500">العنوان الذي سيظهر في الواجهة العربية</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                العنوان (بالإنجليزية)
              </label>
              <div className="relative">
                <Textarea
                  id="address.en"
                  name="address.en"
                  value={formData.address.en}
                  onChange={handleChange}
                  placeholder="Enter address in English"
                  rows={2}
                  className="focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500">العنوان الذي سيظهر في الواجهة الإنجليزية</p>
            </div>
          </div>
          
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
          <Button 
            type="submit" 
            disabled={isSubmitting || !hasChanges}
            className="bg-primary hover:bg-primary/90  flex items-center gap-2 transition-all px-6 py-2 shadow-sm "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
