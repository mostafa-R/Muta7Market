"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { Textarea } from "@/app/component/ui/textarea";

const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;
const MAX_POSITIONS = 50;
const MAX_ROLES = 20;

const JOB_OPTIONS = [
  { value: "player", label: "لاعب", icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: "coach", label: "مدرب", icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
];

export default function CreateSportForm({ onSportCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const iconInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: { ar: "", en: "" },
    positions: [],
    roleTypes: [],
    seo: {
      metaTitle: { ar: "", en: "" },
      metaDescription: { ar: "", en: "" },
      keywords: "",
    },
  });

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.ar.trim()) {
      errors.nameAr = "اسم اللعبة بالعربية مطلوب";
    } else if (formData.name.ar.length > MAX_NAME_LENGTH) {
      errors.nameAr = `اسم اللعبة يجب أن يكون أقل من ${MAX_NAME_LENGTH} حرف`;
    }

    if (!formData.name.en.trim()) {
      errors.nameEn = "اسم اللعبة بالإنجليزية مطلوب";
    } else if (formData.name.en.length > MAX_NAME_LENGTH) {
      errors.nameEn = `اسم اللعبة يجب أن يكون أقل من ${MAX_NAME_LENGTH} حرف`;
    }

    const invalidPositions = formData.positions.some(
      (p, index) => {
        if (!p?.name?.ar && !p?.name?.en) return false; 
        if (!p?.name?.ar || !p?.name?.en) {
          errors[`position_${index}`] = "كل موقع يجب أن يحتوي على الاسم بالعربية والإنجليزية";
          return true;
        }
        return false;
      }
    );

    const invalidRoles = formData.roleTypes.some(
      (r, index) => {
        if (!r?.jop && !r?.name?.ar && !r?.name?.en) return false; 
        if (!r?.jop || !r?.name?.ar || !r?.name?.en) {
          errors[`role_${index}`] = "كل نوع دور يجب أن يحتوي على (لاعب/مدرب) والاسم بالعربية والإنجليزية";
          return true;
        }
        return false;
      }
    );

    if (formData.seo.keywords && formData.seo.keywords.length > MAX_KEYWORDS_LENGTH) {
      errors.keywords = `الكلمات المفتاحية يجب أن تكون أقل من ${MAX_KEYWORDS_LENGTH} حرف`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const formCompletion = useMemo(() => {
    let completed = 0;
    const total = 6; 

    if (formData.name.ar.trim()) completed++;
    if (formData.name.en.trim()) completed++;
    if (formData.positions.length > 0) completed++;
    if (formData.roleTypes.length > 0) completed++;
    if (formData.seo.metaTitle.ar || formData.seo.metaTitle.en) completed++;
    if (formData.seo.keywords.trim()) completed++;

    return Math.round((completed / total) * 100);
  }, [formData]);

  const setByPath = useCallback((path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev);
      const parts = path.split(".");
      let target = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      return clone;
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleSimpleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      setByPath(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setHasUnsavedChanges(true);
    }
  }, [setByPath]);

  const addPosition = useCallback(() => {
    if (formData.positions.length >= MAX_POSITIONS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_POSITIONS} موقع`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      positions: [...prev.positions, { name: { ar: "", en: "" } }],
    }));
    setHasUnsavedChanges(true);
  }, [formData.positions.length]);

  const removePosition = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, idx) => idx !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updatePosition = useCallback((index, path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev);
      const segments = path.split(".");
      let target = clone.positions[index];
      for (let i = 0; i < segments.length - 1; i++) {
        target = target[segments[i]];
      }
      target[segments[segments.length - 1]] = value;
      return clone;
    });
    setHasUnsavedChanges(true);
  }, []);

  const addRole = useCallback(() => {
    if (formData.roleTypes.length >= MAX_ROLES) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_ROLES} نوع دور`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      roleTypes: [...prev.roleTypes, { jop: "", name: { ar: "", en: "" } }],
    }));
    setHasUnsavedChanges(true);
  }, [formData.roleTypes.length]);

  const removeRole = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      roleTypes: prev.roleTypes.filter((_, idx) => idx !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateRole = useCallback((index, path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev);
      if (path === "jop") {
        clone.roleTypes[index].jop = value;
      } else {
        const segments = path.split(".");
        let target = clone.roleTypes[index];
        for (let i = 0; i < segments.length - 1; i++) {
          target = target[segments[i]];
        }
        target[segments[segments.length - 1]] = value;
      }
      return clone;
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleIconChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم. يُسمح بـ JPEG, PNG, SVG, WebP فقط");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`حجم الملف كبير جداً. الحد الأقصى ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setIconPreview(event.target.result);
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearIcon = useCallback(() => {
    setIconPreview(null);
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
    setHasUnsavedChanges(true);
  }, []);

  const buildPayload = useCallback(() => {
    const keywords = formData.seo.keywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) || [];

    const positions = formData.positions
      .map((p) => ({
        name: {
          ar: (p?.name?.ar || "").trim(),
          en: (p?.name?.en || "").trim(),
        },
      }))
      .filter((p) => p.name.ar && p.name.en);

    const roleTypes = formData.roleTypes
      .map((r) => ({
        jop: (r?.jop || "").trim(),
        name: {
          ar: (r?.name?.ar || "").trim(),
          en: (r?.name?.en || "").trim(),
        },
      }))
      .filter((r) => r.jop && r.name.ar && r.name.en);

    const payload = {
      name: { 
        ar: formData.name.ar.trim(), 
        en: formData.name.en.trim() 
      },
      seo: {
        metaTitle: {
          ar: formData.seo.metaTitle.ar?.trim() || null,
          en: formData.seo.metaTitle.en?.trim() || null,
        },
        metaDescription: {
          ar: formData.seo.metaDescription.ar?.trim() || null,
          en: formData.seo.metaDescription.en?.trim() || null,
        },
        keywords,
      },
    };

    if (positions.length) payload.positions = positions;
    if (roleTypes.length) payload.roleTypes = roleTypes;

    return payload;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: { ar: "", en: "" },
      positions: [],
      roleTypes: [],
      seo: {
        metaTitle: { ar: "", en: "" },
        metaDescription: { ar: "", en: "" },
        keywords: "",
      },
    });
    setIconPreview(null);
    setValidationErrors({});
    setHasUnsavedChanges(false);
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("accessToken");
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }

      const formDataToSend = new FormData();
      const payload = buildPayload();

      formDataToSend.append('name', JSON.stringify(payload.name));
      formDataToSend.append('positions', JSON.stringify(payload.positions || []));
      formDataToSend.append('roleTypes', JSON.stringify(payload.roleTypes || []));
      formDataToSend.append('seo', JSON.stringify(payload.seo || {}));

      if (iconInputRef.current?.files?.[0]) {
        formDataToSend.append('icon', iconInputRef.current.files[0]);
      }

      const response = await fetch(`${API_BASE_URL}/sports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formDataToSend,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result?.message || result?.error?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(message);
      }

      const createdSport = result?.data ?? result;
      toast.success("تم إنشاء اللعبة الرياضية بنجاح");
      onSportCreated?.(createdSport);
      resetForm();

      if (typeof gtag !== 'undefined') {
        gtag('event', 'sport_created', {
          sport_name: payload.name.en,
          positions_count: payload.positions?.length || 0,
          roles_count: payload.roleTypes?.length || 0
        });
      }
    } catch (err) {
      console.error("Error creating sport:", err);
      toast.error(`حدث خطأ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, buildPayload, onSportCreated, resetForm]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      {/* Form Progress Header */}
      <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Save className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">إنشاء لعبة رياضية جديدة</h3>
              <p className="text-sm text-gray-600">املأ المعلومات المطلوبة لإضافة لعبة جديدة</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formCompletion}%</div>
            <p className="text-sm text-blue-700">مكتمل</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${formCompletion}%` }}
          ></div>
        </div>
        
        {hasUnsavedChanges && (
          <div className="mt-3 flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">لديك تغييرات غير محفوظة</span>
          </div>
        )}
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900 mb-2">يرجى تصحيح الأخطاء التالية:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">المعلومات الأساسية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  اسم اللعبة (بالعربية) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name.ar"
                  value={formData.name.ar}
                  onChange={handleSimpleChange}
                  placeholder="أدخل اسم اللعبة بالعربية"
                  className={validationErrors.nameAr ? "border-red-300" : ""}
                  maxLength={MAX_NAME_LENGTH}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{validationErrors.nameAr && <span className="text-red-500">{validationErrors.nameAr}</span>}</span>
                  <span>{formData.name.ar.length}/{MAX_NAME_LENGTH}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  اسم اللعبة (بالإنجليزية) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name.en"
                  value={formData.name.en}
                  onChange={handleSimpleChange}
                  placeholder="Enter sport name in English"
                  className={validationErrors.nameEn ? "border-red-300" : ""}
                  maxLength={MAX_NAME_LENGTH}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{validationErrors.nameEn && <span className="text-red-500">{validationErrors.nameEn}</span>}</span>
                  <span>{formData.name.en.length}/{MAX_NAME_LENGTH}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">المراكز</h3>
                  <p className="text-sm text-gray-600">إضافة مراكز اللعب المختلفة</p>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addPosition} 
                className="bg-green-600 hover:bg-green-700"
                disabled={formData.positions.length >= MAX_POSITIONS}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة موقع
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.positions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد مواقع بعد</p>
                  <p className="text-xs">اضغط "إضافة موقع" لإضافة أول موقع</p>
                </div>
              ) : (
                formData.positions.map((position, index) => (
                  <div key={`pos-${index}`} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">موقع #{index + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removePosition(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="اسم الموقع (عربي) *"
                        value={position.name.ar}
                        onChange={(e) => updatePosition(index, "name.ar", e.target.value)}
                        className={validationErrors[`position_${index}`] ? "border-red-300" : ""}
                      />
                      <Input
                        placeholder="اسم الموقع (إنجليزي) *"
                        value={position.name.en}
                        onChange={(e) => updatePosition(index, "name.en", e.target.value)}
                        className={validationErrors[`position_${index}`] ? "border-red-300" : ""}
                      />
                    </div>
                    {validationErrors[`position_${index}`] && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors[`position_${index}`]}</p>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {formData.positions.length >= MAX_POSITIONS && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">تم الوصول للحد الأقصى من المواقع ({MAX_POSITIONS})</span>
                </div>
              </div>
            )}
          </div>

          {/* Role Types */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">أنواع الوظائف</h3>
                  <p className="text-sm text-gray-600">تحديد أنواع الأدوار للاعبين والمدربين</p>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addRole} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={formData.roleTypes.length >= MAX_ROLES}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة نوع
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.roleTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد أنواع بعد</p>
                  <p className="text-xs">اضغط "إضافة نوع" لإضافة أول نوع (لاعب/مدرب)</p>
                </div>
              ) : (
                formData.roleTypes.map((role, index) => {
                  const jobOption = JOB_OPTIONS.find(opt => opt.value === role.jop);
                  return (
                    <div key={`role-${index}`} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">نوع #{index + 1}</span>
                          {jobOption && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${jobOption.bgColor} ${jobOption.color}`}>
                              {jobOption.label}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeRole(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">الفئة</label>
                          <Select 
                            value={role.jop || ""} 
                            onValueChange={(value) => updateRole(index, "jop", value)}
                          >
                            <SelectTrigger className={validationErrors[`role_${index}`] ? "border-red-300" : ""}>
                              <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                              {JOB_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className={`w-4 h-4 ${option.color}`} />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">الاسم (عربي)</label>
                          <Input
                            value={role.name.ar}
                            onChange={(e) => updateRole(index, "name.ar", e.target.value)}
                            placeholder="اسم النوع (عربي) *"
                            className={validationErrors[`role_${index}`] ? "border-red-300" : ""}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Name (English)</label>
                          <Input
                            value={role.name.en}
                            onChange={(e) => updateRole(index, "name.en", e.target.value)}
                            placeholder="Type name (English) *"
                            className={validationErrors[`role_${index}`] ? "border-red-300" : ""}
                          />
                        </div>
                      </div>
                      {validationErrors[`role_${index}`] && (
                        <p className="text-xs text-red-500 mt-2">{validationErrors[`role_${index}`]}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {formData.roleTypes.length >= MAX_ROLES && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">تم الوصول للحد الأقصى من الأنواع ({MAX_ROLES})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Icon & SEO */}
        <div className="space-y-8">
          {/* Icon Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">أيقونة اللعبة</h3>
                <p className="text-sm text-gray-600">اختر أيقونة مميزة للعبة</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {iconPreview ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <Image 
                        src={iconPreview} 
                        alt="أيقونة اللعبة" 
                        fill 
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        تغيير
                      </Button>
                      <Button
                        type="button"
                        onClick={clearIcon}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 ml-2" />
                        إزالة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        اختيار أيقونة
                      </Button>
                    </div>
                  </div>
                )}
                
                <input
                  id="icon-upload"
                  type="file"
                  ref={iconInputRef}
                  onChange={handleIconChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• يُفضّل SVG/PNG بخلفية شفافة</p>
                <p>• الحد الأقصى {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                <p>• الأنواع المدعومة: JPEG, PNG, SVG, WebP</p>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">إعدادات SEO</h3>
                <p className="text-sm text-gray-600">تحسين محركات البحث</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  name="seo.metaTitle.ar"
                  value={formData.seo.metaTitle.ar}
                  onChange={handleSimpleChange}
                  placeholder="Meta Title (عربي)"
                />
                <Input
                  name="seo.metaTitle.en"
                  value={formData.seo.metaTitle.en}
                  onChange={handleSimpleChange}
                  placeholder="Meta Title (English)"
                />
                <Textarea
                  name="seo.metaDescription.ar"
                  value={formData.seo.metaDescription.ar}
                  onChange={handleSimpleChange}
                  placeholder="Meta Description (عربي)"
                  rows={2}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <Textarea
                  name="seo.metaDescription.en"
                  value={formData.seo.metaDescription.en}
                  onChange={handleSimpleChange}
                  placeholder="Meta Description (English)"
                  rows={2}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700">
                  الكلمات المفتاحية (مفصولة بفواصل)
                </label>
                <Input
                  id="seo.keywords"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={handleSimpleChange}
                  placeholder="football, sport, تدريب"
                  className={validationErrors.keywords ? "border-red-300" : ""}
                  maxLength={MAX_KEYWORDS_LENGTH}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{validationErrors.keywords && <span className="text-red-500">{validationErrors.keywords}</span>}</span>
                  <span>{formData.seo.keywords.length}/{MAX_KEYWORDS_LENGTH}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {hasUnsavedChanges && (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>لديك تغييرات غير محفوظة</span>
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="hover:bg-gray-50"
            >
              <X className="w-4 h-4 ml-2" />
              مسح النموذج
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
              className="bg-[#273346] hover:bg-[#334155] text-white min-w-[120px] mb-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  إنشاء اللعبة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}