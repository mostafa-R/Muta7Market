"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

function emptyLang() {
  return { ar: "", en: "" };
}

function makeEmptyListItem() {
  return { title: emptyLang(), description: emptyLang(), icon: "" };
}

function makeEmptySection() {
  return { title: emptyLang(), description: emptyLang(), list: [makeEmptyListItem()] };
}

function validateTermsPayload(payload) {
  const errors = [];
  if (!payload) return ["payload missing"];
  if (!payload.headTitle || !payload.headTitle.ar || !payload.headTitle.en) errors.push("headTitle.ar or headTitle.en required");
  if (!payload.headDescription || !payload.headDescription.ar || !payload.headDescription.en) errors.push("headDescription.ar or headDescription.en required");
  if (payload.terms && Array.isArray(payload.terms)) {
    payload.terms.forEach((sec, sIdx) => {
      if (!sec.title || !sec.title.ar || !sec.title.en) errors.push(`terms[${sIdx}].title missing`);
      if (!sec.description || !sec.description.ar || !sec.description.en) errors.push(`terms[${sIdx}].description missing`);
      if (sec.list && Array.isArray(sec.list)) {
        sec.list.forEach((it, iIdx) => {
          if (!it.title || !it.title.ar || !it.title.en) errors.push(`terms[${sIdx}].list[${iIdx}].title missing`);
          if (!it.description || !it.description.ar || !it.description.en) errors.push(`terms[${sIdx}].list[${iIdx}].description missing`);
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
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/terms?page=1&limit=1`, {
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
          // initialize a default document shape
          item = {
            headTitle: emptyLang(),
            headDescription: emptyLang(),
            terms: [makeEmptySection()],
          };
        } else {
          // ensure terms array exists
          item.terms = item.terms && Array.isArray(item.terms) ? item.terms : [];
        }

        setDoc(item);
        setRawJson(JSON.stringify(item, null, 2));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Failed to load terms document");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const updateDoc = (updater) => {
    setDoc((prev) => {
      const next = updater(typeof prev === "object" && prev ? { ...prev } : {});
      setRawJson(JSON.stringify(next, null, 2));
      return next;
    });
  };

  // section operations
  const addSection = () => updateDoc((d) => ({ ...d, terms: [...(d.terms || []), makeEmptySection()] }));
  const removeSection = (idx) => updateDoc((d) => ({ ...d, terms: (d.terms || []).filter((_, i) => i !== idx) }));

  const updateSectionField = (idx, field, lang, value) => {
    updateDoc((d) => {
      const terms = d.terms ? [...d.terms] : [];
      const term = { ...(terms[idx] || makeEmptySection()) };
      term[field] = { ...(term[field] || emptyLang()), [lang]: value };
      terms[idx] = term;
      return { ...d, terms };
    });
  };

  // list item operations
  const addListItem = (sectionIdx) => updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    term.list = term.list ? [...term.list, makeEmptyListItem()] : [makeEmptyListItem()];
    terms[sectionIdx] = term;
    return { ...d, terms };
  });

  const removeListItem = (sectionIdx, itemIdx) => updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    term.list = (term.list || []).filter((_, i) => i !== itemIdx);
    terms[sectionIdx] = term;
    return { ...d, terms };
  });

  const updateListItemField = (sectionIdx, itemIdx, field, lang, value) => updateDoc((d) => {
    const terms = d.terms ? [...d.terms] : [];
    const term = { ...(terms[sectionIdx] || makeEmptySection()) };
    const list = term.list ? [...term.list] : [];
    const item = { ...(list[itemIdx] || makeEmptyListItem()) };
    item[field] = { ...(item[field] || emptyLang()), [lang]: value };
    list[itemIdx] = item;
    term.list = list;
    terms[sectionIdx] = term;
    return { ...d, terms };
  });

  const handleSave = async (e) => {
    e.preventDefault();

    let payload;
    try {
      // prefer structured `doc` over rawJson; but validate JSON if user edited raw
      payload = rawJson ? JSON.parse(rawJson) : doc;
    } catch (err) {
      toast.error("JSON غير صالح: تحقق من التركيب");
      return;
    }

    // client-side validation mirroring Joi validators to avoid 400
    const errors = validateTermsPayload(payload);
    if (errors.length) {
      toast.error("هناك حقول مطلوبة ناقصة، أكملها قبل الحفظ:\n" + errors.slice(0,5).join("; "));
      console.warn("Validation errors:", errors);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');

      if (doc && doc._id) {
        const res = await fetch(`${API_BASE_URL}/terms/${doc._id}`, {
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
          toast.success("تم حفظ الشروط والأحكام بنجاح");
        } else throw new Error(result.message || "فشل الحفظ");
      } else {
        const res = await fetch(`${API_BASE_URL}/terms`, {
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
          toast.success("تم إنشاء وثيقة الشروط والأحكام وحفظها");
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
    <div dir="rtl">
      <h2 className="text-xl font-semibold mb-4">الشروط والأحكام</h2>

      {loading ? (
        <div className="h-40 flex items-center justify-center">جاري التحميل...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">عنوان الرأس (AR)</label>
              <Input
                value={(doc && doc.headTitle && doc.headTitle.ar) || ""}
                onChange={(e) => updateDoc(d => ({ ...d, headTitle: { ...(d.headTitle||{}), ar: e.target.value } }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">عنوان الرأس (EN)</label>
              <Input
                value={(doc && doc.headTitle && doc.headTitle.en) || ""}
                onChange={(e) => updateDoc(d => ({ ...d, headTitle: { ...(d.headTitle||{}), en: e.target.value } }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">الوصف الرئيسي (AR)</label>
            <textarea
              className="w-full border p-2 rounded-md min-h-[80px]"
              value={(doc && doc.headDescription && doc.headDescription.ar) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, headDescription: { ...(d.headDescription||{}), ar: e.target.value } }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">الوصف الرئيسي (EN)</label>
            <textarea
              className="w-full border p-2 rounded-md min-h-[80px]"
              value={(doc && doc.headDescription && doc.headDescription.en) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, headDescription: { ...(d.headDescription||{}), en: e.target.value } }))}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">الأقسام (مثال: شروط الخدمة، حقوقك في البيانات، أحكام إضافية)</h3>
            <p className="text-sm text-gray-600 mb-3">أضف/حرّر/احذف أقسام وقوائم داخل كل قسم.</p>

            <div className="space-y-4">
  {(doc?.terms || []).map((section, sIdx) => (
    <div key={sIdx} className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <strong className="text-gray-800">القسم #{sIdx + 1}</strong>
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={() => addListItem(sIdx)} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة بند
          </Button>
          <Button 
            type="button" 
            onClick={() => removeSection(sIdx)} 
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            حذف القسم
          </Button>
        </div>
      </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm">عنوان القسم (AR)</label>
                      <Input value={section.title?.ar || ""} onChange={(e) => updateSectionField(sIdx, 'title', 'ar', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm">عنوان القسم (EN)</label>
                      <Input value={section.title?.en || ""} onChange={(e) => updateSectionField(sIdx, 'title', 'en', e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm">وصف القسم (AR)</label>
                    <textarea className="w-full border p-2 rounded-md" value={section.description?.ar || ""} onChange={(e) => updateSectionField(sIdx, 'description', 'ar', e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm">وصف القسم (EN)</label>
                    <textarea className="w-full border p-2 rounded-md" value={section.description?.en || ""} onChange={(e) => updateSectionField(sIdx, 'description', 'en', e.target.value)} />
                  </div>

                <div className="space-y-3">
  {(section.list || []).map((item, iIdx) => (
    <div key={iIdx} className="p-3 border rounded">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-800">بند #{iIdx + 1}</span>
        <Button 
          type="button" 
          onClick={() => removeListItem(sIdx, iIdx)} 
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          حذف البند
        </Button>
      </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <Input placeholder="عنوان (AR)" value={item.title?.ar || ""} onChange={(e) => updateListItemField(sIdx, iIdx, 'title', 'ar', e.target.value)} />
                          <Input placeholder="عنوان (EN)" value={item.title?.en || ""} onChange={(e) => updateListItemField(sIdx, iIdx, 'title', 'en', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <textarea placeholder="وصف (AR)" className="w-full border p-2 rounded" value={item.description?.ar || ""} onChange={(e) => updateListItemField(sIdx, iIdx, 'description', 'ar', e.target.value)} />
                          <textarea placeholder="وصف (EN)" className="w-full border p-2 rounded" value={item.description?.en || ""} onChange={(e) => updateListItemField(sIdx, iIdx, 'description', 'en', e.target.value)} />
                        </div>

                        <div className="mt-2">
                          <Input placeholder="رمز أيقونة SVG أو رابط" value={item.icon || ""} onChange={(e) => updateDoc(d => {
                            const terms = d.terms ? [...d.terms] : [];
                            const term = { ...(terms[sIdx] || makeEmptySection()) };
                            const list = term.list ? [...term.list] : [];
                            const it = { ...(list[iIdx] || makeEmptyListItem()) };
                            it.icon = e.target.value;
                            list[iIdx] = it;
                            term.list = list;
                            terms[sIdx] = term;
                            return { ...d, terms };
                          })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-primary">
              {saving ? "جاري الحفظ..." : "حفظ الشروط والأحكام"}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
