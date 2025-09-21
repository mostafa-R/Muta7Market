"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Twitter,
  Users,
  Youtube
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MAX_EMAIL_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 500;
const MAX_URL_LENGTH = 200;

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validateUrl = (url) => {
  if (!url) return true; 
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const sanitizeInput = (input) => {
  return typeof input === 'string' ? input.trim() : '';
};

export default function ContactSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
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

  const validateForm = useCallback((data) => {
    const errors = {};
    
    if (!data.email) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(data.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    } else if (data.email.length > MAX_EMAIL_LENGTH) {
      errors.email = `البريد الإلكتروني يجب أن يكون أقل من ${MAX_EMAIL_LENGTH} حرف`;
    }
    
    if (!data.phone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhone(data.phone)) {
      errors.phone = "رقم الهاتف غير صحيح";
    } else if (data.phone.length > MAX_PHONE_LENGTH) {
      errors.phone = `رقم الهاتف يجب أن يكون أقل من ${MAX_PHONE_LENGTH} حرف`;
    }
    
    if (!data.address.ar) {
      errors['address.ar'] = "العنوان بالعربية مطلوب";
    } else if (data.address.ar.length > MAX_ADDRESS_LENGTH) {
      errors['address.ar'] = `العنوان يجب أن يكون أقل من ${MAX_ADDRESS_LENGTH} حرف`;
    }
    
    if (!data.address.en) {
      errors['address.en'] = "العنوان بالإنجليزية مطلوب";
    } else if (data.address.en.length > MAX_ADDRESS_LENGTH) {
      errors['address.en'] = `العنوان يجب أن يكون أقل من ${MAX_ADDRESS_LENGTH} حرف`;
    }
    
    Object.keys(data.socialMedia).forEach(platform => {
      const url = data.socialMedia[platform];
      if (url) {
        if (!validateUrl(url)) {
          errors[`socialMedia.${platform}`] = `رابط ${platform} غير صحيح`;
        } else if (url.length > MAX_URL_LENGTH) {
          errors[`socialMedia.${platform}`] = `الرابط يجب أن يكون أقل من ${MAX_URL_LENGTH} حرف`;
        }
      }
    });
    
    return errors;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    if (name.includes('.')) {
      const parts = name.split('.');
      
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: sanitizedValue
          }
        }));
      } else if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]][parts[1]],
              [parts[2]]: sanitizedValue
            }
          }
        }));
      }
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
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          contactInfo: formData
        });
        setHasChanges(false);
        setSuccessMessage("تم تحديث معلومات الاتصال بنجاح");
        toast.success("تم تحديث معلومات الاتصال بنجاح");
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث معلومات الاتصال");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث معلومات الاتصال";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, settings, setSettings]);

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-600', bgColor: 'bg-sky-100' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-100' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bgColor: 'bg-blue-100' }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Phone className="w-7 h-7" />
              إدارة معلومات الاتصال
            </h1>
            <p className="text-blue-100">إدارة وتحديث معلومات التواصل ووسائل التواصل الاجتماعي</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <Users className="w-5 h-5" />
                <span className="text-xl font-bold">5</span>
              </div>
              <p className="text-blue-200">منصات التواصل</p>
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
                لديك تغييرات غير محفوظة في معلومات الاتصال. تذكر حفظ التغييرات.
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
        {/* Basic Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">معلومات الاتصال الأساسية</h3>
            </div>
            <p className="text-gray-600 text-sm">هذه المعلومات سيتم عرضها للزوار في صفحة الاتصال</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
            <div className="space-y-2">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-gray-500" />
                البريد الإلكتروني
                  <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="أدخل البريد الإلكتروني للاتصال"
                    className={`pr-10 focus:ring-2 focus:ring-blue-100 transition-all ${
                      validationErrors.email ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    maxLength={MAX_EMAIL_LENGTH}
                  required
                />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
                {validationErrors.email && (
                  <p className="text-red-600 text-xs">{validationErrors.email}</p>
                )}
                <p className="text-xs text-gray-500">
                  سيتم استخدام هذا البريد للتواصل مع العملاء ({formData.email.length}/{MAX_EMAIL_LENGTH})
                </p>
            </div>
            
              {/* Phone */}
            <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                رقم الهاتف
                  <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="أدخل رقم الهاتف للاتصال"
                    className={`pr-10 focus:ring-2 focus:ring-blue-100 transition-all ${
                      validationErrors.phone ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    maxLength={MAX_PHONE_LENGTH}
                  required
                />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
                {validationErrors.phone && (
                  <p className="text-red-600 text-xs">{validationErrors.phone}</p>
                )}
                <p className="text-xs text-gray-500">
                  سيتم عرض رقم الهاتف في صفحة الاتصال ({formData.phone.length}/{MAX_PHONE_LENGTH})
                </p>
            </div>
          </div>
          
            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label htmlFor="address.ar" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                العنوان (بالعربية)
                  <span className="text-red-500">*</span>
              </label>
                <Textarea
                  id="address.ar"
                  name="address.ar"
                  value={formData.address.ar}
                  onChange={handleChange}
                  placeholder="أدخل العنوان بالعربية"
                  rows={3}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['address.ar'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  maxLength={MAX_ADDRESS_LENGTH}
                />
                {validationErrors['address.ar'] && (
                  <p className="text-red-600 text-xs">{validationErrors['address.ar']}</p>
                )}
                <p className="text-xs text-gray-500">
                  العنوان الذي سيظهر في الواجهة العربية ({formData.address.ar.length}/{MAX_ADDRESS_LENGTH})
                </p>
            </div>
            
            <div className="space-y-2">
                <label htmlFor="address.en" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                العنوان (بالإنجليزية)
                  <span className="text-red-500">*</span>
              </label>
                <Textarea
                  id="address.en"
                  name="address.en"
                  value={formData.address.en}
                  onChange={handleChange}
                  placeholder="Enter address in English"
                  rows={3}
                  className={`focus:ring-2 focus:ring-blue-100 transition-all ${
                    validationErrors['address.en'] ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                  }`}
                  maxLength={MAX_ADDRESS_LENGTH}
                />
                {validationErrors['address.en'] && (
                  <p className="text-red-600 text-xs">{validationErrors['address.en']}</p>
                )}
                <p className="text-xs text-gray-500">
                  العنوان الذي سيظهر في الواجهة الإنجليزية ({formData.address.en.length}/{MAX_ADDRESS_LENGTH})
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
                    : "لديك تغييرات غير محفوظة في معلومات الاتصال"}
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
