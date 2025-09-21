"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  List,
  Loader2,
  Plus,
  Save,
  Scale,
  Trash2,
  Users,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_SECTIONS = 20;
const MAX_ITEMS_PER_SECTION = 50;

function emptyLang() {
  return { ar: "", en: "" };
}

function makeEmptyListItem() {
  return { title: emptyLang(), description: emptyLang(), icon: "" };
}

function makeEmptySection() {
  return { title: emptyLang(), description: emptyLang(), list: [makeEmptyListItem()] };
}

function sanitizeInput(input) {
  return typeof input === 'string' ? input.trim() : '';
}

function validateTermsPayload(payload) {
  const errors = [];
  
  if (!payload) return ["البيانات مفقودة"];
  
  if (!payload.headTitle) {
    errors.push("عنوان الرأس مطلوب");
  } else {
    if (!payload.headTitle.ar || !sanitizeInput(payload.headTitle.ar)) {
      errors.push("عنوان الرأس بالعربية مطلوب");
    }
    if (!payload.headTitle.en || !sanitizeInput(payload.headTitle.en)) {
      errors.push("عنوان الرأس بالإنجليزية مطلوب");
    }
    if (payload.headTitle.ar && payload.headTitle.ar.length > MAX_TITLE_LENGTH) {
      errors.push(`عنوان الرأس بالعربية يجب أن يكون أقل من ${MAX_TITLE_LENGTH} حرف`);
    }
    if (payload.headTitle.en && payload.headTitle.en.length > MAX_TITLE_LENGTH) {
      errors.push(`عنوان الرأس بالإنجليزية يجب أن يكون أقل من ${MAX_TITLE_LENGTH} حرف`);
    }
  }
  
  if (!payload.headDescription) {
    errors.push("وصف الرأس مطلوب");
  } else {
    if (!payload.headDescription.ar || !sanitizeInput(payload.headDescription.ar)) {
      errors.push("وصف الرأس بالعربية مطلوب");
    }
    if (!payload.headDescription.en || !sanitizeInput(payload.headDescription.en)) {
      errors.push("وصف الرأس بالإنجليزية مطلوب");
    }
    if (payload.headDescription.ar && payload.headDescription.ar.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`وصف الرأس بالعربية يجب أن يكون أقل من ${MAX_DESCRIPTION_LENGTH} حرف`);
    }
    if (payload.headDescription.en && payload.headDescription.en.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`وصف الرأس بالإنجليزية يجب أن يكون أقل من ${MAX_DESCRIPTION_LENGTH} حرف`);
    }
  }
  
  if (payload.terms && Array.isArray(payload.terms)) {
    if (payload.terms.length > MAX_SECTIONS) {
      errors.push(`عدد الأقسام يجب أن يكون أقل من ${MAX_SECTIONS}`);
    }
    
    payload.terms.forEach((sec, sIdx) => {
      if (!sec.title || !sanitizeInput(sec.title.ar) || !sanitizeInput(sec.title.en)) {
        errors.push(`القسم ${sIdx + 1}: العنوان مطلوب بكلا اللغتين`);
      }
      if (!sec.description || !sanitizeInput(sec.description.ar) || !sanitizeInput(sec.description.en)) {
        errors.push(`القسم ${sIdx + 1}: الوصف مطلوب بكلا اللغتين`);
      }
      
      if (sec.list && Array.isArray(sec.list)) {
        if (sec.list.length > MAX_ITEMS_PER_SECTION) {
          errors.push(`القسم ${sIdx + 1}: عدد البنود يجب أن يكون أقل من ${MAX_ITEMS_PER_SECTION}`);
        }
        
        sec.list.forEach((it, iIdx) => {
          if (!it.title || !sanitizeInput(it.title.ar) || !sanitizeInput(it.title.en)) {
            errors.push(`القسم ${sIdx + 1}, البند ${iIdx + 1}: العنوان مطلوب بكلا اللغتين`);
          }
          if (!it.description || !sanitizeInput(it.description.ar) || !sanitizeInput(it.description.en)) {
            errors.push(`القسم ${sIdx + 1}, البند ${iIdx + 1}: الوصف مطلوب بكلا اللغتين`);
          }
        });
      }
    });
  }
  
  return errors;
}

export default function TermsSettingsForm() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const contentAnalysis = useMemo(() => {
    if (!doc) return { totalSections: 0, totalItems: 0, completionPercentage: 0 };
    
    const totalSections = doc.terms ? doc.terms.length : 0;
    const totalItems = doc.terms ? doc.terms.reduce((sum, section) => sum + (section.list ? section.list.length : 0), 0) : 0;
    
    let completed = 0;
    let total = 4; 
    
    if (doc.headTitle?.ar) completed++;
    if (doc.headTitle?.en) completed++;
    if (doc.headDescription?.ar) completed++;
    if (doc.headDescription?.en) completed++;
    
    if (doc.terms) {
      doc.terms.forEach(section => {
        total += 4; 
        if (section.title?.ar) completed++;
        if (section.title?.en) completed++;
        if (section.description?.ar) completed++;
        if (section.description?.en) completed++;
        
        if (section.list) {
          section.list.forEach(() => {
            total += 4; 
          });
          section.list.forEach(item => {
            if (item.title?.ar) completed++;
            if (item.title?.en) completed++;
            if (item.description?.ar) completed++;
            if (item.description?.en) completed++;
          });
        }
      });
    }
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { totalSections, totalItems, completionPercentage };
  }, [doc]);

  useEffect(() => {
    const controller = new AbortController();

    const loadTerms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${API_BASE_URL}/terms?page=1&limit=1`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`خطأ في الخادم (${res.status})`);
        }
        
        const payload = await res.json();

        let item = null;
        if (payload && payload.data) {
          if (Array.isArray(payload.data?.data)) {
            item = payload.data.data[0] || null;
          } else if (Array.isArray(payload.data)) {
            item = payload.data[0] || null;
          } else {
            item = payload.data || null;
          }
        }

        if (!item) {
          item = {
            headTitle: emptyLang(),
            headDescription: emptyLang(),
            terms: [makeEmptySection()],
          };
        } else {
          item.terms = item.terms && Array.isArray(item.terms) ? item.terms : [];
        }

        setDoc(item);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "فشل تحميل وثيقة الشروط والأحكام");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTerms();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (doc) {
      const errors = validateTermsPayload(doc);
      setValidationErrors(errors);
    }
  }, [doc]);

  const updateDoc = useCallback((updater) => {
    setDoc((prev) => {
      const next = updater(typeof prev === "object" && prev ? { ...prev } : {});
      setHasChanges(true);
      setError(null);
      return next;
    });
  }, []);

  const addSection = useCallback(() => {
    if (doc?.terms && doc.terms.length >= MAX_SECTIONS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_SECTIONS} قسم`);
      return;
    }
    updateDoc((d) => ({ ...d, terms: [...(d.terms || []), makeEmptySection()] }));
    toast.success("تم إضافة قسم جديد");
  }, [doc, updateDoc]);

  const removeSection = useCallback((idx) => {
    updateDoc((d) => ({ ...d, terms: (d.terms || []).filter((_, i) => i !== idx) }));
    toast.success("تم حذف القسم");
  }, [updateDoc]);

  const updateSectionField = useCallback((idx, field, lang, value) => {
    const sanitizedValue = sanitizeInput(value);
    updateDoc((d) => {
      const terms = d.terms ? [...d.terms] : [];
      const term = { ...(terms[idx] || makeEmptySection()) };
      term[field] = { ...(term[field] || emptyLang()), [lang]: sanitizedValue };
      terms[idx] = term;
      return { ...d, terms };
    });
  }, [updateDoc]);

  const addListItem = useCallback((sectionIdx) => {
    const section = doc?.terms?.[sectionIdx];
    if (section?.list && section.list.length >= MAX_ITEMS_PER_SECTION) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_ITEMS_PER_SECTION} بند في القسم الواحد`);
      return;
    }
    
    updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    term.list = term.list ? [...term.list, makeEmptyListItem()] : [makeEmptyListItem()];
    terms[sectionIdx] = term;
    return { ...d, terms };
  });
    toast.success("تم إضافة بند جديد");
  }, [doc, updateDoc]);

  const removeListItem = useCallback((sectionIdx, itemIdx) => {
    updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    term.list = (term.list || []).filter((_, i) => i !== itemIdx);
    terms[sectionIdx] = term;
    return { ...d, terms };
  });
    toast.success("تم حذف البند");
  }, [updateDoc]);

  const updateListItemField = useCallback((sectionIdx, itemIdx, field, lang, value) => {
    const sanitizedValue = sanitizeInput(value);
    updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    const list = term.list ? [...term.list] : [];
    const item = { ...(list[itemIdx] || makeEmptyListItem()) };
      item[field] = { ...(item[field] || emptyLang()), [lang]: sanitizedValue };
    list[itemIdx] = item;
    term.list = list;
    terms[sectionIdx] = term;
    return { ...d, terms };
  });
  }, [updateDoc]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();

    if (!doc) {
      toast.error("لا توجد بيانات للحفظ");
      return;
    }

    const errors = validateTermsPayload(doc);
    if (errors.length) {
      toast.error(`هناك ${errors.length} خطأ يجب تصحيحه قبل الحفظ`);
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');

      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }

      let res;
      if (doc && doc._id) {
        res = await fetch(`${API_BASE_URL}/terms/${doc._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/terms`, {
          method: "POST",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc),
        });
      }

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
        const msg = errBody?.message || `خطأ في الخادم (${res.status})`;
          throw new Error(msg);
        }
      
        const result = await res.json();
        if (result.success) {
          setDoc(result.data || result);
        setHasChanges(false);
        setSuccessMessage(doc._id ? "تم حفظ الشروط والأحكام بنجاح" : "تم إنشاء وثيقة الشروط والأحكام وحفظها");
        toast.success(doc._id ? "تم حفظ الشروط والأحكام بنجاح" : "تم إنشاء وثيقة الشروط والأحكام وحفظها");
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(result.message || "فشل الحفظ");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "خطأ أثناء حفظ البيانات";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [doc]);

  const isFormValid = validationErrors.length === 0;

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Loading Header */}
        <div className="bg-[#1e293b] rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Scale className="w-7 h-7" />
            <div>
              <h1 className="text-2xl font-bold">الشروط والأحكام</h1>
              <p className="text-blue-100">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Scale className="w-7 h-7" />
              إدارة الشروط والأحكام
            </h1>
            <p className="text-blue-100">إدارة وتحديث شروط وأحكام استخدام المنصة</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="w-5 h-5" />
                <span className="text-xl font-bold">{contentAnalysis.completionPercentage}%</span>
              </div>
              <p className="text-blue-200">اكتمال المحتوى</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <List className="w-5 h-5" />
                <span className="text-xl font-bold">{contentAnalysis.totalSections}</span>
              </div>
              <p className="text-blue-200">أقسام</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-purple-400">
                <FileText className="w-5 h-5" />
                <span className="text-xl font-bold">{contentAnalysis.totalItems}</span>
              </div>
              <p className="text-blue-200">بنود</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">حدث خطأ</h3>
                <p className="text-red-700 text-sm mb-2">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  إخفاء الرسالة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200">
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">تم الحفظ بنجاح</h3>
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessMessage(null)} 
                className="text-green-600 hover:text-green-800 font-medium px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {hasChanges && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Save className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                لديك تغييرات غير محفوظة في الشروط والأحكام. تذكر حفظ التغييرات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Summary */}
      {validationErrors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200">
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">يرجى تصحيح الأخطاء التالية</h3>
                <div className="space-y-1">
                  {validationErrors.slice(0, 5).map((error, idx) => (
                    <p key={idx} className="text-orange-700 text-sm">• {error}</p>
                  ))}
                  {validationErrors.length > 5 && (
                    <p className="text-orange-600 text-sm font-medium">
                      و {validationErrors.length - 5} أخطاء أخرى...
                    </p>
                  )}
                </div>
              </div>
              <div className="text-orange-600 font-bold text-lg">
                {validationErrors.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">تحليل المحتوى</h3>
          </div>
          <p className="text-gray-600 text-sm">نظرة عامة على حالة المحتوى والاكتمال</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{contentAnalysis.totalSections}</div>
              <p className="text-sm text-blue-700">أقسام الشروط</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{contentAnalysis.totalItems}</div>
              <p className="text-sm text-green-700">إجمالي البنود</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{contentAnalysis.completionPercentage}%</div>
              <p className="text-sm text-purple-700">اكتمال المحتوى</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">تقدم إكمال المحتوى</span>
              <span className="text-sm text-gray-500">{contentAnalysis.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${contentAnalysis.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

        <form onSubmit={handleSave} className="space-y-6">
        {/* Header Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">معلومات الرأس</h3>
            </div>
            <p className="text-gray-600 text-sm">العنوان والوصف الرئيسي لصفحة الشروط والأحكام</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Head Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  عنوان الرأس (بالعربية)
                  <span className="text-red-500">*</span>
                </label>
              <Input
                  value={(doc?.headTitle?.ar) || ""}
                  onChange={(e) => updateDoc(d => ({ 
                    ...d, 
                    headTitle: { ...(d.headTitle || {}), ar: e.target.value } 
                  }))}
                  placeholder="أدخل عنوان الصفحة بالعربية"
                  maxLength={MAX_TITLE_LENGTH}
                  className="focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  {(doc?.headTitle?.ar || "").length}/{MAX_TITLE_LENGTH} حرف
                </p>
            </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  عنوان الرأس (بالإنجليزية)
                  <span className="text-red-500">*</span>
                </label>
              <Input
                  value={(doc?.headTitle?.en) || ""}
                  onChange={(e) => updateDoc(d => ({ 
                    ...d, 
                    headTitle: { ...(d.headTitle || {}), en: e.target.value } 
                  }))}
                  placeholder="Enter page title in English"
                  maxLength={MAX_TITLE_LENGTH}
                  className="focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  {(doc?.headTitle?.en || "").length}/{MAX_TITLE_LENGTH} characters
                </p>
            </div>
          </div>

            {/* Head Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  الوصف الرئيسي (بالعربية)
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={(doc?.headDescription?.ar) || ""}
                  onChange={(e) => updateDoc(d => ({ 
                    ...d, 
                    headDescription: { ...(d.headDescription || {}), ar: e.target.value } 
                  }))}
                  placeholder="أدخل وصف الصفحة بالعربية"
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  {(doc?.headDescription?.ar || "").length}/{MAX_DESCRIPTION_LENGTH} حرف
                </p>
          </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  الوصف الرئيسي (بالإنجليزية)
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={(doc?.headDescription?.en) || ""}
                  onChange={(e) => updateDoc(d => ({ 
                    ...d, 
                    headDescription: { ...(d.headDescription || {}), en: e.target.value } 
                  }))}
                  placeholder="Enter page description in English"
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  {(doc?.headDescription?.en || "").length}/{MAX_DESCRIPTION_LENGTH} characters
                </p>
              </div>
            </div>
          </div>
          </div>

        {/* Terms Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
          <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <List className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">أقسام الشروط والأحكام</h3>
                </div>
                <p className="text-gray-600 text-sm">إدارة أقسام الشروط والبنود المختلفة</p>
              </div>
              <Button
                type="button"
                onClick={addSection}
                disabled={doc?.terms && doc.terms.length >= MAX_SECTIONS}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة قسم
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {doc?.terms && doc.terms.length > 0 ? (
              <div className="space-y-6">
                {doc.terms.map((section, sIdx) => (
                  <div key={sIdx} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    {/* Section Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <List className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">القسم #{sIdx + 1}</h4>
                          <p className="text-sm text-gray-600">
                            {section.list ? section.list.length : 0} بند
                          </p>
                        </div>
                      </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={() => addListItem(sIdx)} 
                          disabled={section.list && section.list.length >= MAX_ITEMS_PER_SECTION}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm"
          >
                          <Plus className="w-4 h-4" />
            إضافة بند
          </Button>
          <Button 
            type="button" 
            onClick={() => removeSection(sIdx)} 
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm"
          >
                          <Trash2 className="w-4 h-4" />
            حذف القسم
          </Button>
        </div>
      </div>

                    {/* Section Fields */}
                    <div className="space-y-4">
                      {/* Section Titles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            عنوان القسم (بالعربية) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={section.title?.ar || ""}
                            onChange={(e) => updateSectionField(sIdx, 'title', 'ar', e.target.value)}
                            placeholder="أدخل عنوان القسم بالعربية"
                            className="focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                    </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            عنوان القسم (بالإنجليزية) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={section.title?.en || ""}
                            onChange={(e) => updateSectionField(sIdx, 'title', 'en', e.target.value)}
                            placeholder="Enter section title in English"
                            className="focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                    </div>
                  </div>

                      {/* Section Descriptions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            وصف القسم (بالعربية) <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={section.description?.ar || ""}
                            onChange={(e) => updateSectionField(sIdx, 'description', 'ar', e.target.value)}
                            placeholder="أدخل وصف القسم بالعربية"
                            rows={3}
                            className="focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            وصف القسم (بالإنجليزية) <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={section.description?.en || ""}
                            onChange={(e) => updateSectionField(sIdx, 'description', 'en', e.target.value)}
                            placeholder="Enter section description in English"
                            rows={3}
                            className="focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                  </div>

                      {/* List Items */}
                      {section.list && section.list.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-md font-semibold text-gray-800 mb-4">بنود القسم</h5>
                          <div className="space-y-4">
                            {section.list.map((item, iIdx) => (
                              <div key={iIdx} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="font-medium text-gray-800 flex items-center gap-2">
                                    <div className="p-1 bg-purple-100 rounded">
                                      <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                                    البند #{iIdx + 1}
                                  </span>
        <Button 
          type="button" 
          onClick={() => removeListItem(sIdx, iIdx)} 
                                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-xs px-3 py-1"
        >
                                    <Trash2 className="w-3 h-3" />
          حذف البند
        </Button>
      </div>

                                <div className="space-y-4">
                                  {/* Item Titles */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                      placeholder="عنوان البند (بالعربية) *"
                                      value={item.title?.ar || ""}
                                      onChange={(e) => updateListItemField(sIdx, iIdx, 'title', 'ar', e.target.value)}
                                      className="focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                    <Input
                                      placeholder="عنوان البند (بالإنجليزية) *"
                                      value={item.title?.en || ""}
                                      onChange={(e) => updateListItemField(sIdx, iIdx, 'title', 'en', e.target.value)}
                                      className="focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                        </div>

                                  {/* Item Descriptions */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Textarea
                                      placeholder="وصف البند (بالعربية) *"
                                      value={item.description?.ar || ""}
                                      onChange={(e) => updateListItemField(sIdx, iIdx, 'description', 'ar', e.target.value)}
                                      rows={3}
                                      className="focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                    <Textarea
                                      placeholder="وصف البند (بالإنجليزية) *"
                                      value={item.description?.en || ""}
                                      onChange={(e) => updateListItemField(sIdx, iIdx, 'description', 'en', e.target.value)}
                                      rows={3}
                                      className="focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                        </div>

                                  {/* Item Icon */}
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      رمز الأيقونة (اختياري) 
                                    </label>
                                    <p className="text-xs text-gray-500">كود svg فقط </p>
                                    <Input
                                      placeholder="رمز أيقونة SVG أو رابط الصورة"
                                      value={item.icon || ""}
                                      onChange={(e) => updateDoc(d => {
                            const terms = d.terms ? [...d.terms] : [];
                            const term = { ...(terms[sIdx] || makeEmptySection()) };
                            const list = term.list ? [...term.list] : [];
                            const it = { ...(list[iIdx] || makeEmptyListItem()) };
                            it.icon = e.target.value;
                            list[iIdx] = it;
                            term.list = list;
                            terms[sIdx] = term;
                            return { ...d, terms };
                                      })}
                                      className="focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                  </div>
                        </div>
                      </div>
                    ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <List className="w-8 h-8 text-gray-400" />
          </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أقسام بعد</h3>
                <p className="text-gray-500 mb-4">ابدأ بإضافة أول قسم للشروط والأحكام</p>
                <Button
                  type="button"
                  onClick={addSection}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  إضافة أول قسم
            </Button>
          </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">حفظ التغييرات</h3>
                {!hasChanges ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">محفوظ</span>
                  </div>
                ) : !isFormValid ? (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">يحتاج تصحيح</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">جاهز للحفظ</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {!hasChanges 
                  ? "جميع التغييرات محفوظة" 
                  : !isFormValid 
                    ? `يرجى تصحيح ${validationErrors.length} خطأ قبل الحفظ`
                    : "لديك تغييرات غير محفوظة في الشروط والأحكام"}
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={saving || !hasChanges || !isFormValid}
              className="bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-3 text-lg flex items-center gap-3 transition-all duration-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
