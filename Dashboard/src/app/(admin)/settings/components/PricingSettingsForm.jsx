"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function PricingSettingsForm({ settings, setSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contacts_access_year: settings?.pricing?.contacts_access_year || 190,
    listing_year_player: settings?.pricing?.listing_year?.player || 140,
    listing_year_coach: settings?.pricing?.listing_year?.coach || 190,
    promotion_year_player: settings?.pricing?.promotion_year?.player || 100,
    promotion_year_coach: settings?.pricing?.promotion_year?.coach || 100,
    promotion_per_day_player: settings?.pricing?.promotion_per_day?.player || 15,
    promotion_per_day_coach: settings?.pricing?.promotion_per_day?.coach || 15,
    promotion_default_days: settings?.pricing?.promotion_default_days || 15
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value)
    });
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
            contacts_access_year: formData.contacts_access_year,
            listing_year: {
              player: formData.listing_year_player,
              coach: formData.listing_year_coach
            },
            promotion_year: {
              player: formData.promotion_year_player,
              coach: formData.promotion_year_coach
            },
            promotion_per_day: {
              player: formData.promotion_per_day_player,
              coach: formData.promotion_per_day_coach
            },
            promotion_default_days: formData.promotion_default_days
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
            contacts_access_year: formData.contacts_access_year,
            listing_year: {
              player: formData.listing_year_player,
              coach: formData.listing_year_coach
            },
            promotion_year: {
              player: formData.promotion_year_player,
              coach: formData.promotion_year_coach
            },
            promotion_per_day: {
              player: formData.promotion_per_day_player,
              coach: formData.promotion_per_day_coach
            },
            promotion_default_days: formData.promotion_default_days
          }
        });
        toast.success("تم تحديث إعدادات الأسعار بنجاح");
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">إعدادات الأسعار والرسوم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="contacts_access_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الوصول للتواصل (سنوي)
                </label>
                <div className="relative">
                  <Input
                    id="contacts_access_year"
                    name="contacts_access_year"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.contacts_access_year}
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
                <label htmlFor="listing_year_player" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الإدراج السنوي (لاعب)
                </label>
                <div className="relative">
                  <Input
                    id="listing_year_player"
                    name="listing_year_player"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.listing_year_player}
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
                <label htmlFor="listing_year_coach" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الإدراج السنوي (مدرب)
                </label>
                <div className="relative">
                  <Input
                    id="listing_year_coach"
                    name="listing_year_coach"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.listing_year_coach}
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
                <label htmlFor="promotion_default_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  عدد أيام الترويج الافتراضي
                </label>
                <div className="relative">
                  <Input
                    id="promotion_default_days"
                    name="promotion_default_days"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.promotion_default_days}
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
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="promotion_year_player" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الترويج السنوي (لاعب)
                </label>
                <div className="relative">
                  <Input
                    id="promotion_year_player"
                    name="promotion_year_player"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.promotion_year_player}
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
                <label htmlFor="promotion_year_coach" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الترويج السنوي (مدرب)
                </label>
                <div className="relative">
                  <Input
                    id="promotion_year_coach"
                    name="promotion_year_coach"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.promotion_year_coach}
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
                <label htmlFor="promotion_per_day_player" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الترويج اليومي (لاعب)
                </label>
                <div className="relative">
                  <Input
                    id="promotion_per_day_player"
                    name="promotion_per_day_player"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.promotion_per_day_player}
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
                <label htmlFor="promotion_per_day_coach" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  سعر الترويج اليومي (مدرب)
                </label>
                <div className="relative">
                  <Input
                    id="promotion_per_day_coach"
                    name="promotion_per_day_coach"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.promotion_per_day_coach}
                    onChange={handleChange}
                    className="pl-16"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-slate-700 border-r border-gray-300 dark:border-slate-600 rounded-l-md">
                    <span className="text-gray-500 dark:text-gray-400">ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                جاري الحفظ...
              </>
            ) : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}
