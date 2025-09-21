"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import {
    AlertCircle,
    CheckCircle,
    Globe,
    Hash,
    Loader2,
    Save,
    Settings,
    Type
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MAX_SITE_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;
const MAX_TAGLINE_LENGTH = 150;

const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} مطلوب`;
  }
  return null;
};

const validateLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return `${fieldName} يجب أن يكون أقل من ${maxLength} حرف`;
  }
  return null;
};

const sanitizeInput = (input) => {
  return typeof input === 'string' ? input.trim() : '';
};

export default function GeneralSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    siteName: {
      ar: settings?.siteName?.ar || "",
      en: settings?.siteName?.en || ""
    },
    description: {
      ar: settings?.description?.ar || "",
      en: settings?.description?.en || ""
    },
    tagline: {
      ar: settings?.tagline?.ar || "",
      en: settings?.tagline?.en || ""
    },
    keywords: {
      ar: settings?.keywords?.ar || "",
      en: settings?.keywords?.en || ""
    }
  });

  const validateForm = useCallback((data) => {
    const errors = {};
    
    const siteNameArError = validateRequired(data.siteName.ar, "اسم الموقع بالعربية") ||
                           validateLength(data.siteName.ar, MAX_SITE_NAME_LENGTH, "اسم الموقع بالعربية");
    if (siteNameArError) errors['siteName.ar'] = siteNameArError;
    
    const siteNameEnError = validateRequired(data.siteName.en, "اسم الموقع بالإنجليزية") ||
                           validateLength(data.siteName.en, MAX_SITE_NAME_LENGTH, "اسم الموقع بالإنجليزية");
    if (siteNameEnError) errors['siteName.en'] = siteNameEnError;
    
    const descArError = validateLength(data.description.ar, MAX_DESCRIPTION_LENGTH, "الوصف بالعربية");
    if (descArError) errors['description.ar'] = descArError;
    
    const descEnError = validateLength(data.description.en, MAX_DESCRIPTION_LENGTH, "الوصف بالإنجليزية");
    if (descEnError) errors['description.en'] = descEnError;
    
    const taglineArError = validateLength(data.tagline.ar, MAX_TAGLINE_LENGTH, "الشعار بالعربية");
    if (taglineArError) errors['tagline.ar'] = taglineArError;
    
    const taglineEnError = validateLength(data.tagline.en, MAX_TAGLINE_LENGTH, "الشعار بالإنجليزية");
    if (taglineEnError) errors['tagline.en'] = taglineEnError;
    
    const keywordsArError = validateLength(data.keywords.ar, MAX_KEYWORDS_LENGTH, "الكلمات المفتاحية بالعربية");
    if (keywordsArError) errors['keywords.ar'] = keywordsArError;
    
    const keywordsEnError = validateLength(data.keywords.en, MAX_KEYWORDS_LENGTH, "الكلمات المفتاحية بالإنجليزية");
    if (keywordsEnError) errors['keywords.en'] = keywordsEnError;
    
    return errors;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: sanitizedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    }
    
    setHasChanges(true);
    setError(null);
  }, []);

  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(errors);
  }, [formData, validateForm]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("يرجى تصحيح الأخطاء قبل الحفظ");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          ...formData
        });
        setHasChanges(false);
        setSuccessMessage("تم تحديث الإعدادات العامة بنجاح");
        toast.success("تم تحديث الإعدادات العامة بنجاح");
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث الإعدادات العامة");
      }
    } catch (error) {
      console.error("Error updating general settings:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث الإعدادات العامة";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, settings, setSettings]);

  const completionPercentage = useMemo(() => {
    const totalFields = 8; 
    const filledFields = [
      formData.siteName.ar,
      formData.siteName.en,
      formData.description.ar,
      formData.description.en,
      formData.tagline.ar,
      formData.tagline.en,
      formData.keywords.ar,
      formData.keywords.en
    ].filter(field => field && field.trim().length > 0).length;
    
    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Settings className="w-7 h-7" />
              الإعدادات العامة
            </h1>
            <p className="text-blue-100">إدارة المعلومات الأساسية للموقع والتحكم في الإعدادات العامة</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
           
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <Globe className="w-5 h-5" />
                <span className="text-xl font-bold">2</span>
              </div>
              <p className="text-blue-200">لغات مدعومة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">حدث خطأ</h3>
                <p className="text-red-700 text-sm mb-2">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  إخفاء الرسالة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200">
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">تم الحفظ بنجاح</h3>
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessMessage(null)} 
                className="text-green-600 hover:text-green-800 font-medium px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {hasChanges && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Save className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                لديك تغييرات غير محفوظة في الإعدادات العامة. تذكر حفظ التغييرات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200">
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">يرجى تصحيح الأخطاء التالية</h3>
                <div className="space-y-1">
                  {Object.values(validationErrors).slice(0, 3).map((error, idx) => (
                    <p key={idx} className="text-orange-700 text-sm">• {error}</p>
                  ))}
                  {Object.keys(validationErrors).length > 3 && (
                    <p className="text-orange-600 text-sm font-medium">
                      و {Object.keys(validationErrors).length - 3} أخطاء أخرى...
                    </p>
                  )}
                </div>
              </div>
              <div className="text-orange-600 font-bold text-lg">
                {Object.keys(validationErrors).length}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Name Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Type className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">اسم الموقع</h3>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <p className="text-gray-600 text-sm">اسم الموقع الذي سيظهر في العنوان وأعلى الصفحات</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="siteName.ar" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Hash className="w-4 h-4 text-gray-500" />
                  اسم الموقع (بالعربية)
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="siteName.ar"
                  name="siteName.ar"
                  value={formData.siteName.ar}
                  onChange={handleChange}
                  placeholder="أدخل اسم الموقع بالعربية"
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['siteName.ar'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  maxLength={MAX_SITE_NAME_LENGTH}
                  required
                />
                {validationErrors['siteName.ar'] && (
                  <p className="text-red-600 text-xs">{validationErrors['siteName.ar']}</p>
                )}
                <p className="text-xs text-gray-500">
                  ({formData.siteName.ar.length}/{MAX_SITE_NAME_LENGTH}) حرف
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="siteName.en" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Hash className="w-4 h-4 text-gray-500" />
                  اسم الموقع (بالإنجليزية)
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="siteName.en"
                  name="siteName.en"
                  value={formData.siteName.en}
                  onChange={handleChange}
                  placeholder="Enter site name in English"
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['siteName.en'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  maxLength={MAX_SITE_NAME_LENGTH}
                  required
                />
                {validationErrors['siteName.en'] && (
                  <p className="text-red-600 text-xs">{validationErrors['siteName.en']}</p>
                )}
                <p className="text-xs text-gray-500">
                  ({formData.siteName.en.length}/{MAX_SITE_NAME_LENGTH}) characters
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">حفظ التغييرات</h3>
                {!hasChanges ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">محفوظ</span>
                  </div>
                ) : !isFormValid ? (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">يحتاج تصحيح</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">جاهز للحفظ</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {!hasChanges 
                  ? "جميع التغييرات محفوظة" 
                  : !isFormValid 
                    ? `يرجى تصحيح ${Object.keys(validationErrors).length} خطأ قبل الحفظ`
                    : "لديك تغييرات غير محفوظة في الإعدادات العامة"}
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !hasChanges || !isFormValid}
              className="bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-3 text-lg flex items-center gap-3 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}