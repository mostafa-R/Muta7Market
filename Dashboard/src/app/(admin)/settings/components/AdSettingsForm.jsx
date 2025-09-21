"use client";

import { Button } from "@/app/component/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/app/component/ui/form";
import { Slider } from "@/app/component/ui/slider";
import { Switch } from "@/app/component/ui/switch";

import { api } from "@/lib/api";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Eye,
  Globe,
  Loader2,
  PieChart,
  Save,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const MIN_INTERNAL_RATIO = 0;
const MAX_INTERNAL_RATIO = 100;
const DEFAULT_RATIO_STEP = 10;

export default function AdSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [ratio, setRatio] = useState(100);

  const form = useForm({
    defaultValues: {
      enableGoogleAds: false,
      internalAdsRatio: 100,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const fetchSettings = useCallback(async () => {
      try {
        setLoading(true);
      setError(null);
      
        const response = await api.get("/ad-settings");
        const settings = response.data; 
        
        if (settings) {
        const formData = {
          enableGoogleAds: settings.googleAds?.enabled || false,
          internalAdsRatio: settings.internalAdsRatio || 100,
        };
        
        form.reset(formData);
        setRatio(formData.internalAdsRatio);
        setHasUnsavedChanges(false);
        }
      } catch (error) {
      console.error("Error fetching ad settings:", error);
      const errorMessage = error.response?.data?.message || error.message || "فشل في تحميل إعدادات الإعلانات";
      setError(errorMessage);
      toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = useCallback(async (values) => {
    try {
      setSaving(true);
      setError(null);
      
      if (values.internalAdsRatio < MIN_INTERNAL_RATIO || values.internalAdsRatio > MAX_INTERNAL_RATIO) {
        throw new Error(`النسبة يجب أن تكون بين ${MIN_INTERNAL_RATIO}% و ${MAX_INTERNAL_RATIO}%`);
      }
      
      const payload = {
        googleAds: {
          enabled: Boolean(values.enableGoogleAds),
        },
        internalAdsRatio: Number(values.internalAdsRatio),
      };
      
      await api.patch("/ad-settings", payload);
   
      setHasUnsavedChanges(false);
      setSuccessMessage("تم حفظ إعدادات الإعلانات بنجاح");
      toast.success("تم حفظ إعدادات الإعلانات بنجاح");
    
      setTimeout(() => setSuccessMessage(null), 5000);
   
    } catch (error) {
      console.error("Error saving ad settings:", error);
      const errorMessage = error.response?.data?.message || error.message || "فشل في حفظ الإعدادات";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, []);

  const adDistribution = useMemo(() => {
    const internal = ratio;
    const google = 100 - ratio;
    return {
      internal: { percentage: internal, label: 'إعلاناتك الخاصة' },
      google: { percentage: google, label: 'إعلانات Google AdSense' }
    };
  }, [ratio]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-[#1e293b] rounded-xl p-6 text-white animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-8 bg-slate-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-slate-600 rounded w-64"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="h-8 bg-slate-600 rounded w-16 mb-1"></div>
                <div className="h-3 bg-slate-600 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-7 h-7" />
              إدارة إعدادات الإعلانات
            </h1>
            <p className="text-blue-100">إدارة وتخصيص عرض الإعلانات على موقعك</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xl font-bold">{ratio}%</span>
              </div>
              <p className="text-blue-200">إعلاناتك الخاصة</p>
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
                <div className="flex gap-2">
                  <button
                    onClick={fetchSettings}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
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
      {hasUnsavedChanges && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Save className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                لديك تغييرات غير محفوظة. تذكر حفظ التغييرات.
              </p>
            </div>
          </div>
        </div>
      )}

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Google AdSense Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إعدادات Google AdSense</h3>
              </div>
              <p className="text-gray-600 text-sm">إدارة عرض إعلانات Google على موقعك</p>
            </div>
            
            <div className="p-6">
            <FormField
              control={form.control}
              name="enableGoogleAds"
              render={({ field }) => (
                  <FormItem className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1 space-y-2">
                      <FormLabel className="text-base font-medium">تفعيل إعلانات Google AdSense</FormLabel>
                      <FormDescription className="text-sm text-gray-600">
                      عند التفعيل، سيتم عرض إعلانات Google AdSense على موقعك بجانب إعلاناتك الخاصة.
                        هذا يساعد في زيادة الإيرادات من خلال الإعلانات المستهدفة.
                    </FormDescription>
                  </div>
                  <FormControl>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                          {field.value ? 'مفعل' : 'معطل'}
                        </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600"
                    />
                      </div>
                  </FormControl>
                </FormItem>
              )}
            />
            </div>
          </div>

          {/* Ad Distribution Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">توزيع الإعلانات</h3>
              </div>
              <p className="text-gray-600 text-sm">تحكم في نسبة ظهور إعلاناتك مقابل إعلانات Google</p>
            </div>
            
            <div className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="internalAdsRatio"
              render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">نسبة ظهور إعلاناتك الخاصة</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {ratio}%
                        </div>
                      </div>
                    </div>
                    
                  <FormControl>
                      <div className="space-y-4">
                    <div className="flex items-center gap-4">
                          <div className="flex-1">
                      <Slider
                              min={MIN_INTERNAL_RATIO}
                              max={MAX_INTERNAL_RATIO}
                              step={DEFAULT_RATIO_STEP}
                        value={[field.value]}
                        onValueChange={(value) => {
                          field.onChange(value[0]);
                          setRatio(value[0]);
                        }}
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        {/* Quick preset buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {[0, 25, 50, 75, 100].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                field.onChange(preset);
                                setRatio(preset);
                              }}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                ratio === preset
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                    </div>
                  </FormControl>
                    
                    <FormDescription className="text-sm text-gray-600">
                    حدد النسبة المئوية لظهور إعلاناتك الخاصة. النسبة المتبقية ستكون لإعلانات Google AdSense.
                    (مثال: 70% يعني أن 7 من كل 10 إعلانات ستكون من إعلاناتك الخاصة).
                  </FormDescription>
                </FormItem>
              )}
            />
            </div>
          </div>
          
          {/* Ad Distribution Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">معاينة التوزيع</h3>
              </div>
              <p className="text-gray-600 text-sm">كيف ستظهر الإعلانات على موقعك</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Internal Ads */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="font-medium text-gray-900">{adDistribution.internal.label}</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {adDistribution.internal.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      من كل 10 إعلانات، {Math.round(adDistribution.internal.percentage / 10)} ستكون من إعلاناتك
                    </div>
                  </div>
                </div>
                
                {/* Google Ads */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="font-medium text-gray-900">{adDistribution.google.label}</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {adDistribution.google.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      من كل 10 إعلانات، {Math.round(adDistribution.google.percentage / 10)} ستكون من Google
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">التوزيع البصري:</span>
                </div>
                <div className="flex rounded-lg overflow-hidden h-4 bg-gray-200">
                  <div 
                    className="bg-blue-600 transition-all duration-300"
                    style={{ width: `${adDistribution.internal.percentage}%` }}
                  ></div>
                  <div 
                    className="bg-green-600 transition-all duration-300"
                    style={{ width: `${adDistribution.google.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>إعلاناتك ({adDistribution.internal.percentage}%)</span>
                  <span>Google AdSense ({adDistribution.google.percentage}%)</span>
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
                  {!hasUnsavedChanges ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">محفوظ</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">غير محفوظ</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {hasUnsavedChanges 
                    ? "لديك تغييرات غير محفوظة في إعدادات الإعلانات" 
                    : "جميع التغييرات محفوظة"}
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={saving} 
                className="bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-3 text-lg flex items-center gap-3 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
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
        </Form>
    </div>
  );
}
