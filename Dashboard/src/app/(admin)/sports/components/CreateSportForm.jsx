"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export default function CreateSportForm({ onSportCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const iconInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: {
      ar: "",
      en: ""
    },
    description: {
      ar: "",
      en: ""
    },
    positions: "",
    roleTypes: "",
    isActive: true,
    displayOrder: 0
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
      
      const sportData = new FormData();
      
      // إضافة البيانات الأساسية
      sportData.append('name[ar]', formData.name.ar);
      sportData.append('name[en]', formData.name.en);
      
      if (formData.description.ar) {
        sportData.append('description[ar]', formData.description.ar);
      }
      
      if (formData.description.en) {
        sportData.append('description[en]', formData.description.en);
      }
      
      // إضافة المواقع والأدوار
      positions.forEach((position, index) => {
        sportData.append(`positions[${index}]`, position);
      });
      
      roleTypes.forEach((role, index) => {
        sportData.append(`roleTypes[${index}]`, role);
      });
      
      // إضافة الإعدادات الأخرى
      sportData.append('isActive', formData.isActive);
      sportData.append('displayOrder', formData.displayOrder);
      
      // إضافة الأيقونة إذا كانت موجودة
      if (iconInputRef.current.files[0]) {
        sportData.append('icon', iconInputRef.current.files[0]);
      }
      
      const response = await fetch(`${API_BASE_URL}/sports`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: sportData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        onSportCreated(result.data);
        // إعادة تعيين النموذج
        setFormData({
          name: { ar: "", en: "" },
          description: { ar: "", en: "" },
          positions: "",
          roleTypes: "",
          isActive: true,
          displayOrder: 0
        });
        setIconPreview(null);
        if (iconInputRef.current) {
          iconInputRef.current.value = "";
        }
      } else {
        throw new Error(result.message || "فشل إنشاء اللعبة الرياضية");
      }
    } catch (error) {
      console.error("Error creating sport:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">المعلومات الأساسية</h3>
            
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
                  rows={3}
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
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">المواقع والأدوار</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="positions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  المواقع
                </label>
                <Textarea
                  id="positions"
                  name="positions"
                  value={formData.positions}
                  onChange={handleChange}
                  placeholder="أدخل المواقع مفصولة بفواصل (مثال: حارس مرمى، مدافع، وسط، مهاجم)"
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
                  placeholder="أدخل الأدوار مفصولة بفواصل (مثال: لاعب، مدرب، حكم)"
                  rows={2}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  أدخل الأدوار مفصولة بفواصل
                </p>
              </div>
            </div>
          </div>
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
                id="icon-upload"
              />
              <label
                htmlFor="icon-upload"
                className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
              >
                اختيار أيقونة
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                يفضل استخدام صورة بصيغة SVG أو PNG بخلفية شفافة. الحد الأقصى للحجم: 2 ميجابايت
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات إضافية</h3>
            
            <div className="space-y-4">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  يتم ترتيب الألعاب تصاعدياً حسب هذه القيمة
                </p>
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
              جاري الإنشاء...
            </>
          ) : "إنشاء اللعبة"}
        </Button>
      </div>
    </form>
  );
}
