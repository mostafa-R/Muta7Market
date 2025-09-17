"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/app/component/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/component/ui/form";
import { Input } from "@/app/component/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/component/ui/radio-group";
import { Switch } from "@/app/component/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import { Textarea } from "@/app/component/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { adPositionOptions, adTypeOptions, advertisementSchema } from "../utils/validate";

const ImagePreview = ({ file, existingUrl }) => {
  const [preview, setPreview] = useState(existingUrl || null);

  useEffect(() => {
    if (file && file[0]) {
      const newPreview = URL.createObjectURL(file[0]);
      setPreview(newPreview);
      return () => URL.revokeObjectURL(newPreview);
    }
    // If file is cleared or not present, but we have an existing URL
    if (!file && existingUrl) {
      setPreview(existingUrl);
    }
    // If no file and no existing URL (e.g., in create mode from scratch)
    if (!file && !existingUrl) {
      setPreview(null);
    }
  }, [file, existingUrl]);

  if (!preview) return null;

  return (
    <div className="mt-2">
      <img src={preview} alt="Preview" className="max-h-32 object-contain rounded border" />
    </div>
  );
};

export default function AdvertisementForm({ advertisement, onSubmit, isLoading }) {
  const [adSource, setAdSource] = useState(advertisement?.source || "internal");
  const [sports, setSports] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      titleAr: advertisement?.title?.ar || "",
      titleEn: advertisement?.title?.en || "",
      descriptionAr: advertisement?.description?.ar || "",
      descriptionEn: advertisement?.description?.en || "",
      source: advertisement?.source || "internal",
      googleAdSlotId: advertisement?.googleAd?.adSlotId || "",
      googleAdFormat: advertisement?.googleAd?.adFormat || "auto",
      type: advertisement?.type || "banner",
      position: advertisement?.position || "home",
      link: advertisement?.link?.url || "",
      startDate: advertisement?.displayPeriod?.startDate ? new Date(advertisement.displayPeriod.startDate) : new Date(),
      endDate: advertisement?.displayPeriod?.endDate ? new Date(advertisement.displayPeriod.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: advertisement?.isActive ?? true,
      priority: advertisement?.priority || 0,
      advertiserName: advertisement?.advertiser?.name || "",
      advertiserEmail: advertisement?.advertiser?.email || "",
      advertiserPhone: advertisement?.advertiser?.phone || "",
      desktopImage: null,
      mobileImage: null,
    },
  });

  useEffect(() => {
    api.get("/sports").then(res => setSports(res.data.data || []));
  }, []);

  const watchedSource = form.watch("source");
  useEffect(() => {
    setAdSource(watchedSource);
  }, [watchedSource]);

  // Function to determine which tab contains the missing field and navigate to it
  const navigateToFieldTab = useCallback((fieldName) => {
    const fieldTabMap = {
      titleAr: "basic",
      titleEn: "basic", 
      googleAdSlotId: "basic",
      link: "basic",
      advertiserName: "advertiser",
      advertiserEmail: "advertiser"
    };
    
    const targetTab = fieldTabMap[fieldName];
    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
      
      // Show toast notification about tab change
      toast.info(`تم الانتقال إلى تبويب "${targetTab === 'basic' ? 'المعلومات الأساسية' : targetTab === 'advertiser' ? 'معلومات المعلن' : 'الوسائط'}" للوصول للحقل المطلوب`);
      
      return true; // Tab was changed
    }
    return false; // Tab was not changed
  }, [activeTab]);

  // Listen for navigation events from parent components
  useEffect(() => {
    const handleNavigateToField = (event) => {
      const { fieldName } = event.detail;
      const tabChanged = navigateToFieldTab(fieldName);
      
      if (tabChanged) {
        // If tab was changed, focus the field after tab animation
        setTimeout(() => {
          const field = document.querySelector(`input[name="${fieldName}"]`);
          if (field) {
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    };

    window.addEventListener('navigateToField', handleNavigateToField);
    return () => window.removeEventListener('navigateToField', handleNavigateToField);
  }, [activeTab, navigateToFieldTab]);


  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">تنبيه: الحقول المطلوبة</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              الحقول المميزة بـ <span className="text-red-500 font-bold text-lg">*</span> مطلوبة ويجب ملؤها قبل الحفظ
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-3 w-full bg-white dark:bg-gray-800 shadow-sm rounded-xl p-1 border">
              <TabsTrigger 
                value="basic" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                المعلومات الأساسية
                <span className="text-red-500 text-xs mr-1">*</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                الوسائط
                 <span className="text-red-500 text-lg">*</span>
              </TabsTrigger>
              <TabsTrigger 
                value="advertiser" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                معلومات المعلن
                <span className="text-red-500 text-xs mr-1">*</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="basic" className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  إعدادات المصدر
                </h3>
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium">مصدر الإعلان</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FormControl><RadioGroupItem value="internal" /></FormControl>
                            <div className="flex-1">
                              <FormLabel className="font-medium cursor-pointer">إعلان داخلي (خاص)</FormLabel>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إعلان مخصص برفع الصور والمحتوى</p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FormControl><RadioGroupItem value="google" /></FormControl>
                            <div className="flex-1">
                              <FormLabel className="font-medium cursor-pointer">إعلان Google AdSense</FormLabel>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إعلان من Google باستخدام Ad Slot ID</p>
                            </div>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {adSource === 'google' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">إعدادات Google AdSense</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="googleAdSlotId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center gap-1">
                          معرف الوحدة الإعلانية (Ad Slot ID)
                          <span className="text-red-500 text-lg">*</span>
                        </FormLabel>
                        <FormControl><Input placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="bg-white dark:bg-gray-800" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="googleAdFormat" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">شكل الإعلان (Ad Format)</FormLabel>
                        <FormControl><Input placeholder="auto" className="bg-white dark:bg-gray-800" {...field} /></FormControl>
                        <FormDescription className="text-green-600 dark:text-green-400">(مثال: 'auto', 'rectangle')</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  المحتوى والوصف
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="titleAr" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-1">
                        العنوان بالعربية
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl><Input placeholder="عنوان الإعلان..." className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="titleEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-1">
                        العنوان بالإنجليزية
                        <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <FormControl><Input placeholder="Ad title..." className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">الوصف بالعربية</FormLabel>
                      <FormControl><Textarea placeholder="وصف الإعلان..." className="min-h-[100px] resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">الوصف بالإنجليزية</FormLabel>
                      <FormControl><Textarea placeholder="Ad description..." className="min-h-[100px] resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  🎯 النوع والموقع
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium">نوع الإعلان</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                          {adTypeOptions.map((option) => (
                            <FormItem key={option.value} className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <FormControl><RadioGroupItem value={option.value} /></FormControl>
                              <FormLabel className="font-medium cursor-pointer flex-1">{option.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium">موقع الإعلان</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                          {adPositionOptions.map((option) => (
                            <FormItem key={option.value} className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <FormControl><RadioGroupItem value={option.value} /></FormControl>
                              <FormLabel className="font-medium cursor-pointer flex-1">{option.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  الرابط والأولوية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adSource === 'internal' && (
                    <FormField control={form.control} name="link" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium flex items-center gap-1">
                          رابط الإعلان
                          <span className="text-red-500 text-lg">*</span>
                        </FormLabel>
                        <FormControl><Input placeholder="https://example.com" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">الأولوية</FormLabel>
                      <FormControl><Input type="number" min={0} className="h-11" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormDescription>رقم أعلى يعني أولوية أعلى.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  فترة العرض
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">تاريخ البدء</FormLabel>
                        <FormControl><Input type="date" className="h-11" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">تاريخ الانتهاء</FormLabel>
                        <FormControl><Input type="date" className="h-11" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>
              </div>
              <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <div className="space-y-1">
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        حالة الإعلان
                      </FormLabel>
                      <FormDescription className="text-gray-600 dark:text-gray-300">تفعيل أو تعطيل عرض هذا الإعلان للزوار</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
            </div>
          </TabsContent>

          {adSource === 'internal' && (
            <TabsContent value="media" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  رفع الصور
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField control={form.control} name="desktopImage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-4l-3 3-3-3H5a2 2 0 01-2-2V5zM5.5 8a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 4H6a1 1 0 110-2h3.5a1 1 0 110 2z" clipRule="evenodd" />
                        </svg>
                          صورة سطح المكتب
                           <span className="text-red-500 text-lg">*</span>
                      </FormLabel>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => field.onChange(e.target.files)} 
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </FormControl>
                        <FormDescription className="mt-2 text-sm text-gray-500">
                          الصورة التي تظهر على الشاشات الكبيرة (الحد الأقصى: 5MB)
                        </FormDescription>
                        <FormMessage />
                        <ImagePreview file={field.value} existingUrl={advertisement?.media?.desktop?.url} />
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="mobileImage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM7 11a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                        </svg>
                        صورة الجوال
                      </FormLabel>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => field.onChange(e.target.files)} 
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </FormControl>
                        <FormDescription className="mt-2 text-sm text-gray-500">
                          الصورة التي تظهر على الشاشات الصغيرة (الحد الأقصى: 5MB)
                        </FormDescription>
                        <FormMessage />
                        <ImagePreview file={field.value} existingUrl={advertisement?.media?.mobile?.url} />
                      </div>
                    </FormItem>
                  )} />
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="advertiser" className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                بيانات المعلن
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField control={form.control} name="advertiserName" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          اسم المعلن
                          <span className="text-red-500 text-lg">*</span>
                        </FormLabel>
                      <FormControl><Input placeholder="اسم الشركة أو الشخص..." className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="advertiserEmail" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          البريد الإلكتروني
                          <span className="text-red-500 text-lg">*</span>
                        </FormLabel>
                      <FormControl><Input type="email" placeholder="email@example.com" className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="advertiserPhone" render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        رقم الهاتف (اختياري)
                      </FormLabel>
                      <FormControl><Input placeholder="+966XXXXXXXXX" className="h-11" {...field} /></FormControl>
                      <FormDescription className="text-gray-500">رقم الهاتف للتواصل مع المعلن عند الحاجة</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 mt-8 -mx-6 -mb-6">
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {advertisement ? "تحديث الإعلان" : "إنشاء الإعلان"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
    </div>
  );
}
