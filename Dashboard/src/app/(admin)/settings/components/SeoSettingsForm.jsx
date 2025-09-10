"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/component/ui/alert-dialog";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import { AlertTriangle, Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SeoSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [formData, setFormData] = useState({
    metaTitle: {
      ar: settings?.seo?.metaTitle?.ar || "",
      en: settings?.seo?.metaTitle?.en || ""
    },
    metaDescription: {
      ar: settings?.seo?.metaDescription?.ar || "",
      en: settings?.seo?.metaDescription?.en || ""
    },
    keywords: settings?.seo?.keywords?.join(", ") || "",
    googleAnalyticsId: settings?.seo?.googleAnalyticsId || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Reset to default values
  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state with default values
        const defaultSeo = result.data?.seo || {
          metaTitle: { ar: "", en: "" },
          metaDescription: { ar: "", en: "" },
          keywords: [],
          googleAnalyticsId: ""
        };
        
        setSettings({
          ...settings,
          seo: defaultSeo
        });
        
        // Update form data
        setFormData({
          metaTitle: {
            ar: defaultSeo.metaTitle?.ar || "",
            en: defaultSeo.metaTitle?.en || ""
          },
          metaDescription: {
            ar: defaultSeo.metaDescription?.ar || "",
            en: defaultSeo.metaDescription?.en || ""
          },
          keywords: defaultSeo.keywords?.join(", ") || "",
          googleAnalyticsId: defaultSeo.googleAnalyticsId || ""
        });
        
        toast.success("تم استعادة الإعدادات الافتراضية بنجاح");
      } else {
        throw new Error(result.message || "فشل استعادة الإعدادات الافتراضية");
      }
    } catch (error) {
      console.error("Error restoring default SEO settings:", error);
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
      
      const keywords = formData.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword !== "");
      
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        toast.success("تم تحديث إعدادات SEO بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث إعدادات SEO");
      }
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">إعدادات محركات البحث (SEO)</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="metaTitle.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  عنوان الصفحة الرئيسية (بالعربية)
                </label>
                <Input
                  id="metaTitle.ar"
                  name="metaTitle.ar"
                  value={formData.metaTitle.ar}
                  onChange={handleChange}
                  placeholder="أدخل عنوان الصفحة بالعربية"
                  maxLength={60}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaTitle.ar.length}/60 حرف
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="metaTitle.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  عنوان الصفحة الرئيسية (بالإنجليزية)
                </label>
                <Input
                  id="metaTitle.en"
                  name="metaTitle.en"
                  value={formData.metaTitle.en}
                  onChange={handleChange}
                  placeholder="Enter page title in English"
                  maxLength={60}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaTitle.en.length}/60 character
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="metaDescription.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  وصف الصفحة الرئيسية (بالعربية)
                </label>
                <Textarea
                  id="metaDescription.ar"
                  name="metaDescription.ar"
                  value={formData.metaDescription.ar}
                  onChange={handleChange}
                  placeholder="أدخل وصف الصفحة بالعربية"
                  maxLength={160}
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaDescription.ar.length}/160 حرف
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="metaDescription.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  وصف الصفحة الرئيسية (بالإنجليزية)
                </label>
                <Textarea
                  id="metaDescription.en"
                  name="metaDescription.en"
                  value={formData.metaDescription.en}
                  onChange={handleChange}
                  placeholder="Enter page description in English"
                  maxLength={160}
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaDescription.en.length}/160 character
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الكلمات المفتاحية
              </label>
              <Input
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                أدخل الكلمات المفتاحية مفصولة بفواصل (مثال: رياضة, كرة قدم, تدريب)
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                معرف Google Analytics
              </label>
              <Input
                id="googleAnalyticsId"
                name="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={handleChange}
                placeholder="أدخل معرف Google Analytics (مثال: UA-XXXXXXXXX أو G-XXXXXXXXX)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                أدخل معرف Google Analytics الخاص بك لتتبع إحصائيات الزيارات
              </p>
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
            disabled={isSubmitting || isRestoring}
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
