"use client";
import { Button } from "@/app/component/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/app/component/ui/form";
import { Slider } from "@/app/component/ui/slider";
import { Switch } from "@/app/component/ui/switch";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AdSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratio, setRatio] = useState(100);

  const form = useForm({
    defaultValues: {
      enableGoogleAds: false,
      internalAdsRatio: 100,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/ad-settings");
        const settings = response.data; 
        
        if (settings) {
          form.reset({
            enableGoogleAds: settings.googleAds.enabled,
            internalAdsRatio: settings.internalAdsRatio,
          });
          setRatio(settings.internalAdsRatio);
        }
      } catch (error) {
        console.log("Error fetching ad settings:", error);
        toast.error("فشل في تحميل إعدادات الإعلانات.", error.message);
       
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (values) => {
    try {
      setSaving(true);
      const payload = {
        googleAds: {
          enabled: values.enableGoogleAds,
        },
        internalAdsRatio: values.internalAdsRatio,
      };
      await api.patch("/ad-settings", payload);
   
      toast.success("تم حفظ إعدادات الإعلانات بنجاح.");
    } catch (error) {
    
      toast.error("فشل في حفظ الإعدادات.", error.message);
   
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>جاري تحميل الإعدادات...</div>;
  }

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="enableGoogleAds"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">تفعيل إعلانات Google AdSense</FormLabel>
                    <FormDescription>
                      عند التفعيل، سيتم عرض إعلانات Google AdSense على موقعك بجانب إعلاناتك الخاصة.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="internalAdsRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نسبة ظهور إعلاناتك الخاصة</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={0}
                        max={100}
                        step={10}
                        value={[field.value]}
                        onValueChange={(value) => {
                          field.onChange(value[0]);
                          setRatio(value[0]);
                        }}
                        className="w-[85%]"
                      />
                      <span className="w-[15%] text-center font-semibold">{ratio}%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    حدد النسبة المئوية لظهور إعلاناتك الخاصة. النسبة المتبقية ستكون لإعلانات Google AdSense.
                    (مثال: 70% يعني أن 7 من كل 10 إعلانات ستكون من إعلاناتك الخاصة).
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </Form>
  );
}
