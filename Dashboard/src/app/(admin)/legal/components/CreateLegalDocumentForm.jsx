"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateLegalDocumentForm({ onDocumentCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ar");
  
  const [formData, setFormData] = useState({
    type: "terms",
    title: {
      ar: "",
      en: ""
    },
    content: {
      ar: "",
      en: ""
    },
    version: "1.0",
    isActive: true,
    isDefault: false,
    effectiveDate: new Date().toISOString().split('T')[0],
    seo: {
      metaTitle: {
        ar: "",
        en: ""
      },
      metaDescription: {
        ar: "",
        en: ""
      },
      keywords: ""
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

  const handleSwitchChange = (field, checked) => {
    setFormData({
      ...formData,
      [field]: checked
    });
  };

  const handleEditorChange = (content, lang) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [lang]: content
      }
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.ar || !formData.title.en || !formData.content.ar || !formData.content.en) {
      toast.error("يرجى إدخال العنوان والمحتوى باللغتين العربية والإنجليزية");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      // إعداد بيانات الطلب
      const keywords = formData.seo.keywords
        ? formData.seo.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword !== "")
        : [];
      
      const documentData = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        version: formData.version,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        effectiveDate: formData.effectiveDate,
        seo: {
          metaTitle: formData.seo.metaTitle,
          metaDescription: formData.seo.metaDescription,
          keywords
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/legal`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        onDocumentCreated(result.data);
        // إعادة تعيين النموذج
        setFormData({
          type: "terms",
          title: { ar: "", en: "" },
          content: { ar: "", en: "" },
          version: "1.0",
          isActive: true,
          isDefault: false,
          effectiveDate: new Date().toISOString().split('T')[0],
          seo: {
            metaTitle: { ar: "", en: "" },
            metaDescription: { ar: "", en: "" },
            keywords: ""
          }
        });
      } else {
        throw new Error(result.message || "فشل إنشاء المستند القانوني");
      }
    } catch (error) {
      console.error("Error creating legal document:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">المعلومات الأساسية</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  نوع المستند <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="terms">الشروط والأحكام</option>
                  <option value="privacy">سياسة الخصوصية</option>
                  <option value="refund">سياسة الاسترداد</option>
                  <option value="cookies">سياسة ملفات تعريف الارتباط</option>
                  <option value="disclaimer">إخلاء المسؤولية</option>
                  <option value="custom">مستند مخصص</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="title.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  العنوان (بالعربية) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title.ar"
                  name="title.ar"
                  value={formData.title.ar}
                  onChange={handleChange}
                  placeholder="أدخل عنوان المستند بالعربية"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="title.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  العنوان (بالإنجليزية) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title.en"
                  name="title.en"
                  value={formData.title.en}
                  onChange={handleChange}
                  placeholder="Enter document title in English"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  رقم الإصدار <span className="text-red-500">*</span>
                </label>
                <Input
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="مثال: 1.0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ السريان <span className="text-red-500">*</span>
                </label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات SEO</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="seo.metaTitle.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  عنوان Meta (بالعربية)
                </label>
                <Input
                  id="seo.metaTitle.ar"
                  name="seo.metaTitle.ar"
                  value={formData.seo.metaTitle.ar}
                  onChange={handleChange}
                  placeholder="أدخل عنوان Meta بالعربية"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.seo.metaTitle.ar.length}/60 حرف
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seo.metaTitle.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  عنوان Meta (بالإنجليزية)
                </label>
                <Input
                  id="seo.metaTitle.en"
                  name="seo.metaTitle.en"
                  value={formData.seo.metaTitle.en}
                  onChange={handleChange}
                  placeholder="Enter Meta title in English"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.seo.metaTitle.en.length}/60 character
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seo.metaDescription.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  وصف Meta (بالعربية)
                </label>
                <Textarea
                  id="seo.metaDescription.ar"
                  name="seo.metaDescription.ar"
                  value={formData.seo.metaDescription.ar}
                  onChange={handleChange}
                  placeholder="أدخل وصف Meta بالعربية"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.seo.metaDescription.ar.length}/160 حرف
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seo.metaDescription.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  وصف Meta (بالإنجليزية)
                </label>
                <Textarea
                  id="seo.metaDescription.en"
                  name="seo.metaDescription.en"
                  value={formData.seo.metaDescription.en}
                  onChange={handleChange}
                  placeholder="Enter Meta description in English"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.seo.metaDescription.en.length}/160 character
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  الكلمات المفتاحية
                </label>
                <Textarea
                  id="seo.keywords"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={handleChange}
                  placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
                  rows={2}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  أدخل الكلمات المفتاحية مفصولة بفواصل (مثال: شروط، أحكام، خصوصية)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">محتوى المستند <span className="text-red-500">*</span></h3>
            
            <div className="space-y-4">
              <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
                <button
                  type="button"
                  className={`px-4 py-2 ${activeTab === 'ar' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => handleTabChange('ar')}
                >
                  المحتوى بالعربية
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 ${activeTab === 'en' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => handleTabChange('en')}
                >
                  المحتوى بالإنجليزية
                </button>
              </div>
              
              <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                <div className="min-h-[400px]">
                  <Textarea
                    value={formData.content.ar}
                    onChange={(e) => handleEditorChange(e.target.value, 'ar')}
                    placeholder="أدخل محتوى المستند بالعربية..."
                    className="h-[350px] mb-12 resize-none"
                    rows={15}
                  />
                </div>
              </div>
              
              <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                <div className="min-h-[400px]">
                  <Textarea
                    value={formData.content.en}
                    onChange={(e) => handleEditorChange(e.target.value, 'en')}
                    placeholder="Enter document content in English..."
                    className="h-[350px] mb-12 resize-none"
                    rows={15}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات إضافية</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">الحالة</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تفعيل أو تعطيل المستند</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">المستند الافتراضي</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تعيين كمستند افتراضي لهذا النوع</p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleSwitchChange('isDefault', checked)}
                />
              </div>
            </div>
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
              جاري الإنشاء...
            </>
          ) : "إنشاء المستند"}
        </Button>
      </div>
    </form>
  );
}
