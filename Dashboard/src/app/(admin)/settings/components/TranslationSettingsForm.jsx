"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function TranslationSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translations, setTranslations] = useState(
    settings?.translations?.custom || {}
  );
  const [newKey, setNewKey] = useState("");
  const [newValueAr, setNewValueAr] = useState("");
  const [newValueEn, setNewValueEn] = useState("");

  const handleAddTranslation = () => {
    if (!newKey || !newValueAr || !newValueEn) {
      toast.error("يرجى إدخال المفتاح والقيم بكلا اللغتين");
      return;
    }

    if (translations[newKey]) {
      toast.error("هذا المفتاح موجود بالفعل");
      return;
    }

    setTranslations({
      ...translations,
      [newKey]: {
        ar: newValueAr,
        en: newValueEn
      }
    });

    setNewKey("");
    setNewValueAr("");
    setNewValueEn("");

    toast.success("تمت إضافة الترجمة بنجاح");
  };

  const handleEditTranslation = (key, lang, value) => {
    setTranslations({
      ...translations,
      [key]: {
        ...translations[key],
        [lang]: value
      }
    });
  };

  const handleDeleteTranslation = (key) => {
    const newTranslations = { ...translations };
    delete newTranslations[key];
    setTranslations(newTranslations);
    toast.success("تم حذف الترجمة بنجاح");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/settings/translations`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: translations
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          ...settings,
          translations: {
            ...settings.translations,
            custom: translations
          }
        });
        toast.success("تم تحديث الترجمات المخصصة بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث الترجمات المخصصة");
      }
    } catch (error) {
      console.error("Error updating translations:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">الترجمات المخصصة</h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            يمكنك إضافة ترجمات مخصصة للنصوص التي تظهر في الموقع. أدخل المفتاح والقيمة بكلا اللغتين العربية والإنجليزية.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">إضافة ترجمة جديدة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="newKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المفتاح
              </label>
              <Input
                id="newKey"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="مثال: welcome_message"
              />
            </div>
            
            <div>
              <label htmlFor="newValueAr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                القيمة (بالعربية)
              </label>
              <Input
                id="newValueAr"
                value={newValueAr}
                onChange={(e) => setNewValueAr(e.target.value)}
                placeholder="مثال: مرحباً بك في موقعنا"
              />
            </div>
            
            <div>
              <label htmlFor="newValueEn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                القيمة (بالإنجليزية)
              </label>
              <Input
                id="newValueEn"
                value={newValueEn}
                onChange={(e) => setNewValueEn(e.target.value)}
                placeholder="Example: Welcome to our website"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              type="button"
              onClick={handleAddTranslation}
              className="bg-green-600 hover:bg-green-700"
            >
              إضافة ترجمة
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <form onSubmit={handleSubmit}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-800">
                  <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">المفتاح</th>
                  <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">القيمة (بالعربية)</th>
                  <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">القيمة (بالإنجليزية)</th>
                  <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(translations).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border border-gray-200 dark:border-slate-700 px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      لا توجد ترجمات مخصصة حتى الآن
                    </td>
                  </tr>
                ) : (
                  Object.entries(translations).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 dark:hover:bg-slate-800/60">
                      <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                        <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">
                          {key}
                        </code>
                      </td>
                      <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                        <Input
                          value={value.ar}
                          onChange={(e) => handleEditTranslation(key, 'ar', e.target.value)}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                        <Input
                          value={value.en}
                          onChange={(e) => handleEditTranslation(key, 'en', e.target.value)}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">
                        <Button 
                          type="button"
                          onClick={() => handleDeleteTranslation(key)}
                          variant="destructive"
                          size="sm"
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || Object.keys(translations).length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    جاري الحفظ...
                  </>
                ) : "حفظ الترجمات"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
