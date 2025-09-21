"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/component/ui/alert-dialog";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  RotateCcw,
  Save,
  TrendingUp,
  Users
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MIN_DAYS = 1;
const MAX_DAYS = 3650;
const DEFAULT_VALUES = {
  contacts_access_price: 190,
  contacts_access_days: 365,
  listing_player_price: 140,
  listing_player_days: 365,
  listing_coach_price: 190,
  listing_coach_days: 365,
  promotion_player_price: 100,
  promotion_player_days: 15,
  promotion_coach_price: 100,
  promotion_coach_days: 15,
};

const validatePrice = (value, fieldName) => {
  if (value < MIN_PRICE) {
    return `${fieldName} لا يمكن أن يكون أقل من ${MIN_PRICE} ريال`;
  }
  if (value > MAX_PRICE) {
    return `${fieldName} لا يمكن أن يكون أكثر من ${MAX_PRICE} ريال`;
  }
  return null;
};

const validateDays = (value, fieldName) => {
  if (value < MIN_DAYS) {
    return `${fieldName} لا يمكن أن تكون أقل من ${MIN_DAYS} يوم`;
  }
  if (value > MAX_DAYS) {
    return `${fieldName} لا يمكن أن تكون أكثر من ${MAX_DAYS} يوم`;
  }
  return null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function PricingSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    contacts_access_price: settings?.pricing?.contacts_access?.price || settings?.pricing?.contacts_access_year || DEFAULT_VALUES.contacts_access_price,
    contacts_access_days: settings?.pricing?.contacts_access?.days || DEFAULT_VALUES.contacts_access_days,
    
    listing_player_price: settings?.pricing?.listing_player?.price || settings?.pricing?.listing_year?.player || DEFAULT_VALUES.listing_player_price,
    listing_player_days: settings?.pricing?.listing_player?.days || DEFAULT_VALUES.listing_player_days,
    
    listing_coach_price: settings?.pricing?.listing_coach?.price || settings?.pricing?.listing_year?.coach || DEFAULT_VALUES.listing_coach_price,
    listing_coach_days: settings?.pricing?.listing_coach?.days || DEFAULT_VALUES.listing_coach_days,
    
    promotion_player_price: settings?.pricing?.promotion_player?.price || settings?.pricing?.promotion_year?.player || DEFAULT_VALUES.promotion_player_price,
    promotion_player_days: settings?.pricing?.promotion_player?.days || settings?.pricing?.promotion_default_days || DEFAULT_VALUES.promotion_player_days,
    
    promotion_coach_price: settings?.pricing?.promotion_coach?.price || settings?.pricing?.promotion_year?.coach || DEFAULT_VALUES.promotion_coach_price,
    promotion_coach_days: settings?.pricing?.promotion_coach?.days || settings?.pricing?.promotion_default_days || DEFAULT_VALUES.promotion_coach_days,
  });

  const validateForm = useCallback((data) => {
    const errors = {};
    
    const priceValidations = [
      { field: 'contacts_access_price', name: 'سعر مشاهدة الملفات' },
      { field: 'listing_player_price', name: 'سعر نشر ملف اللاعب' },
      { field: 'listing_coach_price', name: 'سعر نشر ملف المدرب' },
      { field: 'promotion_player_price', name: 'سعر تثبيت ملف اللاعب' },
      { field: 'promotion_coach_price', name: 'سعر تثبيت ملف المدرب' }
    ];
    
    priceValidations.forEach(({ field, name }) => {
      const error = validatePrice(data[field], name);
      if (error) errors[field] = error;
    });
    
    const daysValidations = [
      { field: 'contacts_access_days', name: 'مدة مشاهدة الملفات' },
      { field: 'listing_player_days', name: 'مدة نشر ملف اللاعب' },
      { field: 'listing_coach_days', name: 'مدة نشر ملف المدرب' },
      { field: 'promotion_player_days', name: 'مدة تثبيت ملف اللاعب' },
      { field: 'promotion_coach_days', name: 'مدة تثبيت ملف المدرب' }
    ];
    
    daysValidations.forEach(({ field, name }) => {
      const error = validateDays(data[field], name);
      if (error) errors[field] = error;
    });
    
    return errors;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
    
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

  const pricingInsights = useMemo(() => {
    const totalRevenuePotential = 
      formData.contacts_access_price +
      formData.listing_player_price +
      formData.listing_coach_price +
      formData.promotion_player_price +
      formData.promotion_coach_price;
    
    const averagePrice = totalRevenuePotential / 5;
    
    const dailyRates = {
      promotion_player: formData.promotion_player_price / formData.promotion_player_days,
      promotion_coach: formData.promotion_coach_price / formData.promotion_coach_days
    };
    
    return {
      totalRevenuePotential,
      averagePrice,
      dailyRates
    };
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
      
      const response = await fetch(`${API_BASE_URL}/settings/pricing/restore`, {
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
        const defaultPricing = result.data;
        
        setSettings({
          ...settings,
          pricing: defaultPricing
        });
        
        setFormData(DEFAULT_VALUES);
        setSuccessMessage("تم استعادة إعدادات الأسعار الافتراضية بنجاح");
        toast.success("تم استعادة إعدادات الأسعار الافتراضية بنجاح");
        setHasChanges(false);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل استعادة إعدادات الأسعار الافتراضية");
      }
    } catch (error) {
      console.error("Error restoring default pricing settings:", error);
      const errorMessage = error.message || "حدث خطأ أثناء استعادة إعدادات الأسعار الافتراضية";
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
      
      const response = await fetch(`${API_BASE_URL}/settings/pricing`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricing: {
            contacts_access: {
              price: formData.contacts_access_price,
              days: formData.contacts_access_days
            },
            listing_player: {
              price: formData.listing_player_price,
              days: formData.listing_player_days
            },
            listing_coach: {
              price: formData.listing_coach_price,
              days: formData.listing_coach_days
            },
            promotion_player: {
              price: formData.promotion_player_price,
              days: formData.promotion_player_days
            },
            promotion_coach: {
              price: formData.promotion_coach_price,
              days: formData.promotion_coach_days
            },
            
            contacts_access_year: formData.contacts_access_price,
            listing_year: {
              player: formData.listing_player_price,
              coach: formData.listing_coach_price
            },
            promotion_year: {
              player: formData.promotion_player_price,
              coach: formData.promotion_coach_price
            },
            promotion_per_day: {
              player: formData.promotion_player_price / formData.promotion_player_days,
              coach: formData.promotion_coach_price / formData.promotion_coach_days
            },
            promotion_default_days: formData.promotion_player_days
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
          pricing: {
            contacts_access: {
              price: formData.contacts_access_price,
              days: formData.contacts_access_days
            },
            listing_player: {
              price: formData.listing_player_price,
              days: formData.listing_player_days
            },
            listing_coach: {
              price: formData.listing_coach_price,
              days: formData.listing_coach_days
            },
            promotion_player: {
              price: formData.promotion_player_price,
              days: formData.promotion_player_days
            },
            promotion_coach: {
              price: formData.promotion_coach_price,
              days: formData.promotion_coach_days
            },
            
            contacts_access_year: formData.contacts_access_price,
            listing_year: {
              player: formData.listing_player_price,
              coach: formData.listing_coach_price
            },
            promotion_year: {
              player: formData.promotion_player_price,
              coach: formData.promotion_coach_price
            },
            promotion_per_day: {
              player: formData.promotion_player_price / formData.promotion_player_days,
              coach: formData.promotion_coach_price / formData.promotion_coach_days
            },
            promotion_default_days: formData.promotion_player_days
          }
        });
        
        setSuccessMessage("تم تحديث إعدادات الأسعار بنجاح");
        toast.success("تم تحديث إعدادات الأسعار بنجاح");
        setHasChanges(false);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل تحديث إعدادات الأسعار");
      }
    } catch (error) {
      console.error("Error updating pricing settings:", error);
      const errorMessage = error.message || "حدث خطأ أثناء تحديث إعدادات الأسعار";
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
              <DollarSign className="w-7 h-7" />
              إدارة الأسعار والرسوم
            </h1>
            <p className="text-blue-100">تحديد أسعار الخدمات والاشتراكات في المنصة</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <Calculator className="w-5 h-5" />
                <span className="text-xl font-bold">{formatCurrency(pricingInsights.totalRevenuePotential)}</span>
              </div>
              <p className="text-blue-200">إجمالي الإيرادات المحتملة</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xl font-bold">5</span>
              </div>
              <p className="text-blue-200">خدمات مدفوعة</p>
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
                لديك تغييرات غير محفوظة في إعدادات الأسعار. تذكر حفظ التغييرات.
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
        
      {/* Pricing Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calculator className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">تحليل الأسعار</h3>
            </div>
          <p className="text-gray-600 text-sm">نظرة عامة على هيكل الأسعار والإيرادات المحتملة</p>
          </div>
          
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(pricingInsights.totalRevenuePotential)}
              </div>
              <p className="text-sm text-blue-700">إجمالي الإيرادات المحتملة</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(pricingInsights.averagePrice)}
              </div>
              <p className="text-sm text-green-700">متوسط سعر الخدمة</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(pricingInsights.dailyRates.promotion_player)}
              </div>
              <p className="text-sm text-purple-700">سعر التثبيت اليومي</p>
            </div>
          </div>
        </div>
          </div>
          
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* مشاهدة الملفات والتواصل */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">مشاهدة الملفات والتواصل</h3>
            </div>
            <p className="text-gray-600 text-sm">رسوم الوصول إلى ملفات اللاعبين والمدربين والتواصل معهم</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="contacts_access_price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  السعر
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="contacts_access_price"
                    name="contacts_access_price"
                    type="number"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step="1"
                    value={formData.contacts_access_price}
                    onChange={handleChange}
                    className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                      validationErrors.contacts_access_price ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                    <span className="text-gray-500">ر.س</span>
                  </div>
                </div>
                {validationErrors.contacts_access_price && (
                  <p className="text-red-600 text-xs">{validationErrors.contacts_access_price}</p>
                )}
                <p className="text-xs text-gray-500">الحد الأدنى: {MIN_PRICE} ر.س، الحد الأقصى: {MAX_PRICE} ر.س</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contacts_access_days" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  المدة (بالأيام)
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="contacts_access_days"
                    name="contacts_access_days"
                    type="number"
                    min={MIN_DAYS}
                    max={MAX_DAYS}
                    step="1"
                    value={formData.contacts_access_days}
                    onChange={handleChange}
                    className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                      validationErrors.contacts_access_days ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                    <span className="text-gray-500">يوم</span>
                  </div>
                </div>
                {validationErrors.contacts_access_days && (
                  <p className="text-red-600 text-xs">{validationErrors.contacts_access_days}</p>
                )}
                <p className="text-xs text-gray-500">الحد الأدنى: {MIN_DAYS} يوم، الحد الأقصى: {MAX_DAYS} يوم</p>
                  </div>
                </div>
            
            {/* Price per day calculation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <Calculator className="w-4 h-4 inline mr-1" />
                السعر اليومي: {formatCurrency(formData.contacts_access_price / formData.contacts_access_days)} في اليوم
              </p>
              </div>
            </div>
          </div>
          
          {/* نشر ملفات اللاعبين والمدربين */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">نشر الملفات</h3>
            </div>
            <p className="text-gray-600 text-sm">رسوم نشر ملفات اللاعبين والمدربين في المنصة</p>
          </div>
          
          <div className="p-6 space-y-8">
              {/* نشر ملف اللاعب */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ملف اللاعب
              </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label htmlFor="listing_player_price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                      السعر
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_player_price"
                        name="listing_player_price"
                        type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                        step="1"
                        value={formData.listing_player_price}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.listing_player_price ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">ر.س</span>
                      </div>
                    </div>
                  {validationErrors.listing_player_price && (
                    <p className="text-red-600 text-xs">{validationErrors.listing_player_price}</p>
                  )}
                  </div>
                  
                  <div className="space-y-2">
                  <label htmlFor="listing_player_days" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                      المدة (بالأيام)
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_player_days"
                        name="listing_player_days"
                        type="number"
                      min={MIN_DAYS}
                      max={MAX_DAYS}
                        step="1"
                        value={formData.listing_player_days}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.listing_player_days ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">يوم</span>
                      </div>
                    </div>
                  {validationErrors.listing_player_days && (
                    <p className="text-red-600 text-xs">{validationErrors.listing_player_days}</p>
                  )}
                  </div>
                </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  السعر اليومي: {formatCurrency(formData.listing_player_price / formData.listing_player_days)} في اليوم
                </p>
              </div>
              </div>
              
              {/* نشر ملف المدرب */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                ملف المدرب
              </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label htmlFor="listing_coach_price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                      السعر
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_coach_price"
                        name="listing_coach_price"
                        type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                        step="1"
                        value={formData.listing_coach_price}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.listing_coach_price ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">ر.س</span>
                      </div>
                    </div>
                  {validationErrors.listing_coach_price && (
                    <p className="text-red-600 text-xs">{validationErrors.listing_coach_price}</p>
                  )}
                  </div>
                  
                  <div className="space-y-2">
                  <label htmlFor="listing_coach_days" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                      المدة (بالأيام)
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_coach_days"
                        name="listing_coach_days"
                        type="number"
                      min={MIN_DAYS}
                      max={MAX_DAYS}
                        step="1"
                        value={formData.listing_coach_days}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.listing_coach_days ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">يوم</span>
                    </div>
                  </div>
                  {validationErrors.listing_coach_days && (
                    <p className="text-red-600 text-xs">{validationErrors.listing_coach_days}</p>
                  )}
                      </div>
                    </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  السعر اليومي: {formatCurrency(formData.listing_coach_price / formData.listing_coach_days)} في اليوم
                </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* تثبيت الملفات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">تثبيت الملفات</h3>
            </div>
            <p className="text-gray-600 text-sm">رسوم تثبيت الملفات في أعلى نتائج البحث</p>
          </div>
          
          <div className="p-6 space-y-8">
              {/* تثبيت ملف اللاعب */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                تثبيت ملف اللاعب
              </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label htmlFor="promotion_player_price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                      السعر
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_player_price"
                        name="promotion_player_price"
                        type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                        step="1"
                        value={formData.promotion_player_price}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.promotion_player_price ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">ر.س</span>
                      </div>
                    </div>
                  {validationErrors.promotion_player_price && (
                    <p className="text-red-600 text-xs">{validationErrors.promotion_player_price}</p>
                  )}
                  </div>
                  
                  <div className="space-y-2">
                  <label htmlFor="promotion_player_days" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                      المدة (بالأيام)
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_player_days"
                        name="promotion_player_days"
                        type="number"
                      min={MIN_DAYS}
                      max={MAX_DAYS}
                        step="1"
                        value={formData.promotion_player_days}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.promotion_player_days ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">يوم</span>
                      </div>
                    </div>
                  {validationErrors.promotion_player_days && (
                    <p className="text-red-600 text-xs">{validationErrors.promotion_player_days}</p>
                  )}
                  </div>
                </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  السعر اليومي: {formatCurrency(formData.promotion_player_price / formData.promotion_player_days)} في اليوم
                </p>
              </div>
              </div>
              
              {/* تثبيت ملف المدرب */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                تثبيت ملف المدرب
              </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label htmlFor="promotion_coach_price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                      السعر
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_coach_price"
                        name="promotion_coach_price"
                        type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                        step="1"
                        value={formData.promotion_coach_price}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.promotion_coach_price ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">ر.س</span>
                      </div>
                    </div>
                  {validationErrors.promotion_coach_price && (
                    <p className="text-red-600 text-xs">{validationErrors.promotion_coach_price}</p>
                  )}
                  </div>
                  
                  <div className="space-y-2">
                  <label htmlFor="promotion_coach_days" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                      المدة (بالأيام)
                    <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_coach_days"
                        name="promotion_coach_days"
                        type="number"
                      min={MIN_DAYS}
                      max={MAX_DAYS}
                        step="1"
                        value={formData.promotion_coach_days}
                        onChange={handleChange}
                      className={`pl-16 focus:ring-2 focus:ring-blue-100 transition-all ${
                        validationErrors.promotion_coach_days ? 'border-red-300 focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                        required
                      />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500">يوم</span>
                      </div>
                    </div>
                  {validationErrors.promotion_coach_days && (
                    <p className="text-red-600 text-xs">{validationErrors.promotion_coach_days}</p>
                  )}
                  </div>
                </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  السعر اليومي: {formatCurrency(formData.promotion_coach_price / formData.promotion_coach_days)} في اليوم
                </p>
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
                    : "لديك تغييرات غير محفوظة في إعدادات الأسعار"}
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
                هل أنت متأكد من استعادة إعدادات الأسعار إلى الوضع الافتراضي؟ سيتم إعادة تعيين جميع الأسعار والمدد إلى القيم الافتراضية.
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