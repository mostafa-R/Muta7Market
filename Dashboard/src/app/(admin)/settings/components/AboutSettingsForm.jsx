"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Globe,
  Languages,
  List,
  Loader2,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

// Production constants
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_LISTS = 10;
const MAX_ITEMS_PER_LIST = 20;

function emptyLang() {
  return { ar: "", en: "" };
}

function makeEmptyItem() {
  return { name: emptyLang(), description: emptyLang(), icon: "" };
}

function makeEmptyList() {
  return { title: emptyLang(), description: emptyLang(), items: [makeEmptyItem()] };
}


function MissionValuesEditor({ labelAr, labelEn, doc, updateDoc, makeEmptyList, makeEmptyItem }) {
  const langKey = 'ar';

  const findSectionIndex = () => (doc?.list || []).findIndex(s => s?.title?.ar === labelAr || s?.title?.en === labelEn);

  const ensureSection = () => {
    const idx = findSectionIndex();
    if (idx !== -1) return idx;
    const newSec = { title: { ar: labelAr, en: labelEn }, description: { ar: '', en: '' }, items: [makeEmptyItem()] };
    let newIndex = -1;
    updateDoc(d => {
      const list = d.list ? [...d.list] : [];
      list.push(newSec);
      newIndex = list.length - 1;
      return { ...d, list };
    });
    return newIndex;
  };

  const setSectionTitle = (idx, ar, en) => updateDoc(d => {
    const list = d.list ? [...d.list] : [];
    const sec = { ...(list[idx] || makeEmptyList()) };
    sec.title = { ar, en };
    list[idx] = sec;
    return { ...d, list };
  });

  const setSectionDescription = (idx, ar, en) => updateDoc(d => {
    const list = d.list ? [...d.list] : [];
    const sec = { ...(list[idx] || makeEmptyList()) };
    sec.description = { ar, en };
    list[idx] = sec;
    return { ...d, list };
  });

  const idx = findSectionIndex();
  const sec = (idx !== -1) ? doc.list[idx] : null;

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700">{labelAr} (AR)</label>
      <input className="w-full border p-2 rounded mb-2" value={sec?.title?.ar || ''} onChange={(e) => {
        const i = idx !== -1 ? idx : ensureSection();
        setSectionTitle(i, e.target.value, sec?.title?.en || '');
      }} />

      <label className="block text-sm font-medium text-gray-700">{labelEn} (EN)</label>
      <input className="w-full border p-2 rounded mb-2" value={sec?.title?.en || ''} onChange={(e) => {
        const i = idx !== -1 ? idx : ensureSection();
        setSectionTitle(i, sec?.title?.ar || '', e.target.value);
      }} />

      <label className="block text-sm font-medium text-gray-700">وصف {labelAr} (AR)</label>
      <textarea className="w-full border p-2 rounded mb-2" value={sec?.description?.ar || ''} onChange={(e) => {
        const i = idx !== -1 ? idx : ensureSection();
        setSectionDescription(i, e.target.value, sec?.description?.en || '');
      }} />

      <label className="block text-sm font-medium text-gray-700">وصف {labelEn} (EN)</label>
      <textarea className="w-full border p-2 rounded" value={sec?.description?.en || ''} onChange={(e) => {
        const i = idx !== -1 ? idx : ensureSection();
        setSectionDescription(i, sec?.description?.ar || '', e.target.value);
      }} />
    </div>
  );
}

// Enhanced validation with production-ready error messages
const validateAboutPayload = (payload) => {
  const errors = [];
  
  if (!payload) return ["البيانات مفقودة"];
  
  // Validate main title
  if (!payload.title?.ar?.trim()) errors.push("العنوان بالعربية مطلوب");
  if (!payload.title?.en?.trim()) errors.push("العنوان بالإنجليزية مطلوب");
  if (payload.title?.ar && payload.title.ar.length > MAX_TITLE_LENGTH) {
    errors.push(`العنوان العربي يجب أن يكون أقل من ${MAX_TITLE_LENGTH} حرف`);
  }
  if (payload.title?.en && payload.title.en.length > MAX_TITLE_LENGTH) {
    errors.push(`العنوان الإنجليزي يجب أن يكون أقل من ${MAX_TITLE_LENGTH} حرف`);
  }
  
  // Validate main description
  if (!payload.description?.ar?.trim()) errors.push("الوصف بالعربية مطلوب");
  if (!payload.description?.en?.trim()) errors.push("الوصف بالإنجليزية مطلوب");
  if (payload.description?.ar && payload.description.ar.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`الوصف العربي يجب أن يكون أقل من ${MAX_DESCRIPTION_LENGTH} حرف`);
  }
  if (payload.description?.en && payload.description.en.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`الوصف الإنجليزي يجب أن يكون أقل من ${MAX_DESCRIPTION_LENGTH} حرف`);
  }
  
  // Validate lists
  if (payload.list && Array.isArray(payload.list)) {
    if (payload.list.length > MAX_LISTS) {
      errors.push(`لا يمكن أن يكون هناك أكثر من ${MAX_LISTS} قوائم`);
    }
    
    payload.list.forEach((sec, sIdx) => {
      if (!sec.title?.ar?.trim()) errors.push(`عنوان القائمة ${sIdx + 1} بالعربية مطلوب`);
      if (!sec.title?.en?.trim()) errors.push(`عنوان القائمة ${sIdx + 1} بالإنجليزية مطلوب`);
      if (!sec.description?.ar?.trim()) errors.push(`وصف القائمة ${sIdx + 1} بالعربية مطلوب`);
      if (!sec.description?.en?.trim()) errors.push(`وصف القائمة ${sIdx + 1} بالإنجليزية مطلوب`);
      
      if (sec.items && Array.isArray(sec.items)) {
        if (sec.items.length > MAX_ITEMS_PER_LIST) {
          errors.push(`القائمة ${sIdx + 1} لا يمكن أن تحتوي على أكثر من ${MAX_ITEMS_PER_LIST} بند`);
        }
        
        sec.items.forEach((it, iIdx) => {
          if (!it.name?.ar?.trim()) errors.push(`اسم البند ${iIdx + 1} في القائمة ${sIdx + 1} بالعربية مطلوب`);
          if (!it.name?.en?.trim()) errors.push(`اسم البند ${iIdx + 1} في القائمة ${sIdx + 1} بالإنجليزية مطلوب`);
          if (!it.description?.ar?.trim()) errors.push(`وصف البند ${iIdx + 1} في القائمة ${sIdx + 1} بالعربية مطلوب`);
          if (!it.description?.en?.trim()) errors.push(`وصف البند ${iIdx + 1} في القائمة ${sIdx + 1} بالإنجليزية مطلوب`);
        });
      }
    });
  }
  
  return errors;
};

export default function AboutSettingsForm() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const listKeysRef = useRef([]);
  const itemKeysRef = useRef([]);
  const abortControllerRef = useRef(null);

  const makeKey = useCallback(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, []);

  useEffect(() => {
    const lists = doc?.list || [];

    if (listKeysRef.current.length < lists.length) {
      for (let i = listKeysRef.current.length; i < lists.length; i++) listKeysRef.current[i] = makeKey();
    } else if (listKeysRef.current.length > lists.length) {
      listKeysRef.current.length = lists.length;
    }

    for (let i = 0; i < lists.length; i++) {
      const items = (lists[i] && lists[i].items) || [];
      itemKeysRef.current[i] = itemKeysRef.current[i] || [];
      if (itemKeysRef.current[i].length < items.length) {
        for (let k = itemKeysRef.current[i].length; k < items.length; k++) itemKeysRef.current[i].push(makeKey());
      } else if (itemKeysRef.current[i].length > items.length) {
        itemKeysRef.current[i].length = items.length;
      }
    }
  }, [doc]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
  const res = await fetch(`${API_BASE_URL}/about?page=1&limit=1`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        let item = null;
        if (payload && payload.data) {
          if (Array.isArray(payload.data?.data)) item = payload.data.data[0] || null;
          else if (Array.isArray(payload.data)) item = payload.data[0] || null;
          else item = payload.data || null;
        }

        if (!item) {
          item = {
            title: emptyLang(),
            description: emptyLang(),
            list: [makeEmptyList()],
          };
        } else {
          item.list = item.list && Array.isArray(item.list) ? item.list : [];
        }

        setDoc(item);
        setRawJson(JSON.stringify(item, null, 2));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Failed to load about document");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const updateDoc = useCallback((updater) => {
    setDoc((prev) => {
      const next = updater(typeof prev === "object" && prev ? { ...prev } : {});
      setRawJson(JSON.stringify(next, null, 2));
      setHasUnsavedChanges(true);
      
      // Real-time validation
      const errors = validateAboutPayload(next);
      setValidationErrors(errors);
      
      return next;
    });
  }, []);


  const addList = () => updateDoc((d) => ({ ...d, list: [...(d.list || []), makeEmptyList()] }));
 
  const addListWithKey = useCallback(() => {
    if ((doc?.list || []).length >= MAX_LISTS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_LISTS} قوائم`);
      return;
    }
    
    updateDoc((d) => ({ ...d, list: [...(d.list || []), makeEmptyList()] }));
    listKeysRef.current.push(makeKey());
    itemKeysRef.current.push([makeKey()]);
  }, [doc?.list, updateDoc, makeKey]);
  const removeList = (idx) => updateDoc((d) => ({ ...d, list: (d.list || []).filter((_, i) => i !== idx) }));

  const updateListField = (idx, field, lang, value) => {
    updateDoc((d) => {
      const list = d.list ? [...d.list] : [];
      const l = { ...(list[idx] || makeEmptyList()) };
      l[field] = { ...(l[field] || emptyLang()), [lang]: value };
      list[idx] = l;
      return { ...d, list };
    });
  };

 
  const addItem = (listIdx) => updateDoc((d) => {
    const list = d.list ? [...d.list] : [];
    const l = { ...(list[listIdx] || makeEmptyList()) };
    l.items = l.items ? [...l.items, makeEmptyItem()] : [makeEmptyItem()];
    list[listIdx] = l;
    return { ...d, list };
  });

  const addItemWithKey = useCallback((listIdx) => {
    const currentItems = doc?.list?.[listIdx]?.items || [];
    if (currentItems.length >= MAX_ITEMS_PER_LIST) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_ITEMS_PER_LIST} بند في القائمة الواحدة`);
      return;
    }
    
    updateDoc((d) => {
      const list = d.list ? [...d.list] : [];
      const l = { ...(list[listIdx] || makeEmptyList()) };
      l.items = l.items ? [...l.items, makeEmptyItem()] : [makeEmptyItem()];
      list[listIdx] = l;
      return { ...d, list };
    });
    itemKeysRef.current[listIdx] = itemKeysRef.current[listIdx] || [];
    itemKeysRef.current[listIdx].push(makeKey());
  }, [doc?.list, updateDoc, makeKey]);

  const removeItem = (listIdx, itemIdx) => updateDoc((d) => {
    const list = d.list ? [...d.list] : [];
    const l = { ...(list[listIdx] || makeEmptyList()) };
    l.items = (l.items || []).filter((_, i) => i !== itemIdx);
    list[listIdx] = l;
    return { ...d, list };
  });

  const updateItemField = (listIdx, itemIdx, field, lang, value) => updateDoc((d) => {
    const list = d.list ? [...d.list] : [];
    const l = { ...(list[listIdx] || makeEmptyList()) };
    const items = l.items ? [...l.items] : [];
    const it = { ...(items[itemIdx] || makeEmptyItem()) };
    it[field] = { ...(it[field] || emptyLang()), [lang]: value };
    items[itemIdx] = it;
    l.items = items;
    list[listIdx] = l;
    return { ...d, list };
  });

  const handleSave = async (e) => {
    e.preventDefault();

    let payload;
    try {
      payload = rawJson ? JSON.parse(rawJson) : doc;
    } catch (err) {
      toast.error("JSON غير صالح: تحقق من التركيب");
      return;
    }

    const errors = validateAboutPayload(payload);
    if (errors.length) {
      toast.error("هناك حقول مطلوبة ناقصة، أكملها قبل الحفظ:\n" + errors.slice(0,5).join("; "));
      console.warn("Validation errors:", errors);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');

      if (doc && doc._id) {
  const res = await fetch(`${API_BASE_URL}/about/${doc._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const msg = errBody?.message || (errBody && JSON.stringify(errBody)) || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const result = await res.json();
        if (result.success) {
          setDoc(result.data || result);
          setRawJson(JSON.stringify(result.data || result, null, 2));
          toast.success("تم حفظ بيانات صفحة من نحن بنجاح");
          setSuccessMessage("تم حفظ بيانات صفحة من نحن بنجاح");
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const bc = new BroadcastChannel('site-settings');
              bc.postMessage({ type: 'about-updated', timestamp: Date.now() });
              bc.close();
            } else if (typeof window !== 'undefined') {
              localStorage.setItem('site-settings-about-updated', Date.now().toString());
            }
          } catch (e) {
           
          }
        } else throw new Error(result.message || "فشل الحفظ");
      } else {
  const res = await fetch(`${API_BASE_URL}/about`, {
          method: "POST",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const msg = errBody?.message || (errBody && JSON.stringify(errBody)) || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const result = await res.json();
        if (result.success) {
          setDoc(result.data || result);
          setRawJson(JSON.stringify(result.data || result, null, 2));
          toast.success("تم إنشاء وثيقة من نحن وحفظها");
          setSuccessMessage("تم إنشاء وثيقة من نحن وحفظها");
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const bc = new BroadcastChannel('site-settings');
              bc.postMessage({ type: 'about-updated', timestamp: Date.now() });
              bc.close();
            } else if (typeof window !== 'undefined') {
              localStorage.setItem('site-settings-about-updated', Date.now().toString());
            }
          } catch (e) {}
        } else throw new Error(result.message || "فشل الإنشاء");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "خطأ أثناء حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-7 h-7" />
              إدارة صفحة من نحن
            </h1>
            <p className="text-blue-100">إدارة محتوى صفحة من نحن والمعلومات التفصيلية للموقع</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-indigo-400">
                <Globe className="w-5 h-5" />
                <span className="text-xl font-bold">متعدد اللغات</span>
              </div>
              <p className="text-blue-200">عربي + إنجليزي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status Bar */}
      {validationErrors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200">
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">يرجى إكمال الحقول المطلوبة</h3>
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

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Save className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                لديك تغييرات غير محفوظة. تذكر حفظ التغييرات.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">جاري تحميل البيانات</h3>
              <p className="text-gray-500">يرجى الانتظار...</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Content Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Languages className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">المحتوى الأساسي</h3>
              </div>
              <p className="text-gray-600 text-sm">عنوان ووصف صفحة من نحن الرئيسية</p>
            </div>
            
            <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>العنوان (عربي)</span>
                    <span className="text-red-500">*</span>
                  </label>
              <Input
                value={(doc && doc.title && doc.title.ar) || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_TITLE_LENGTH) {
                          updateDoc(d => ({ ...d, title: { ...(d.title||{}), ar: value } }));
                        }
                      }}
                      placeholder="أدخل العنوان بالعربية"
                      className="focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      maxLength={MAX_TITLE_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {MAX_TITLE_LENGTH - (doc?.title?.ar?.length || 0)} حرف متبقي
                    </p>
            </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>العنوان (إنجليزي)</span>
                    <span className="text-red-500">*</span>
                  </label>
              <Input
                value={(doc && doc.title && doc.title.en) || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_TITLE_LENGTH) {
                          updateDoc(d => ({ ...d, title: { ...(d.title||{}), en: value } }));
                        }
                      }}
                      placeholder="Enter title in English"
                      className="focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      maxLength={MAX_TITLE_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {MAX_TITLE_LENGTH - (doc?.title?.en?.length || 0)} characters remaining
                    </p>
            </div>
          </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>الوصف (عربي)</span>
                    <span className="text-red-500">*</span>
                  </label>
            <textarea
                    className="w-full border border-gray-200 p-3 rounded-lg min-h-[120px] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              value={(doc && doc.description && doc.description.ar) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, description: { ...(d.description||{}), ar: e.target.value } }))}
                    placeholder="أدخل وصف مفصل بالعربية"
            />
          </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>الوصف (إنجليزي)</span>
                    <span className="text-red-500">*</span>
                  </label>
            <textarea
                    className="w-full border border-gray-200 p-3 rounded-lg min-h-[120px] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              value={(doc && doc.description && doc.description.en) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, description: { ...(d.description||{}), en: e.target.value } }))}
                    placeholder="Enter detailed description in English"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Lists Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <List className="w-5 h-5 text-green-600" />
          </div>
          <div>
                    <h3 className="text-lg font-semibold text-gray-900">القوائم التفصيلية</h3>
                    <p className="text-gray-600 text-sm">مميزات، خدمات، فرق العمل وغيرها</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addListWithKey} 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قائمة جديدة
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {(doc?.list || []).map((lst, lIdx) => (
                <div key={listKeysRef.current[lIdx] || lIdx} className="border border-gray-200 rounded-xl bg-gray-50">
                  <div className="p-4 bg-white rounded-t-xl border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{lIdx + 1}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">القائمة رقم {lIdx + 1}</h4>
                      </div>
                    <div className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={() => addItemWithKey(lIdx)} 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                        إضافة بند
                      </Button>
                        <Button 
                          type="button" 
                          onClick={() => removeList(lIdx)} 
                          variant="destructive" 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        حذف القائمة
                      </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <span>عنوان القائمة (عربي)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          value={lst.title?.ar || ""} 
                          onChange={(e) => updateListField(lIdx, 'title', 'ar', e.target.value)}
                          placeholder="أدخل عنوان القائمة بالعربية"
                          className="focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <span>عنوان القائمة (إنجليزي)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          value={lst.title?.en || ""} 
                          onChange={(e) => updateListField(lIdx, 'title', 'en', e.target.value)}
                          placeholder="Enter list title in English"
                          className="focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                  </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">وصف القائمة (عربي)</label>
                        <textarea 
                          className="w-full border border-gray-200 p-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                          value={lst.description?.ar || ""} 
                          onChange={(e) => updateListField(lIdx, 'description', 'ar', e.target.value)}
                          placeholder="وصف مختصر للقائمة بالعربية"
                          rows="3"
                        />
                  </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">وصف القائمة (إنجليزي)</label>
                        <textarea 
                          className="w-full border border-gray-200 p-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
                          value={lst.description?.en || ""} 
                          onChange={(e) => updateListField(lIdx, 'description', 'en', e.target.value)}
                          placeholder="Brief description of the list in English"
                          rows="3"
                        />
                      </div>
                  </div>

                    {/* Items Section */}
                  <div className="space-y-3">
                      <div className="flex items-center justify-between border-t pt-4">
                        <h5 className="text-md font-semibold text-gray-800">بنود القائمة</h5>
                        <span className="text-sm text-gray-500">{(lst.items || []).length} بند</span>
                      </div>
                      
              {(lst.items || []).map((it, itIdx) => (
                        <div key={itemKeysRef.current[lIdx]?.[itIdx] || itIdx} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">{itIdx + 1}</span>
                              </div>
                              <span className="font-medium text-gray-800">بند رقم {itIdx + 1}</span>
                            </div>
                            <Button 
                              type="button" 
                              onClick={() => removeItem(lIdx, itIdx)} 
                              variant="destructive" 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                          </Button>
                        </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">الاسم (عربي)</label>
                                <Input 
                                  placeholder="أدخل اسم البند بالعربية" 
                                  value={it.name?.ar || ""} 
                                  onChange={(e) => updateItemField(lIdx, itIdx, 'name', 'ar', e.target.value)}
                                  className="focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">الاسم (إنجليزي)</label>
                                <Input 
                                  placeholder="Enter item name in English" 
                                  value={it.name?.en || ""} 
                                  onChange={(e) => updateItemField(lIdx, itIdx, 'name', 'en', e.target.value)}
                                  className="focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                />
                              </div>
                        </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">الوصف (عربي)</label>
                                <textarea 
                                  placeholder="وصف البند بالعربية" 
                                  className="w-full border border-gray-200 p-2 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200" 
                                  value={it.description?.ar || ""} 
                                  onChange={(e) => updateItemField(lIdx, itIdx, 'description', 'ar', e.target.value)}
                                  rows="2"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">الوصف (إنجليزي)</label>
                                <textarea 
                                  placeholder="Item description in English" 
                                  className="w-full border border-gray-200 p-2 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200" 
                                  value={it.description?.en || ""} 
                                  onChange={(e) => updateItemField(lIdx, itIdx, 'description', 'en', e.target.value)}
                                  rows="2"
                                />
                              </div>
                        </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">الأيقونة</label>
                              <Input 
                                placeholder="رمز أيقونة SVG أو رابط الصورة" 
                                value={it.icon || ""} 
                                onChange={(e) => updateDoc(d => {
                            const list = d.list ? [...d.list] : [];
                            const l = { ...(list[lIdx] || makeEmptyList()) };
                            const items = l.items ? [...l.items] : [];
                            const item = { ...(items[itIdx] || makeEmptyItem()) };
                            item.icon = e.target.value;
                            items[itIdx] = item;
                            l.items = items;
                            list[lIdx] = l;
                            return { ...d, list };
                                })}
                                className="focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                              />
                            </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">حفظ التغييرات</h3>
                  {validationErrors.length === 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">جاهز للحفظ</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{validationErrors.length} خطأ</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {hasUnsavedChanges 
                    ? "لديك تغييرات غير محفوظة" 
                    : "جميع التغييرات محفوظة"}
                </p>
          </div>
          
              <Button 
                type="submit" 
                disabled={saving || validationErrors.length > 0} 
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
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200">
          <div className="p-4 bg-green-50 rounded-t-xl border-b border-green-200">
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

      {/* Error Message */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">حدث خطأ</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}