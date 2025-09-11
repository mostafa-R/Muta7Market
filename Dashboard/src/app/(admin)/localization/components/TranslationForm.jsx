"use client";

import { Button } from "@/app/component/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/component/ui/select";
import { Textarea } from "@/app/component/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

const TranslationForm = ({ groups, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    key: "",
    group: "general",
    translations: {
      ar: "",
      en: ""
    },
    isSystem: false,
    metadata: {
      description: ""
    }
  });
  
  const [errors, setErrors] = useState({});
  
  // Validate the form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.key.trim()) {
      newErrors.key = "المفتاح مطلوب";
    } else if (!/^[a-z0-9_.-]+$/i.test(formData.key.trim())) {
      newErrors.key = "يجب أن يحتوي المفتاح على أحرف وأرقام وشرطات سفلية ونقاط وشرطات فقط";
    }
    
    if (!formData.translations.ar.trim()) {
      newErrors.ar = "الترجمة العربية مطلوبة";
    }
    
    if (!formData.translations.en.trim()) {
      newErrors.en = "الترجمة الإنجليزية مطلوبة";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "ar" || name === "en") {
      setFormData({
        ...formData,
        translations: {
          ...formData.translations,
          [name]: value
        }
      });
    } else if (name === "description") {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          description: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إضافة ترجمة جديدة</CardTitle>
          <CardDescription>
            إنشاء مفتاح ترجمة جديد للتطبيق الخاص بك
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">
                مفتاح الترجمة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="مثال: welcome_message"
                className={errors.key ? "border-red-500" : ""}
                dir="ltr"
              />
              {errors.key && (
                <p className="text-sm text-red-500">{errors.key}</p>
              )}
              <p className="text-xs text-gray-500">
                استخدم الأحرف الصغيرة والأرقام والشرطات السفلية والنقاط أو الشرطات
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group">المجموعة</Label>
              <Select
                value={formData.group}
                onValueChange={(value) => handleSelectChange("group", value)}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="اختر مجموعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">عام</SelectItem>
                  {groups.filter(g => g !== "general").map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                  <SelectItem value="new">+ إنشاء مجموعة جديدة</SelectItem>
                </SelectContent>
              </Select>
              {formData.group === "new" && (
                <Input
                  placeholder="أدخل اسم المجموعة الجديدة"
                  value={formData.newGroup || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    newGroup: e.target.value,
                    group: e.target.value || "new"
                  })}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ar">
                الترجمة العربية <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ar"
                name="ar"
                value={formData.translations.ar}
                onChange={handleChange}
                placeholder="أدخل الترجمة العربية"
                dir="rtl"
                className={errors.ar ? "border-red-500" : ""}
                rows={3}
              />
              {errors.ar && (
                <p className="text-sm text-red-500">{errors.ar}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="en">
                الترجمة الإنجليزية <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="en"
                name="en"
                value={formData.translations.en}
                onChange={handleChange}
                placeholder="Enter English translation"
                dir="ltr"
                className={errors.en ? "border-red-500" : ""}
                rows={3}
              />
              {errors.en && (
                <p className="text-sm text-red-500">{errors.en}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.metadata.description}
              onChange={handleChange}
              placeholder="وصف أو ملاحظات استخدام لهذه الترجمة"
              rows={2}
              dir="rtl"
            />
            <p className="text-xs text-gray-500">
              أضف سياقًا أو أمثلة لمساعدة أعضاء الفريق الآخرين على فهم كيفية استخدام هذه الترجمة
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 ml-2 border-2 border-b-transparent rounded-full"></div>
                جاري الإضافة...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 ml-2" />
                إضافة ترجمة
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default TranslationForm;
