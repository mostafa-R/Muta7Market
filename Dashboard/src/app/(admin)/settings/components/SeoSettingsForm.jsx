"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/component/ui/alert-dialog";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Eye,
  Hash,
  Info,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Tag,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_KEYWORDS_LENGTH = 500;
const OPTIMAL_TITLE_LENGTH = 50;
const OPTIMAL_DESCRIPTION_LENGTH = 140;
const DEFAULT_VALUES = {
  metaTitle: { ar: "", en: "" },
  metaDescription: { ar: "", en: "" },
  keywords: "",
  googleAnalyticsId: ""
};

const validateTitle = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} مطلوب`;
  }
  if (value.length > MAX_TITLE_LENGTH) {
    return `${fieldName} يجب أن يكون أقل من ${MAX_TITLE_LENGTH} حرف`;
  }
  return null;
};

const validateDescription = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} مطلوب`;
  }
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `${fieldName} يجب أن يكون أقل من ${MAX_DESCRIPTION_LENGTH} حرف`;
  }
  return null;
};

const validateGoogleAnalyticsId = (value) => {
  if (!value) return null; 
  
  const gaPatterns = [
    /^UA-\d{4,10}-\d{1,4}$/, 
    /^G-[A-Z0-9]{10}$/, 
    /^AW-\d{9,11}$/, 
    /^DC-\d{7,10}$/
  ];
  
  const isValid = gaPatterns.some(pattern => pattern.test(value));
  if (!isValid) {
    return "معرف Google Analytics غير صحيح. استخدم تنسيق UA-XXXXXXX-X أو G-XXXXXXXXXX";
  }
  
  return null;
};

const sanitizeInput = (input) => {
  return typeof input === 'string' ? input.trim() : '';
};

const parseKeywords = (keywordsString) => {
  return keywordsString
    .split(',')
    .map(keyword => sanitizeInput(keyword))
    .filter(keyword => keyword !== "");
};

export default function SeoSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    metaTitle: {
      ar: settings?.seo?.metaTitle?.ar || DEFAULT_VALUES.metaTitle.ar,
      en: settings?.seo?.metaTitle?.en || DEFAULT_VALUES.metaTitle.en
    },
    metaDescription: {
      ar: settings?.seo?.metaDescription?.ar || DEFAULT_VALUES.metaDescription.ar,
      en: settings?.seo?.metaDescription?.en || DEFAULT_VALUES.metaDescription.en
    },
    keywords: Array.isArray(settings?.seo?.keywords) ? settings.seo.keywords.join(", ") : (settings?.seo?.keywords || DEFAULT_VALUES.keywords),
    googleAnalyticsId: settings?.seo?.googleAnalyticsId || DEFAULT_VALUES.googleAnalyticsId
  });

  const validateForm = useCallback((data) => {
    const errors = {};
    
    const titleArError = validateTitle(data.metaTitle.ar, "العنوان بالعربية");
    if (titleArError) errors['metaTitle.ar'] = titleArError;
    
    const titleEnError = validateTitle(data.metaTitle.en, "العنوان بالإنجليزية");
    if (titleEnError) errors['metaTitle.en'] = titleEnError;
    
    const descArError = validateDescription(data.metaDescription.ar, "الوصف بالعربية");
    if (descArError) errors['metaDescription.ar'] = descArError;
    
    const descEnError = validateDescription(data.metaDescription.en, "الوصف بالإنجليزية");
    if (descEnError) errors['metaDescription.en'] = descEnError;
    
    if (data.keywords && data.keywords.length > MAX_KEYWORDS_LENGTH) {
      errors.keywords = `الكلمات المفتاحية يجب أن تكون أقل من ${MAX_KEYWORDS_LENGTH} حرف`;
    }
    
    const gaError = validateGoogleAnalyticsId(data.googleAnalyticsId);
    if (gaError) errors.googleAnalyticsId = gaError;
    
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

  const seoAnalysis = useMemo(() => {
    const keywords = parseKeywords(formData.keywords);
    const analysis = {
      titleOptimization: {
        ar: formData.metaTitle.ar.length >= 30 && formData.metaTitle.ar.length <= OPTIMAL_TITLE_LENGTH,
        en: formData.metaTitle.en.length >= 30 && formData.metaTitle.en.length <= OPTIMAL_TITLE_LENGTH
      },
      descriptionOptimization: {
        ar: formData.metaDescription.ar.length >= 120 && formData.metaDescription.ar.length <= OPTIMAL_DESCRIPTION_LENGTH,
        en: formData.metaDescription.en.length >= 120 && formData.metaDescription.en.length <= OPTIMAL_DESCRIPTION_LENGTH
      },
      keywordsCount: keywords.length,
      hasAnalytics: !!formData.googleAnalyticsId,
      completionPercentage: 0
    };
    
    let completed = 0;
    const total = 8;
    
    if (formData.metaTitle.ar) completed++;
    if (formData.metaTitle.en) completed++;
    if (formData.metaDescription.ar) completed++;
    if (formData.metaDescription.en) completed++;
    if (analysis.titleOptimization.ar) completed++;
    if (analysis.titleOptimization.en) completed++;
    if (analysis.descriptionOptimization.ar) completed++;
    if (analysis.descriptionOptimization.en) completed++;
    
    analysis.completionPercentage = Math.round((completed / total) * 100);
    
    return analysis;
  }, [formData]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/settings/seo/restore`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const defaultSeo = result.data?.seo || DEFAULT_VALUES;
        
        setSettings({
          ...settings,
          seo: defaultSeo
        });
        
        setFormData({
          metaTitle: {
            ar: defaultSeo.metaTitle?.ar || "",
            en: defaultSeo.metaTitle?.en || ""
          },
          metaDescription: {
            ar: defaultSeo.metaDescription?.ar || "",
            en: defaultSeo.metaDescription?.en || ""
          },
          keywords: Array.isArray(defaultSeo.keywords) ? defaultSeo.keywords.join(", ") : (defaultSeo.keywords || ""),
          googleAnalyticsId: defaultSeo.googleAnalyticsId || ""
        });
        
        setSuccessMessage("تم استعادة إعدادات SEO الافتراضية بنجاح");
        toast.success("تم استعادة إعدادات SEO الافتراضية بنجاح");
        setHasChanges(false);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل استعادة إعدادات SEO الافتراضية");
      }
    } catch (error) {
      console.error("Error restoring default SEO settings:", error);
      const errorMessage = error.message || "حدث خطأ أثناء استعادة إعدادات SEO الافتراضية";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRestoring(false);
      setShowRestoreDialog(false);
    }
  }, [settings, setSettings]);

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
      
      const keywords = parseKeywords(formData.keywords);
      
      const response = await fetch(`${API_BASE_URL}/settings/seo`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seo: {
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            keywords,
            googleAnalyticsId: formData.googleAnalyticsId
          }
        })
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
          seo: {
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            keywords,
            googleAnalyticsId: formData.googleAnalyticsId
          }
        });
        
        setSuccessMessage("تم تحديث إعدادات SEO بنجاح");
        toast.success("تم تحديث إعدادات SEO بنجاح");
        setHasChanges(false);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث إعدادات SEO");
      }
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث إعدادات SEO";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, settings, setSettings]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Search className="w-7 h-7" />
              إعدادات محركات البحث (SEO)
            </h1>
            <p className="text-blue-100">تحسين ظهور الموقع في نتائج محركات البحث</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xl font-bold">{seoAnalysis.completionPercentage}%</span>
              </div>
              <p className="text-blue-200">تحسين SEO</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <Hash className="w-5 h-5" />
                <span className="text-xl font-bold">{seoAnalysis.keywordsCount}</span>
              </div>
              <p className="text-blue-200">كلمة مفتاحية</p>
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
                لديك تغييرات غير محفوظة في إعدادات SEO. تذكر حفظ التغييرات.
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

      {/* SEO Analysis Dashboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">تحليل SEO</h3>
          </div>
          <p className="text-gray-600 text-sm">نظرة عامة على حالة تحسين محركات البحث</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{seoAnalysis.completionPercentage}%</div>
              <p className="text-sm text-blue-700">اكتمال SEO</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{seoAnalysis.keywordsCount}</div>
              <p className="text-sm text-green-700">كلمة مفتاحية</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {seoAnalysis.hasAnalytics ? "✓" : "✗"}
              </div>
              <p className="text-sm text-purple-700">Google Analytics</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">2</div>
              <p className="text-sm text-amber-700">لغات مدعومة</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">تقدم تحسين SEO</span>
              <span className="text-sm text-gray-500">{seoAnalysis.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${seoAnalysis.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta Titles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">عناوين الصفحات</h3>
            </div>
            <p className="text-gray-600 text-sm">العناوين التي تظهر في نتائج البحث وتبويبات المتصفح</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="metaTitle.ar" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-gray-500" />
                  عنوان الصفحة الرئيسية (بالعربية)
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="metaTitle.ar"
                  name="metaTitle.ar"
                  value={formData.metaTitle.ar}
                  onChange={handleChange}
                  placeholder="أدخل عنوان الصفحة بالعربية"
                  maxLength={MAX_TITLE_LENGTH}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['metaTitle.ar'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  required
                />
                {validationErrors['metaTitle.ar'] && (
                  <p className="text-red-600 text-xs">{validationErrors['metaTitle.ar']}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    formData.metaTitle.ar.length > OPTIMAL_TITLE_LENGTH ? 'text-amber-600' : 
                    formData.metaTitle.ar.length >= 30 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.metaTitle.ar.length}/{MAX_TITLE_LENGTH} حرف
                  </p>
                  {seoAnalysis.titleOptimization.ar && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      محسن
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="metaTitle.en" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-gray-500" />
                  عنوان الصفحة الرئيسية (بالإنجليزية)
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="metaTitle.en"
                  name="metaTitle.en"
                  value={formData.metaTitle.en}
                  onChange={handleChange}
                  placeholder="Enter page title in English"
                  maxLength={MAX_TITLE_LENGTH}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['metaTitle.en'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  required
                />
                {validationErrors['metaTitle.en'] && (
                  <p className="text-red-600 text-xs">{validationErrors['metaTitle.en']}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    formData.metaTitle.en.length > OPTIMAL_TITLE_LENGTH ? 'text-amber-600' : 
                    formData.metaTitle.en.length >= 30 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.metaTitle.en.length}/{MAX_TITLE_LENGTH} characters
                  </p>
                  {seoAnalysis.titleOptimization.en && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Optimized
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Title Guidelines */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">نصائح للعناوين:</p>
                  <ul className="text-xs space-y-1">
                    <li>• استخدم 30-50 حرف للحصول على أفضل النتائج</li>
                    <li>• ضع الكلمات المفتاحية المهمة في البداية</li>
                    <li>• اجعل العنوان وصفي وجذاب</li>
                  </ul>
                </div>
              </div>
            </div>
              </div>
            </div>
            
        {/* Meta Descriptions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">أوصاف الصفحات</h3>
            </div>
            <p className="text-gray-600 text-sm">الأوصاف التي تظهر تحت العناوين في نتائج البحث</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="metaDescription.ar" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Eye className="w-4 h-4 text-gray-500" />
                  وصف الصفحة الرئيسية (بالعربية)
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="metaDescription.ar"
                  name="metaDescription.ar"
                  value={formData.metaDescription.ar}
                  onChange={handleChange}
                  placeholder="أدخل وصف الصفحة بالعربية"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['metaDescription.ar'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  required
                />
                {validationErrors['metaDescription.ar'] && (
                  <p className="text-red-600 text-xs">{validationErrors['metaDescription.ar']}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    formData.metaDescription.ar.length > OPTIMAL_DESCRIPTION_LENGTH ? 'text-amber-600' : 
                    formData.metaDescription.ar.length >= 120 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.metaDescription.ar.length}/{MAX_DESCRIPTION_LENGTH} حرف
                  </p>
                  {seoAnalysis.descriptionOptimization.ar && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      محسن
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="metaDescription.en" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Eye className="w-4 h-4 text-gray-500" />
                  وصف الصفحة الرئيسية (بالإنجليزية)
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="metaDescription.en"
                  name="metaDescription.en"
                  value={formData.metaDescription.en}
                  onChange={handleChange}
                  placeholder="Enter page description in English"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['metaDescription.en'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  required
                />
                {validationErrors['metaDescription.en'] && (
                  <p className="text-red-600 text-xs">{validationErrors['metaDescription.en']}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    formData.metaDescription.en.length > OPTIMAL_DESCRIPTION_LENGTH ? 'text-amber-600' : 
                    formData.metaDescription.en.length >= 120 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.metaDescription.en.length}/{MAX_DESCRIPTION_LENGTH} characters
                  </p>
                  {seoAnalysis.descriptionOptimization.en && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Optimized
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description Guidelines */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">نصائح للأوصاف:</p>
                  <ul className="text-xs space-y-1">
                    <li>• استخدم 120-140 حرف للحصول على أفضل النتائج</li>
                    <li>• اكتب وصف جذاب يشجع على النقر</li>
                    <li>• ضمن الكلمات المفتاحية بشكل طبيعي</li>
                  </ul>
                </div>
              </div>
            </div>
              </div>
            </div>
            
        {/* Keywords Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Hash className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">الكلمات المفتاحية</h3>
            </div>
            <p className="text-gray-600 text-sm">الكلمات التي تصف محتوى الموقع وتساعد في البحث</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              <label htmlFor="keywords" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Hash className="w-4 h-4 text-gray-500" />
                الكلمات المفتاحية
              </label>
              <Input
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
                maxLength={MAX_KEYWORDS_LENGTH}
                className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                  validationErrors.keywords ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                }`}
              />
              {validationErrors.keywords && (
                <p className="text-red-600 text-xs">{validationErrors.keywords}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {formData.keywords.length}/{MAX_KEYWORDS_LENGTH} حرف
                </p>
                <span className="text-xs text-purple-600">
                  {seoAnalysis.keywordsCount} كلمة مفتاحية
                </span>
              </div>
            </div>
            
            {/* Keywords Preview */}
            {seoAnalysis.keywordsCount > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">الكلمات المفتاحية المضافة:</p>
                <div className="flex flex-wrap gap-2">
                  {parseKeywords(formData.keywords).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keywords Guidelines */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium mb-1">نصائح للكلمات المفتاحية:</p>
                  <ul className="text-xs space-y-1">
                    <li>• افصل بين الكلمات بفواصل (مثال: رياضة, كرة قدم, تدريب)</li>
                    <li>• استخدم كلمات ذات صلة بمحتوى الموقع</li>
                    <li>• تجنب الإفراط في استخدام الكلمات المفتاحية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Analytics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Google Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm">تتبع إحصائيات الزيارات وسلوك المستخدمين</p>
            </div>
            
          <div className="p-6">
            <div className="space-y-2">
              <label htmlFor="googleAnalyticsId" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                معرف Google Analytics
              </label>
              <Input
                id="googleAnalyticsId"
                name="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={handleChange}
                placeholder="أدخل معرف Google Analytics (مثال: UA-XXXXXXXXX أو G-XXXXXXXXX)"
                className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                  validationErrors.googleAnalyticsId ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                }`}
              />
              {validationErrors.googleAnalyticsId && (
                <p className="text-red-600 text-xs">{validationErrors.googleAnalyticsId}</p>
              )}
              {formData.googleAnalyticsId && !validationErrors.googleAnalyticsId && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  معرف صحيح
                </div>
              )}
            </div>
            
            {/* Analytics Guidelines */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">أنواع معرفات Google Analytics المدعومة:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Universal Analytics:</strong> UA-XXXXXXX-X</li>
                    <li>• <strong>Google Analytics 4:</strong> G-XXXXXXXXXX</li>
                    <li>• <strong>Google Ads:</strong> AW-XXXXXXXXX</li>
                    <li>• <strong>Display & Video 360:</strong> DC-XXXXXXX</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
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
                    : "لديك تغييرات غير محفوظة في إعدادات SEO"}
              </p>
            </div>
            
            <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowRestoreDialog(true)}
            disabled={isSubmitting || isRestoring}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            {isRestoring ? (
              <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                جاري الاستعادة...
              </>
            ) : (
              <>
                    <RotateCcw className="w-4 h-4" />
                    استعادة افتراضية
              </>
            )}
          </Button>
          
          <Button 
            type="submit" 
                disabled={isSubmitting || isRestoring || !hasChanges || !isFormValid}
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
        </div>
      </form>
        
        {/* Restore Confirmation Dialog */}
        <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
                استعادة الإعدادات الافتراضية
              </AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من استعادة إعدادات SEO إلى الوضع الافتراضي؟ سيتم مسح جميع التخصيصات الحالية.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRestore} 
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isRestoring ? (
                  <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    جاري الاستعادة...
                  </>
                ) : "استعادة الإعدادات الافتراضية"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
