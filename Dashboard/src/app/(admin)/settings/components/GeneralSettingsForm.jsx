"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function GeneralSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    siteName: {
      ar: settings?.siteName?.ar || "",
      en: settings?.siteName?.en || ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
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
          siteName: formData.siteName
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          siteName: formData.siteName
        });
        toast.success("تم تحديث الإعدادات العامة بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث الإعدادات");
      }
    } catch (error) {
   
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6" dir="rtl">
        <div>
          <h2 className="text-xl font-semibold mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="siteName.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم الموقع (بالعربية)
              </label>
              <Input
                id="siteName.ar"
                name="siteName.ar"
                value={formData.siteName.ar}
                onChange={handleChange}
                placeholder="أدخل اسم الموقع بالعربية"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="siteName.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم الموقع (بالإنجليزية)
              </label>
              <Input
                id="siteName.en"
                name="siteName.en"
                value={formData.siteName.en}
                onChange={handleChange}
                placeholder="Enter site name in English"
                required
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
