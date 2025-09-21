"use client";

import { Button } from "@/app/component/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Image as ImageIcon,
  Info,
  Loader2,
  Save,
  Shield,
  Upload,
  X,
  Zap
} from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const LOGO_MAX_SIZE = 10 * 1024 * 1024; 
const FAVICON_MAX_SIZE = 10 * 1024 * 1024; 
const LOGO_RECOMMENDED_WIDTH = 300;
const LOGO_RECOMMENDED_HEIGHT = 100;
const FAVICON_RECOMMENDED_SIZE = 32;

const validateImageFile = (file, maxSize, type) => {
  const errors = [];
  
  if (!file) {
    errors.push(`يرجى اختيار ملف ${type}`);
    return errors;
  }
  
  if (!file.type.startsWith('image/')) {
    errors.push(`يجب أن يكون الملف من نوع صورة`);
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`حجم الملف كبير جدًا. الحد الأقصى: ${maxSizeMB} ميجابايت`);
  }
  
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: PNG, JPG, SVG, WebP`);
  }
  
  return errors;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function LogoSettingsForm({ settings, setSettings }) {
  const [isSubmittingLogo, setIsSubmittingLogo] = useState(false);
  const [isSubmittingFavicon, setIsSubmittingFavicon] = useState(false);
  const [logoPreview, setLogoPreview] = useState(settings?.logo?.url || null);
  const [faviconPreview, setFaviconPreview] = useState(settings?.favicon?.url || null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoValidationErrors, setLogoValidationErrors] = useState([]);
  const [faviconValidationErrors, setFaviconValidationErrors] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Enhanced logo change handler with validation
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    setError(null);
    
    const validationErrors = validateImageFile(file, LOGO_MAX_SIZE, 'الشعار');
    setLogoValidationErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      setLogoFile(null);
      setLogoPreview(settings?.logo?.url || null);
      return;
    }
    
    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [settings?.logo?.url]);

  const handleFaviconChange = useCallback((e) => {
    const file = e.target.files[0];
    setError(null);
    
    const validationErrors = validateImageFile(file, FAVICON_MAX_SIZE, 'الأيقونة');
    setFaviconValidationErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      setFaviconFile(null);
      setFaviconPreview(settings?.favicon?.url || null);
      return;
    }
    
    setFaviconFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [settings?.favicon?.url]);

  const handleLogoSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!logoFile) {
      toast.error("يرجى اختيار شعار للموقع");
      return;
    }
    
    if (logoValidationErrors.length > 0) {
      toast.error("يرجى تصحيح الأخطاء قبل الرفع");
      return;
    }
    
    setIsSubmittingLogo(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
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
          logo: result.data.logo
        });
        setLogoFile(null);
        setSuccessMessage("تم تحديث شعار الموقع بنجاح");
        toast.success("تم تحديث شعار الموقع بنجاح");
        
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث شعار الموقع");
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث شعار الموقع";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingLogo(false);
    }
  }, [logoFile, logoValidationErrors, settings, setSettings]);

  const handleFaviconSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!faviconFile) {
      toast.error("يرجى اختيار أيقونة للموقع");
      return;
    }
    
    if (faviconValidationErrors.length > 0) {
      toast.error("يرجى تصحيح الأخطاء قبل الرفع");
      return;
    }
    
    setIsSubmittingFavicon(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const formData = new FormData();
      formData.append('favicon', faviconFile);
      
      const response = await fetch(`${API_BASE_URL}/settings/favicon`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
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
          favicon: result.data.favicon
        });
        setFaviconFile(null);
        setSuccessMessage("تم تحديث أيقونة الموقع بنجاح");
        toast.success("تم تحديث أيقونة الموقع بنجاح");
        
        if (faviconInputRef.current) {
          faviconInputRef.current.value = '';
        }
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث أيقونة الموقع");
      }
    } catch (error) {
      console.error("Error updating favicon:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث أيقونة الموقع";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingFavicon(false);
    }
  }, [faviconFile, faviconValidationErrors, settings, setSettings]);

  const clearLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(settings?.logo?.url || null);
    setLogoValidationErrors([]);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [settings?.logo?.url]);

  const clearFavicon = useCallback(() => {
    setFaviconFile(null);
    setFaviconPreview(settings?.favicon?.url || null);
    setFaviconValidationErrors([]);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  }, [settings?.favicon?.url]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <ImageIcon className="w-7 h-7" />
              إدارة شعار وأيقونة الموقع
            </h1>
            <p className="text-blue-100">رفع وإدارة شعار الموقع والأيقونة المفضلة (Favicon)</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <Shield className="w-5 h-5" />
                <span className="text-xl font-bold">2</span>
              </div>
              <p className="text-blue-200">ملفات الهوية</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <Zap className="w-5 h-5" />
                <span className="text-xl font-bold">10MB</span>
              </div>
              <p className="text-blue-200">الحد الأقصى</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">شعار الموقع</h3>
            </div>
            <p className="text-gray-600 text-sm">الشعار الرئيسي الذي سيظهر في رأس الموقع والصفحات</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Logo Upload Area */}
            <div className={`border-2 border-dashed rounded-xl p-6 transition-all ${
              logoValidationErrors.length > 0 
                ? 'border-red-300 bg-red-50' 
                : logoFile 
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}>
              {logoPreview ? (
          <div className="space-y-4">
                  <div className="relative w-full h-32 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                    {logoPreview.startsWith('data:') || logoPreview.startsWith('blob:') ? (
                  <img 
                    src={logoPreview} 
                    alt="شعار الموقع" 
                        className="object-contain max-w-full max-h-full"
                      />
                    ) : (
                      <Image 
                        src={logoPreview} 
                        alt="شعار الموقع" 
                        width={200}
                        height={100}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                      />
                    )}
                  </div>
                  {logoFile && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{logoFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(logoFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">لا يوجد شعار حالياً</h4>
                  <p className="text-sm text-gray-500">اختر ملف صورة لرفعه كشعار للموقع</p>
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
              <div className="flex justify-center mt-4">
              <label
                htmlFor="logo-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                  <Upload className="w-4 h-4" />
                اختيار شعار جديد
              </label>
              </div>
            </div>

            {/* Logo Validation Errors */}
            {logoValidationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-900 mb-2">يرجى تصحيح الأخطاء التالية:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {logoValidationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">إرشادات الشعار:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• الأبعاد المفضلة: {LOGO_RECOMMENDED_WIDTH}×{LOGO_RECOMMENDED_HEIGHT} بكسل</li>
                    <li>• الصيغ المدعومة: PNG, JPG, SVG, WebP</li>
                    <li>• يُفضل استخدام خلفية شفافة (PNG أو SVG)</li>
                    <li>• الحد الأقصى للحجم: 10 ميجابايت</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Logo Upload Button */}
            <Button 
              onClick={handleLogoSubmit} 
              disabled={isSubmittingLogo || !logoFile || logoValidationErrors.length > 0}
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmittingLogo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  تحديث الشعار
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Favicon Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">أيقونة الموقع (Favicon)</h3>
            </div>
            <p className="text-gray-600 text-sm">الأيقونة التي ستظهر في تبويب المتصفح وقائمة المفضلة</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Favicon Upload Area */}
            <div className={`border-2 border-dashed rounded-xl p-6 transition-all ${
              faviconValidationErrors.length > 0 
                ? 'border-red-300 bg-red-50' 
                : faviconFile 
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
            }`}>
              {faviconPreview ? (
          <div className="space-y-4">
                  <div className="relative w-20 h-20 bg-white rounded-lg border flex items-center justify-center overflow-hidden mx-auto">
                    {faviconPreview.startsWith('data:') || faviconPreview.startsWith('blob:') ? (
                  <img 
                    src={faviconPreview} 
                    alt="أيقونة الموقع" 
                        className="object-contain max-w-full max-h-full"
                      />
                    ) : (
                      <Image 
                        src={faviconPreview} 
                        alt="أيقونة الموقع" 
                        width={64}
                        height={64}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                      />
                    )}
                  </div>
                  {faviconFile && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{faviconFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(faviconFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFavicon}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد أيقونة حالياً</h4>
                  <p className="text-sm text-gray-500">اختر ملف صورة لرفعه كأيقونة للموقع</p>
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
              <div className="flex justify-center mt-4">
              <label
                htmlFor="favicon-upload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                  <Upload className="w-4 h-4" />
                اختيار أيقونة جديدة
              </label>
              </div>
            </div>

            {/* Favicon Validation Errors */}
            {faviconValidationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-900 mb-2">يرجى تصحيح الأخطاء التالية:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {faviconValidationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Favicon Guidelines */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">إرشادات الأيقونة:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• الأبعاد المفضلة: {FAVICON_RECOMMENDED_SIZE}×{FAVICON_RECOMMENDED_SIZE} بكسل (مربعة)</li>
                    <li>• الصيغ المدعومة: ICO, PNG, JPG, WebP</li>
                    <li>• يُفضل استخدام صورة مربعة وبسيطة</li>
                    <li>• الحد الأقصى للحجم: 10 ميجابايت</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Favicon Upload Button */}
            <Button 
              onClick={handleFaviconSubmit} 
              disabled={isSubmittingFavicon || !faviconFile || faviconValidationErrors.length > 0}
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmittingFavicon ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  تحديث الأيقونة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Brand Identity Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">معاينة الهوية البصرية</h3>
          </div>
          <p className="text-gray-600 text-sm">كيف ستبدو هوية الموقع في المتصفح والتطبيقات</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Browser Tab Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">معاينة تبويب المتصفح</h4>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded-t-lg border border-gray-200 p-2 flex items-center gap-2 max-w-xs">
                  {faviconPreview ? (
                    faviconPreview.startsWith('data:') || faviconPreview.startsWith('blob:') ? (
                      <img 
                        src={faviconPreview} 
                        alt="favicon" 
                        width={16} 
                        height={16} 
                        className="object-contain"
                      />
                    ) : (
                      <Image 
                        src={faviconPreview} 
                        alt="favicon" 
                        width={16} 
                        height={16} 
                        className="object-contain"
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {settings?.siteName?.ar || "اسم الموقع"}
                  </span>
                  <X className="w-3 h-3 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>

            {/* Header Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">معاينة رأس الموقع</h4>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                  {logoPreview ? (
                    logoPreview.startsWith('data:') || logoPreview.startsWith('blob:') ? (
                      <img 
                        src={logoPreview} 
                        alt="logo" 
                        width={120} 
                        height={40} 
                        className="object-contain"
                      />
                    ) : (
                      <Image 
                        src={logoPreview} 
                        alt="logo" 
                        width={120} 
                        height={40} 
                        className="object-contain"
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="w-24 h-8 bg-gray-300 rounded"></div>
                  )}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>الرئيسية</span>
                    <span>المنتجات</span>
                    <span>اتصل بنا</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
