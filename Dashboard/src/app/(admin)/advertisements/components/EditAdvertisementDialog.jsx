"use client";

import { Button } from "@/app/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/component/ui/dialog";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { Textarea } from "@/app/component/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function EditAdvertisementDialog({ open, onOpenChange, advertisement, onUpdate }) {
  const [formData, setFormData] = useState({
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    type: "banner",
    position: "home",
    link: "",
    displayPeriod: {
      startDate: "",
      endDate: "",
    },
    isActive: true,
    priority: 0,
    advertiser: {
      name: "",
      email: "",
      phone: "",
    },
    targeting: {
      countries: [],
      sports: [],
      ageRange: { min: null, max: null },
      gender: "all",
    },
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title || { ar: "", en: "" },
        description: advertisement.description || { ar: "", en: "" },
        type: advertisement.type || "banner",
        position: advertisement.position || "home",
        link: advertisement.link || "",
        displayPeriod: {
          startDate: advertisement.displayPeriod?.startDate ? 
            new Date(advertisement.displayPeriod.startDate).toISOString().split('T')[0] : "",
          endDate: advertisement.displayPeriod?.endDate ? 
            new Date(advertisement.displayPeriod.endDate).toISOString().split('T')[0] : "",
        },
        isActive: advertisement.isActive !== undefined ? advertisement.isActive : true,
        priority: advertisement.priority || 0,
        advertiser: advertisement.advertiser || { name: "", email: "", phone: "" },
        targeting: advertisement.targeting || {
          countries: [],
          sports: [],
          ageRange: { min: null, max: null },
          gender: "all",
        },
      });
      setDesktopPreview(advertisement.media?.desktop?.url || "");
      setMobilePreview(advertisement.media?.mobile?.url || "");
    }
  }, [advertisement]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (type === 'desktop') {
        setDesktopImage(response.data.url);
        setDesktopPreview(URL.createObjectURL(file));
      } else {
        setMobileImage(response.data.url);
        setMobilePreview(URL.createObjectURL(file));
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        media: {
          desktop: desktopImage ? { url: desktopImage } : advertisement?.media?.desktop,
          mobile: mobileImage ? { url: mobileImage } : advertisement?.media?.mobile,
        },
      };

      await api.put(`/advertisements/${advertisement._id}`, updateData);
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الإعلان بنجاح",
      });
      
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإعلان",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل الإعلان</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل الإعلان
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="titleAr">العنوان (عربي)</Label>
                <Input
                  id="titleAr"
                  value={formData.title.ar}
                  onChange={(e) => handleInputChange('title.ar', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="titleEn">العنوان (إنجليزي)</Label>
                <Input
                  id="titleEn"
                  value={formData.title.en}
                  onChange={(e) => handleInputChange('title.en', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.description.ar}
                  onChange={(e) => handleInputChange('description.ar', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">الوصف (إنجليزي)</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description.en', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="type">النوع</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="banner">بانر</option>
                  <option value="popup">نافذة منبثقة</option>
                  <option value="sidebar">شريط جانبي</option>
                  <option value="native">إعلان مدمج</option>
                </select>
              </div>
              <div>
                <Label htmlFor="position">الموقع</Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="home">الصفحة الرئيسية</option>
                  <option value="search">صفحة البحث</option>
                  <option value="profile">صفحة الملف الشخصي</option>
                  <option value="listing">صفحة القوائم</option>
                </select>
              </div>
              <div>
                <Label htmlFor="link">الرابط</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">الأولوية</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">فترة العرض</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.displayPeriod.startDate}
                  onChange={(e) => handleInputChange('displayPeriod.startDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.displayPeriod.endDate}
                  onChange={(e) => handleInputChange('displayPeriod.endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معلومات المعلن</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="advertiserName">اسم المعلن</Label>
                <Input
                  id="advertiserName"
                  value={formData.advertiser.name}
                  onChange={(e) => handleInputChange('advertiser.name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="advertiserEmail">البريد الإلكتروني</Label>
                <Input
                  id="advertiserEmail"
                  type="email"
                  value={formData.advertiser.email}
                  onChange={(e) => handleInputChange('advertiser.email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="advertiserPhone">رقم الهاتف</Label>
                <Input
                  id="advertiserPhone"
                  value={formData.advertiser.phone}
                  onChange={(e) => handleInputChange('advertiser.phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الصور</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>صورة سطح المكتب</Label>
                <div className="mt-2">
                  {desktopPreview && (
                    <img
                      src={desktopPreview}
                      alt="صورة سطح المكتب"
                      className="h-32 w-full object-cover rounded border mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'desktop')}
                    disabled={uploading}
                  />
                </div>
              </div>
              <div>
                <Label>صورة الجوال</Label>
                <div className="mt-2">
                  {mobilePreview && (
                    <img
                      src={mobilePreview}
                      alt="صورة الجوال"
                      className="h-32 w-full object-cover rounded border mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'mobile')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isActive">نشط</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري التحديث...
                </>
              ) : (
                "تحديث الإعلان"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
