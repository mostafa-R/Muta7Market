"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import AboutSettingsForm from "./components/AboutSettingsForm";
import AdSettingsForm from "./components/AdSettingsForm";
import ContactSettingsForm from "./components/ContactSettingsForm";
import GeneralSettingsForm from "./components/GeneralSettingsForm";
import LogoSettingsForm from "./components/LogoSettingsForm";
import PricingSettingsForm from "./components/PricingSettingsForm";
import SeoSettingsForm from "./components/SeoSettingsForm";
import TermsSettingsForm from "./components/TermsSettingsForm";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  // استرجاع الإعدادات من API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
        const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
        
        const response = await fetch(`${API_BASE_URL}/settings`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setSettings(result.data);
        } else {
          throw new Error(result.message || "Invalid response format");
        }
      } catch (err) {
       
        setError(err.message);
        
        // بيانات تجريبية للعرض عند وجود خطأ
        setSettings({
          siteName: { ar: "متاح ماركت", en: "Muta7Market" },
          logo: { url: "/images/logo/logo-dark.svg" },
          favicon: { url: "/images/logo/logo-icon.svg" },
          contactInfo: {
            email: "info@muta7market.com",
            phone: "+966512345678",
            address: { ar: "الرياض، المملكة العربية السعودية", en: "Riyadh, Saudi Arabia" },
            socialMedia: {
              facebook: "https://facebook.com/muta7market",
              twitter: "https://twitter.com/muta7market",
              instagram: "https://instagram.com/muta7market",
              youtube: "",
              linkedin: ""
            }
          },
          seo: {
            metaTitle: { ar: "متاح ماركت - منصة رياضية", en: "Muta7Market - Sports Platform" },
            metaDescription: { 
              ar: "منصة متاح ماركت تربط بين اللاعبين والمدربين", 
              en: "Muta7Market platform connects players and coaches" 
            },
            keywords: ["رياضة", "كرة قدم", "تدريب", "sports", "football", "coaching"],
            googleAnalyticsId: "UA-XXXXXXXXX"
          },
          pricing: {
            contacts_access_year: 190,
            listing_year: { player: 140, coach: 190 },
            promotion_year: { player: 100, coach: 100 },
            promotion_per_day: { player: 15, coach: 15 },
            promotion_default_days: 15
          },
          translations: {
            custom: {}
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };


  if (loading) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="الإعدادات العامة" />
        <div className="mt-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="الإعدادات العامة" />
        <div className="mt-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <h3 className="text-lg font-medium">حدث خطأ</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <PageBreadCrumb pageTitle="الإعدادات العامة" />
      
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">إعدادات الموقع</h1>
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
            <p className="font-medium">تعذر الاتصال بالخادم. يتم عرض بيانات تجريبية.</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2">
            <TabsTrigger value="general">معلومات عامة</TabsTrigger>
            <TabsTrigger value="ads">إعدادات الإعلانات</TabsTrigger>
            <TabsTrigger value="logo">الشعار والأيقونة</TabsTrigger>
            <TabsTrigger value="seo">إعدادات SEO</TabsTrigger>
            <TabsTrigger value="pricing">الأسعار والرسوم</TabsTrigger>
            <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
            <TabsTrigger value="terms">الشروط والأحكام</TabsTrigger>
            <TabsTrigger value="about">من نحن</TabsTrigger>
          </TabsList>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
            <TabsContent value="general">
              <GeneralSettingsForm settings={settings} setSettings={setSettings} />
            </TabsContent>

            <TabsContent value="about">
              <AboutSettingsForm />
            </TabsContent>

            <TabsContent value="terms">
              <TermsSettingsForm />
            </TabsContent>
            
            <TabsContent value="logo">
              <LogoSettingsForm settings={settings} setSettings={setSettings} />
            </TabsContent>

            <TabsContent value="ads">
              <AdSettingsForm />
            </TabsContent>
            
            <TabsContent value="seo">
              <SeoSettingsForm settings={settings} setSettings={setSettings} />
            </TabsContent>
            
            <TabsContent value="pricing">
              <PricingSettingsForm settings={settings} setSettings={setSettings} />
            </TabsContent>
            
            <TabsContent value="contact">
              <ContactSettingsForm settings={settings} setSettings={setSettings} />
            </TabsContent>
            
            
        
          </div>
        </Tabs>
      </div>
    </div>
  );
}
