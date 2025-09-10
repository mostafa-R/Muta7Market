"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">معلومات الاتصال</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل البريد الإلكتروني للاتصال"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم الهاتف
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف للاتصال"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="address.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                العنوان (بالعربية)
              </label>
              <Textarea
                id="address.ar"
                name="address.ar"
                value={formData.address.ar}
                onChange={handleChange}
                placeholder="أدخل العنوان بالعربية"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                العنوان (بالإنجليزية)
              </label>
              <Textarea
                id="address.en"
                name="address.en"
                value={formData.address.en}
                onChange={handleChange}
                placeholder="Enter address in English"
                rows={2}
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-4 mt-8">وسائل التواصل الاجتماعي</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                فيسبوك
              </label>
              <Input
                id="socialMedia.facebook"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                تويتر
              </label>
              <Input
                id="socialMedia.twitter"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                انستغرام
              </label>
              <Input
                id="socialMedia.instagram"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="socialMedia.youtube" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                يوتيوب
              </label>
              <Input
                id="socialMedia.youtube"
                name="socialMedia.youtube"
                value={formData.socialMedia.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="socialMedia.linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                لينكد إن
              </label>
              <Input
                id="socialMedia.linkedin"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                جاري الحفظ...
              </>
            ) : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}
