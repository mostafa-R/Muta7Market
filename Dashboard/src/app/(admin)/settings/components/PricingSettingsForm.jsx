"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/component/ui/alert-dialog";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { AlertTriangle, Clock, DollarSign, Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PricingSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize form data with new pricing structure
  const [formData, setFormData] = useState({
    // مشاهدة الملفات والتواصل
    contacts_access_price: settings?.pricing?.contacts_access?.price || settings?.pricing?.contacts_access_year || 190,
    contacts_access_days: settings?.pricing?.contacts_access?.days || 365,
    
    // نشر ملف اللاعب
    listing_player_price: settings?.pricing?.listing_player?.price || settings?.pricing?.listing_year?.player || 140,
    listing_player_days: settings?.pricing?.listing_player?.days || 365,
    
    // نشر ملف المدرب
    listing_coach_price: settings?.pricing?.listing_coach?.price || settings?.pricing?.listing_year?.coach || 190,
    listing_coach_days: settings?.pricing?.listing_coach?.days || 365,
    
    // تثبيت ملف اللاعب
    promotion_player_price: settings?.pricing?.promotion_player?.price || settings?.pricing?.promotion_year?.player || 100,
    promotion_player_days: settings?.pricing?.promotion_player?.days || settings?.pricing?.promotion_default_days || 15,
    
    // تثبيت ملف المدرب
    promotion_coach_price: settings?.pricing?.promotion_coach?.price || settings?.pricing?.promotion_year?.coach || 100,
    promotion_coach_days: settings?.pricing?.promotion_coach?.days || settings?.pricing?.promotion_default_days || 15,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value)
    });
    setHasChanges(true);
  };
  
  // Reset to default values
  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state with default values
        const defaultPricing = result.data;
        
        setSettings({
          ...settings,
          pricing: defaultPricing
        });
        
        // Update form data with default values
        setFormData({
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
        });
        
        toast.success("تم استعادة إعدادات الأسعار الافتراضية بنجاح");
        setHasChanges(false);
      } else {
        throw new Error(result.message || "فشل استعادة إعدادات الأسعار الافتراضية");
      }
    } catch (error) {
      console.error("Error restoring default pricing settings:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsRestoring(false);
      setShowRestoreDialog(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
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
            // New pricing structure
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
            
            // Legacy fields for backward compatibility
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
            
            // Legacy fields
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
        toast.success("تم تحديث إعدادات الأسعار بنجاح");
        setHasChanges(false);
      } else {
        throw new Error(result.message || "فشل تحديث إعدادات الأسعار");
      }
    } catch (error) {
      console.error("Error updating pricing settings:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <div className="space-y-6">
        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-800">لديك تغييرات غير محفوظة</p>
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">إعدادات الأسعار والرسوم</h2>
          </div>
          
          <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">يمكنك تحديد أسعار الخدمات والاشتراكات المختلفة في المنصة وتحديد مدة كل خدمة. سيتم تطبيق هذه الإعدادات على جميع عمليات الدفع الجديدة.</p>
          </div>
          
          {/* مشاهدة الملفات والتواصل */}
          <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
              مشاهدة الملفات والتواصل
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="contacts_access_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  السعر
                </label>
                <div className="relative">
                  <Input
                    id="contacts_access_price"
                    name="contacts_access_price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.contacts_access_price}
                    onChange={handleChange}
                    className="pl-16"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                    <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contacts_access_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  المدة (بالأيام)
                </label>
                <div className="relative">
                  <Input
                    id="contacts_access_days"
                    name="contacts_access_days"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.contacts_access_days}
                    onChange={handleChange}
                    className="pl-16"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                    <span className="text-gray-500 dark:text-gray-400">يوم</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* نشر ملفات اللاعبين والمدربين */}
          <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              نشر الملفات
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* نشر ملف اللاعب */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-3">ملف اللاعب</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="listing_player_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      السعر
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_player_price"
                        name="listing_player_price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.listing_player_price}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="listing_player_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      المدة (بالأيام)
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_player_days"
                        name="listing_player_days"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.listing_player_days}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">يوم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* نشر ملف المدرب */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-3">ملف المدرب</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="listing_coach_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      السعر
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_coach_price"
                        name="listing_coach_price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.listing_coach_price}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="listing_coach_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      المدة (بالأيام)
                    </label>
                    <div className="relative">
                      <Input
                        id="listing_coach_days"
                        name="listing_coach_days"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.listing_coach_days}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">يوم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* تثبيت الملفات */}
          <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
              تثبيت الملفات
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* تثبيت ملف اللاعب */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-3">تثبيت ملف اللاعب</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="promotion_player_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      السعر
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_player_price"
                        name="promotion_player_price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.promotion_player_price}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="promotion_player_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      المدة (بالأيام)
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_player_days"
                        name="promotion_player_days"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.promotion_player_days}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">يوم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* تثبيت ملف المدرب */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-3">تثبيت ملف المدرب</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="promotion_coach_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      السعر
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_coach_price"
                        name="promotion_coach_price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.promotion_coach_price}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="promotion_coach_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      المدة (بالأيام)
                    </label>
                    <div className="relative">
                      <Input
                        id="promotion_coach_days"
                        name="promotion_coach_days"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.promotion_coach_days}
                        onChange={handleChange}
                        className="pl-16"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                        <span className="text-gray-500 dark:text-gray-400">يوم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowRestoreDialog(true)}
            disabled={isSubmitting || isRestoring}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            {isRestoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الاستعادة...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                استعادة الإعدادات الافتراضية
              </>
            )}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isRestoring || !hasChanges}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
        
        {/* Restore Confirmation Dialog */}
        <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الاستعادة...
                  </>
                ) : "استعادة الإعدادات الافتراضية"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
}