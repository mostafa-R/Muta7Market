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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { Textarea } from "@/app/component/ui/textarea";
import {
  AlertCircle,
  Calendar,
  Edit3,
  Hash,
  Image as ImageIcon,
  Info,
  Link,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X,
  Zap
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";


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

export default function EditSportDialog({
  sport,
  isOpen,
  onClose,
  onSportUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIconSubmitting, setIsIconSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const iconInputRef = useRef(null);
  const [iconPreview, setIconPreview] = useState(sport?.icon?.url || null);

  const [form, setForm] = useState(() => ({
    name: {
      ar: sport?.name?.ar || "",
      en: sport?.name?.en || "",
    },
    positions:
      sport?.positions?.map((p) => ({
        name: { ar: p?.name?.ar || "", en: p?.name?.en || "" },
      })) || [],
    roleTypes:
      sport?.roleTypes?.map((r) => ({
        jop: r?.jop || "",
        name: { ar: r?.name?.ar || "", en: r?.name?.en || "" },
      })) || [],
    seo: {
      metaTitle: {
        ar: sport?.seo?.metaTitle?.ar || "",
        en: sport?.seo?.metaTitle?.en || "",
      },
      metaDescription: {
        ar: sport?.seo?.metaDescription?.ar || "",
        en: sport?.seo?.metaDescription?.en || "",
      },
      keywords: (sport?.seo?.keywords || []).join(", "),
    },
  }));

  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
  const getToken = useCallback(() =>
    localStorage.getItem("token") || sessionStorage.getItem("accessToken"), []);

 
  const formCompletion = useMemo(() => {
    if (!sport) return 0;
    let completed = 0;
    const total = 6;

    if (form.name.ar.trim()) completed++;
    if (form.name.en.trim()) completed++;
    if (form.positions.length > 0) completed++;
    if (form.roleTypes.length > 0) completed++;
    if (form.seo.metaTitle.ar || form.seo.metaTitle.en) completed++;
    if (form.seo.keywords.trim()) completed++;

    return Math.round((completed / total) * 100);
  }, [form, sport]);

  
  useEffect(() => {
    if (!sport) return;
    
    setForm({
      name: {
        ar: sport?.name?.ar || "",
        en: sport?.name?.en || "",
      },
      positions:
        sport?.positions?.map((p) => ({
          name: { ar: p?.name?.ar || "", en: p?.name?.en || "" },
        })) || [],
      roleTypes:
        sport?.roleTypes?.map((r) => ({
          jop: r?.jop || "",
          name: { ar: r?.name?.ar || "", en: r?.name?.en || "" },
        })) || [],
      seo: {
        metaTitle: {
          ar: sport?.seo?.metaTitle?.ar || "",
          en: sport?.seo?.metaTitle?.en || "",
        },
        metaDescription: {
          ar: sport?.seo?.metaDescription?.ar || "",
          en: sport?.seo?.metaDescription?.en || "",
        },
        keywords: (sport?.seo?.keywords || []).join(", "),
      },
    });
    
    setIconPreview(sport?.icon?.url || null);
    setValidationErrors({});
    setHasUnsavedChanges(false);
    
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
  }, [sport]);


  const validateForm = useCallback(() => {
    const errors = {};

  
    if (!form.name.ar.trim()) {
      errors.nameAr = "اسم اللعبة بالعربية مطلوب";
    } else if (form.name.ar.length > MAX_NAME_LENGTH) {
      errors.nameAr = `اسم اللعبة يجب أن يكون أقل من ${MAX_NAME_LENGTH} حرف`;
    }

    if (!form.name.en.trim()) {
      errors.nameEn = "اسم اللعبة بالإنجليزية مطلوب";
    } else if (form.name.en.length > MAX_NAME_LENGTH) {
      errors.nameEn = `اسم اللعبة يجب أن يكون أقل من ${MAX_NAME_LENGTH} حرف`;
    }

 
    form.positions.forEach((p, index) => {
      if ((p?.name?.ar || p?.name?.en) && (!p?.name?.ar || !p?.name?.en)) {
        errors[`position_${index}`] = "كل موقع يجب أن يحتوي على الاسم بالعربية والإنجليزية";
      }
    });


    form.roleTypes.forEach((r, index) => {
      if ((r?.name?.ar || r?.name?.en || r?.jop) && (!r?.jop || !r?.name?.ar || !r?.name?.en)) {
        errors[`role_${index}`] = "كل نوع دور يجب أن يحتوي على الفئة (لاعب/مدرب) والاسم بالعربية والإنجليزية";
      }
    });


    if (form.seo.keywords && form.seo.keywords.length > MAX_KEYWORDS_LENGTH) {
      errors.keywords = `الكلمات المفتاحية يجب أن تكون أقل من ${MAX_KEYWORDS_LENGTH} حرف`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const setField = useCallback((path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const segments = path.split(".");
      let target = next;
      for (let i = 0; i < segments.length - 1; i++) {
        target = target[segments[i]];
      }
      target[segments[segments.length - 1]] = value;
      return next;
    });
    setHasUnsavedChanges(true);
  }, []);


  const addPosition = useCallback(() => {
    if (form.positions.length >= MAX_POSITIONS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_POSITIONS} موقع`);
      return;
    }
    setForm((prev) => ({
      ...prev,
      positions: [...prev.positions, { name: { ar: "", en: "" } }],
    }));
    setHasUnsavedChanges(true);
  }, [form.positions.length]);

  const removePosition = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updatePosition = useCallback((index, lang, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      next.positions[index].name[lang] = value;
      return next;
    });
    setHasUnsavedChanges(true);
  }, []);

  const addRole = useCallback(() => {
    if (form.roleTypes.length >= MAX_ROLES) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_ROLES} نوع دور`);
      return;
    }
    setForm((prev) => ({
      ...prev,
      roleTypes: [...prev.roleTypes, { jop: "", name: { ar: "", en: "" } }],
    }));
    setHasUnsavedChanges(true);
  }, [form.roleTypes.length]);

  const removeRole = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      roleTypes: prev.roleTypes.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateRole = useCallback((index, path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      if (path === "jop") {
        next.roleTypes[index].jop = value;
      } else {
        next.roleTypes[index].name[path] = value;
      }
      return next;
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
    const keywords = form.seo.keywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) || [];

    const positions = form.positions
      .map((p) => ({
        name: {
          ar: (p?.name?.ar || "").trim(),
          en: (p?.name?.en || "").trim(),
        },
      }))
      .filter((p) => p.name.ar || p.name.en);

    const roleTypes = form.roleTypes
      .map((r) => ({
        jop: (r?.jop || "").trim(),
        name: {
          ar: (r?.name?.ar || "").trim(),
          en: (r?.name?.en || "").trim(),
        },
      }))
      .filter((r) => r.jop && r.name.ar && r.name.en);

    return {
      name: {
        ar: form.name.ar.trim(),
        en: form.name.en.trim(),
      },
      positions,
      roleTypes,
      seo: {
        metaTitle: {
          ar: form.seo.metaTitle.ar?.trim() || null,
          en: form.seo.metaTitle.en?.trim() || null,
        },
        metaDescription: {
          ar: form.seo.metaDescription.ar?.trim() || null,
          en: form.seo.metaDescription.en?.trim() || null,
        },
        keywords,
      },
    };
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }

      const payload = buildPayload();
      const hasNewIcon = iconInputRef.current?.files?.[0];

      if (hasNewIcon) {
        const formData = new FormData();
        formData.append('name', JSON.stringify(payload.name));
        formData.append('positions', JSON.stringify(payload.positions || []));
        formData.append('roleTypes', JSON.stringify(payload.roleTypes || []));
        formData.append('seo', JSON.stringify(payload.seo || {}));
        formData.append('icon', iconInputRef.current.files[0]);

        const response = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = result?.message || result?.error?.message || `خطأ في الخادم (${response.status})`;
          throw new Error(message);
        }

        const updated = result?.data ?? result;
        onSportUpdated?.(updated);
        toast.success("تم حفظ التغييرات بنجاح");

        if (iconInputRef.current) {
          iconInputRef.current.value = "";
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = result?.message || result?.error?.message || `خطأ في الخادم (${response.status})`;
          throw new Error(message);
        }

        const updated = result?.data ?? result;
        onSportUpdated?.(updated);
        toast.success("تم حفظ التغييرات بنجاح");
      }

      setHasUnsavedChanges(false);

      if (typeof gtag !== 'undefined') {
        gtag('event', 'sport_updated', {
          sport_id: sport._id,
          sport_name: payload.name.en,
          positions_count: payload.positions?.length || 0,
          roles_count: payload.roleTypes?.length || 0
        });
      }
    } catch (err) {
      console.error("Error updating sport:", err);
      toast.error(`حدث خطأ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, buildPayload, onSportUpdated, sport?._id, getToken]);

  const handleIconSubmit = useCallback(async () => {
    if (!iconInputRef.current?.files?.[0]) {
      toast.error("يرجى اختيار أيقونة");
      return;
    }

    setIsIconSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("icon", iconInputRef.current.files[0]);

      const response = await fetch(`${API_BASE_URL}/sports/${sport._id}/icon`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result?.message || result?.error?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(message);
      }

      const updated = result?.data ?? result;
      onSportUpdated?.(updated);
      toast.success("تم تحديث الأيقونة بنجاح");

      if (iconInputRef.current) {
        iconInputRef.current.value = "";
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error updating icon:", err);
      toast.error(`فشل رفع الأيقونة: ${err.message}`);
    } finally {
      setIsIconSubmitting(false);
    }
  }, [getToken, sport?._id, onSportUpdated]);

  const title = useMemo(
    () => form?.name?.ar || form?.name?.en || "تعديل اللعبة",
    [form?.name?.ar, form?.name?.en]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose} dir="rtl">
      <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl shadow-2xl border-0 max-h-auto">
        {/* Enhanced Header */}
        <div className="bg-[#273346] p-6 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    تعديل: <span className="font-semibold">{title}</span>
                  </DialogTitle>
                  <p className="text-blue-100 mt-1">حدّث معلومات اللعبة والمراكز والأدوار</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{formCompletion}%</div>
                <p className="text-blue-200 text-sm">مكتمل</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mt-4">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${formCompletion}%` }}
              ></div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="mt-3 flex items-center gap-2 text-yellow-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">لديك تغييرات غير محفوظة</span>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
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

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-h-[60vh] overflow-y-auto">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">المعلومات الأساسية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    اسم اللعبة (عربي) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="اسم اللعبة (عربي) *"
                    value={form.name.ar}
                    onChange={(e) => setField("name.ar", e.target.value)}
                    className={validationErrors.nameAr ? "border-red-300" : ""}
                    maxLength={MAX_NAME_LENGTH}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{validationErrors.nameAr && <span className="text-red-500">{validationErrors.nameAr}</span>}</span>
                    <span>{form.name.ar.length}/{MAX_NAME_LENGTH}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Name (English) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Name (English) *"
                    value={form.name.en}
                    onChange={(e) => setField("name.en", e.target.value)}
                    className={validationErrors.nameEn ? "border-red-300" : ""}
                    maxLength={MAX_NAME_LENGTH}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{validationErrors.nameEn && <span className="text-red-500">{validationErrors.nameEn}</span>}</span>
                    <span>{form.name.en.length}/{MAX_NAME_LENGTH}</span>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  معلومات SEO
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Meta Title (عربي)"
                    value={form.seo.metaTitle.ar}
                    onChange={(e) => setField("seo.metaTitle.ar", e.target.value)}
                  />
                  <Input
                    placeholder="Meta Title (English)"
                    value={form.seo.metaTitle.en}
                    onChange={(e) => setField("seo.metaTitle.en", e.target.value)}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Meta Description (عربي)"
                    value={form.seo.metaDescription.ar}
                    onChange={(e) => setField("seo.metaDescription.ar", e.target.value)}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Meta Description (English)"
                    value={form.seo.metaDescription.en}
                    onChange={(e) => setField("seo.metaDescription.en", e.target.value)}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <div className="md:col-span-2 space-y-2">
                    <Input
                      placeholder="الكلمات المفتاحية (مفصولة بفواصل)"
                      value={form.seo.keywords}
                      onChange={(e) => setField("seo.keywords", e.target.value)}
                      className={validationErrors.keywords ? "border-red-300" : ""}
                      maxLength={MAX_KEYWORDS_LENGTH}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{validationErrors.keywords && <span className="text-red-500">{validationErrors.keywords}</span>}</span>
                      <span>{form.seo.keywords.length}/{MAX_KEYWORDS_LENGTH}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Positions */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">المواقع</h3>
                    <p className="text-sm text-gray-600">{form.positions.length} موقع</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addPosition} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={form.positions.length >= MAX_POSITIONS}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة موقع
                </Button>
              </div>

              {form.positions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد مواقع بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.positions.map((position, index) => (
                    <div
                      key={`pos-${index}`}
                      className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all"
                    >
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
                          onChange={(e) => updatePosition(index, "ar", e.target.value)}
                          className={validationErrors[`position_${index}`] ? "border-red-300" : ""}
                        />
                        <Input
                          placeholder="اسم الموقع (إنجليزي) *"
                          value={position.name.en}
                          onChange={(e) => updatePosition(index, "en", e.target.value)}
                          className={validationErrors[`position_${index}`] ? "border-red-300" : ""}
                        />
                      </div>
                      {validationErrors[`position_${index}`] && (
                        <p className="text-xs text-red-500 mt-2">{validationErrors[`position_${index}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Role Types */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">أنواع الأدوار</h3>
                    <p className="text-sm text-gray-600">{form.roleTypes.length} نوع</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addRole} 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={form.roleTypes.length >= MAX_ROLES}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة نوع
                </Button>
              </div>

              {form.roleTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد أنواع بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.roleTypes.map((role, index) => {
                    const jobOption = JOB_OPTIONS.find(opt => opt.value === role.jop);
                    return (
                      <div
                        key={`role-${index}`}
                        className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all"
                      >
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
                                <SelectValue placeholder="الفئة" />
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
                              placeholder="اسم النوع (عربي) *"
                              value={role.name.ar}
                              onChange={(e) => updateRole(index, "ar", e.target.value)}
                              className={validationErrors[`role_${index}`] ? "border-red-300" : ""}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name (English)</label>
                            <Input
                              placeholder="Type name (English) *"
                              value={role.name.en}
                              onChange={(e) => updateRole(index, "en", e.target.value)}
                              className={validationErrors[`role_${index}`] ? "border-red-300" : ""}
                            />
                          </div>
                        </div>
                        
                        {validationErrors[`role_${index}`] && (
                          <p className="text-xs text-red-500 mt-2">{validationErrors[`role_${index}`]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Icon & Metadata */}
          <div className="space-y-6">
            {/* Icon Upload */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">أيقونة اللعبة</h3>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer" onClick={() => document.getElementById('icon-upload-edit').click()}>
                  {iconPreview ? (
                    <div className="space-y-4">
                      <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-md">
                        <Image src={iconPreview} alt="أيقونة اللعبة" fill className="object-contain" />
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            iconInputRef.current?.click();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Upload className="w-4 h-4 ml-2" />
                          تغيير
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearIcon();
                          }}
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
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          iconInputRef.current?.click();
                        }}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        اختيار أيقونة
                      </Button>
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
                </div>

                <Button
                  type="button"
                  onClick={handleIconSubmit}
                  disabled={isIconSubmitting || !iconInputRef.current?.files?.[0]}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isIconSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 ml-2" />
                      تحديث الأيقونة
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• يُفضّل SVG/PNG بخلفية شفافة</p>
                  <p>• الحد الأقصى {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                  <p>• الأنواع المدعومة: JPEG, PNG, SVG, WebP</p>
                </div>
              </div>
            </section>

            {/* Sport Metadata */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Info className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">معلومات إضافية</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">المعرّف:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{sport?._id}</code>
                </div>
                
                {sport?.slug && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">الرابط:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{sport.slug}</code>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">أنشئ:</span>
                  <span>{sport?.createdAt ? new Date(sport.createdAt).toLocaleDateString("ar-SA") : "—"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">آخر تحديث:</span>
                  <span>{sport?.updatedAt ? new Date(sport.updatedAt).toLocaleDateString("ar-SA") : "—"}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
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
              onClick={onClose} 
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || Object.keys(validationErrors).length > 0} 
              className="bg-[#273346] hover:bg-[#334155] text-white min-w-[120px] mb-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}