"use client";

import { Button } from "@/app/component/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/component/ui/dialog";
import { Input } from "@/app/component/ui/input";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function EditLegalDocumentDialog({ document, isOpen, onClose, onDocumentUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ar");
  
  const [formData, setFormData] = useState({
    title: {
      ar: document?.title?.ar || "",
      en: document?.title?.en || ""
    },
    content: {
      ar: document?.content?.ar || "",
      en: document?.content?.en || ""
    },
    version: document?.version || "1.0",
    isActive: document?.isActive !== undefined ? document.isActive : true,
    isDefault: document?.isDefault !== undefined ? document.isDefault : false,
    effectiveDate: document?.effectiveDate ? new Date(document.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    seo: {
      metaTitle: {
        ar: document?.seo?.metaTitle?.ar || "",
        en: document?.seo?.metaTitle?.en || ""
      },
      metaDescription: {
        ar: document?.seo?.metaDescription?.ar || "",
        en: document?.seo?.metaDescription?.en || ""
      },
      keywords: document?.seo?.keywords?.join(", ") || ""
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
      
      const response = await fetch(`${API_BASE_URL}/legal/${document._id}`, {
        method: "PATCH",
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
        onDocumentUpdated(result.data);
        toast.success("تم تحديث المستند القانوني بنجاح");
        onClose();
      } else {
        throw new Error(result.message || "فشل تحديث المستند القانوني");
      }
    } catch (error) {
      console.error("Error updating legal document:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل المستند القانوني</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-4">
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
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات SEO</h3>
                
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">محتوى المستند <span className="text-red-500">*</span></h3>
              
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
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">معلومات إضافية</h4>
                <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <p>النوع: {document?.type === 'terms' ? 'الشروط والأحكام' : document?.type === 'privacy' ? 'سياسة الخصوصية' : document?.type === 'refund' ? 'سياسة الاسترداد' : document?.type === 'cookies' ? 'سياسة ملفات تعريف الارتباط' : document?.type === 'disclaimer' ? 'إخلاء المسؤولية' : 'مستند مخصص'}</p>
                  <p>الرابط: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">{document?.slug}</code></p>
                  <p>تاريخ الإنشاء: {new Date(document?.createdAt).toLocaleDateString('ar-SA')}</p>
                  <p>آخر تحديث: {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString('ar-SA') : '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">إلغاء</Button>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
