"use client";

import { Button } from "@/app/component/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/component/ui/dialog";
import { Input } from "@/app/component/ui/input";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export default function EditSportDialog({ sport, isOpen, onClose, onSportUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIconSubmitting, setIsIconSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState(sport?.icon?.url || null);
  const iconInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: {
      ar: sport?.name?.ar || "",
      en: sport?.name?.en || ""
    },
    description: {
      ar: sport?.description?.ar || "",
      en: sport?.description?.en || ""
    },
    positions: sport?.positions?.join(", ") || "",
    roleTypes: sport?.roleTypes?.join(", ") || "",
    isActive: sport?.isActive !== undefined ? sport.isActive : true,
    displayOrder: sport?.displayOrder || 0
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

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value)
    });
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جدًا. الحد الأقصى هو 2 ميجابايت");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setIconPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.ar || !formData.name.en) {
      toast.error("يرجى إدخال اسم اللعبة باللغتين العربية والإنجليزية");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      // إعداد بيانات الطلب
      const positions = formData.positions
        ? formData.positions.split(',').map(pos => pos.trim()).filter(pos => pos !== "")
        : [];
      
      const roleTypes = formData.roleTypes
        ? formData.roleTypes.split(',').map(role => role.trim()).filter(role => role !== "")
        : [];
      
      const response = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          positions,
          roleTypes,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        onSportUpdated(result.data);
        toast.success("تم تحديث اللعبة الرياضية بنجاح");
        onClose();
      } else {
        throw new Error(result.message || "فشل تحديث اللعبة الرياضية");
      }
    } catch (error) {
      console.error("Error updating sport:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIconSubmit = async (e) => {
    e.preventDefault();
    
    if (!iconInputRef.current.files[0]) {
      toast.error("يرجى اختيار أيقونة للعبة");
      return;
    }
    
    setIsIconSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const iconData = new FormData();
      iconData.append('icon', iconInputRef.current.files[0]);
      
      const response = await fetch(`${API_BASE_URL}/sports/${sport._id}/icon`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: iconData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        onSportUpdated(result.data);
        toast.success("تم تحديث أيقونة اللعبة بنجاح");
      } else {
        throw new Error(result.message || "فشل تحديث أيقونة اللعبة");
      }
    } catch (error) {
      console.error("Error updating sport icon:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsIconSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} dir="rtl">
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تعديل اللعبة الرياضية</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    اسم اللعبة (بالعربية) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name.ar"
                    name="name.ar"
                    value={formData.name.ar}
                    onChange={handleChange}
                    placeholder="أدخل اسم اللعبة بالعربية"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="name.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    اسم اللعبة (بالإنجليزية) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name.en"
                    name="name.en"
                    value={formData.name.en}
                    onChange={handleChange}
                    placeholder="Enter sport name in English"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description.ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    وصف اللعبة (بالعربية)
                  </label>
                  <Textarea
                    id="description.ar"
                    name="description.ar"
                    value={formData.description.ar}
                    onChange={handleChange}
                    placeholder="أدخل وصف اللعبة بالعربية"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    وصف اللعبة (بالإنجليزية)
                  </label>
                  <Textarea
                    id="description.en"
                    name="description.en"
                    value={formData.description.en}
                    onChange={handleChange}
                    placeholder="Enter sport description in English"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="positions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    المواقع
                  </label>
                  <Textarea
                    id="positions"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    placeholder="أدخل المواقع مفصولة بفواصل"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    أدخل المواقع مفصولة بفواصل
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="roleTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    الأدوار
                  </label>
                  <Textarea
                    id="roleTypes"
                    name="roleTypes"
                    value={formData.roleTypes}
                    onChange={handleChange}
                    placeholder="أدخل الأدوار مفصولة بفواصل"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    أدخل الأدوار مفصولة بفواصل
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">الحالة</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تفعيل أو تعطيل اللعبة</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ترتيب العرض
                  </label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      جاري الحفظ...
                    </>
                  ) : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">أيقونة اللعبة</h3>
              
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800">
                {iconPreview ? (
                  <div className="relative w-32 h-32 mb-4">
                    <Image 
                      src={iconPreview} 
                      alt="أيقونة اللعبة" 
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center text-gray-400 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={iconInputRef}
                  onChange={handleIconChange}
                  accept="image/*"
                  className="hidden"
                  id="icon-upload-edit"
                />
                <label
                  htmlFor="icon-upload-edit"
                  className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  تغيير الأيقونة
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  يفضل استخدام صورة بصيغة SVG أو PNG بخلفية شفافة. الحد الأقصى للحجم: 2 ميجابايت
                </p>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={handleIconSubmit} 
                  disabled={isIconSubmitting || !iconInputRef.current?.files[0]}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isIconSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      جاري رفع الأيقونة...
                    </>
                  ) : "تحديث الأيقونة"}
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">معلومات إضافية</h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <p>الرابط: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">{sport?.slug}</code></p>
                <p>تاريخ الإنشاء: {new Date(sport?.createdAt).toLocaleDateString('ar-SA')}</p>
                <p>آخر تحديث: {sport?.updatedAt ? new Date(sport.updatedAt).toLocaleDateString('ar-SA') : '-'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
