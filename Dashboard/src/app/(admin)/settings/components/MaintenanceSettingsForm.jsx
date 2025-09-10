"use client";

import { Button } from "@/app/component/ui/button";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function MaintenanceSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    isEnabled: settings?.maintenance?.isEnabled || false,
    message: {
      ar: settings?.maintenance?.message?.ar || "",
      en: settings?.maintenance?.message?.en || ""
    }
  });

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isEnabled: checked
    });
  };

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
      
      const response = await fetch(`${API_BASE_URL}/settings/maintenance`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maintenance: formData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          maintenance: formData
        });
        toast.success(formData.isEnabled 
          ? "تم تفعيل وضع الصيانة بنجاح" 
          : "تم إلغاء تفعيل وضع الصيانة بنجاح"
        );
      } else {
        throw new Error(result.message || "فشل تحديث إعدادات الصيانة");
      }
    } catch (error) {
      console.error("Error updating maintenance settings:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">وضع الصيانة</h2>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>تنبيه:</strong> عند تفعيل وضع الصيانة، سيتم إغلاق الموقع للزوار العاديين وسيظهر لهم رسالة الصيانة. سيظل بإمكان المشرفين الوصول إلى لوحة التحكم.
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg mb-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">تفعيل وضع الصيانة</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">عند التفعيل، سيتم إغلاق الموقع للزوار</p>
            </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={handleSwitchChange}
            />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="message.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رسالة الصيانة (بالعربية)
              </label>
              <Textarea
                id="message.ar"
                name="message.ar"
                value={formData.message.ar}
                onChange={handleChange}
                placeholder="أدخل رسالة الصيانة التي ستظهر للزوار بالعربية"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رسالة الصيانة (بالإنجليزية)
              </label>
              <Textarea
                id="message.en"
                name="message.en"
                value={formData.message.en}
                onChange={handleChange}
                placeholder="Enter maintenance message that will be shown to visitors in English"
                rows={3}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={formData.isEnabled ? "bg-yellow-600 hover:bg-yellow-700" : "bg-primary hover:bg-primary/90"}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                جاري الحفظ...
              </>
            ) : formData.isEnabled ? "تفعيل وضع الصيانة" : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}
