"use client";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

function emptyLang() {
  return { ar: "", en: "" };
}

function makeEmptyItem() {
  return { name: emptyLang(), description: emptyLang(), icon: "" };
}

function makeEmptyList() {
  return { title: emptyLang(), description: emptyLang(), items: [makeEmptyItem()] };
}

// Inline subcomponent: small editor for mission/values sections
function MissionValuesEditor({ labelAr, labelEn, doc, updateDoc, makeEmptyList, makeEmptyItem }) {
  const langKey = 'ar'; // show Arabic inputs primarily; both languages handled below

  const findSectionIndex = () => (doc?.list || []).findIndex(s => s?.title?.ar === labelAr || s?.title?.en === labelEn);

  // ensureSection: create a section with the expected title if missing and return its index
  const ensureSection = () => {
    const idx = findSectionIndex();
    if (idx !== -1) return idx;
    // create a new section object with title set so frontend finds it immediately
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

// lightweight client-side validation mirroring backend Joi schemas
function validateAboutPayload(payload) {
  const errors = [];
  if (!payload) return ["payload missing"];
  if (!payload.title || !payload.title.ar || !payload.title.en) errors.push("title.ar or title.en required");
  if (!payload.description || !payload.description.ar || !payload.description.en) errors.push("description.ar or description.en required");
  if (payload.list && Array.isArray(payload.list)) {
    payload.list.forEach((sec, sIdx) => {
      if (!sec.title || !sec.title.ar || !sec.title.en) errors.push(`list[${sIdx}].title missing`);
      if (!sec.description || !sec.description.ar || !sec.description.en) errors.push(`list[${sIdx}].description missing`);
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach((it, iIdx) => {
          if (!it.name || !it.name.ar || !it.name.en) errors.push(`list[${sIdx}].items[${iIdx}].name missing`);
          if (!it.description || !it.description.ar || !it.description.en) errors.push(`list[${sIdx}].items[${iIdx}].description missing`);
        });
      }
    });
  }
  return errors;
}

export default function AboutSettingsForm() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // stable keys for lists/items to avoid React re-using DOM nodes when adding new items
  const listKeysRef = useRef([]);
  const itemKeysRef = useRef([]);

  const makeKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

  // keep keysRef in sync with doc structure
  useEffect(() => {
    const lists = doc?.list || [];

    // ensure outer list keys
    if (listKeysRef.current.length < lists.length) {
      for (let i = listKeysRef.current.length; i < lists.length; i++) listKeysRef.current[i] = makeKey();
    } else if (listKeysRef.current.length > lists.length) {
      listKeysRef.current.length = lists.length;
    }

    // ensure item keys per list
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

  const updateDoc = (updater) => {
    setDoc((prev) => {
      const next = updater(typeof prev === "object" && prev ? { ...prev } : {});
      setRawJson(JSON.stringify(next, null, 2));
      return next;
    });
  };

  // list operations
  const addList = () => updateDoc((d) => ({ ...d, list: [...(d.list || []), makeEmptyList()] }));
  // keep key refs in sync when adding a list
  const addListWithKey = () => {
    updateDoc((d) => ({ ...d, list: [...(d.list || []), makeEmptyList()] }));
    // push a key for the new list
    listKeysRef.current.push(makeKey());
    itemKeysRef.current.push([makeKey()]);
  };
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

  // item operations
  const addItem = (listIdx) => updateDoc((d) => {
    const list = d.list ? [...d.list] : [];
    const l = { ...(list[listIdx] || makeEmptyList()) };
    l.items = l.items ? [...l.items, makeEmptyItem()] : [makeEmptyItem()];
    list[listIdx] = l;
    return { ...d, list };
  });

  const addItemWithKey = (listIdx) => {
    updateDoc((d) => {
      const list = d.list ? [...d.list] : [];
      const l = { ...(list[listIdx] || makeEmptyList()) };
      l.items = l.items ? [...l.items, makeEmptyItem()] : [makeEmptyItem()];
      list[listIdx] = l;
      return { ...d, list };
    });
    itemKeysRef.current[listIdx] = itemKeysRef.current[listIdx] || [];
    itemKeysRef.current[listIdx].push(makeKey());
  };

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

    // client-side validation to avoid server 400 from Joi validators
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
          // show inline success message instead of opening a new tab
          setSuccessMessage("تم حفظ بيانات صفحة من نحن بنجاح");
          // notify other tabs/clients to reload About data without full page reload
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const bc = new BroadcastChannel('site-settings');
              bc.postMessage({ type: 'about-updated', timestamp: Date.now() });
              bc.close();
            } else if (typeof window !== 'undefined') {
              // fallback: use localStorage event
              localStorage.setItem('site-settings-about-updated', Date.now().toString());
            }
          } catch (e) {
            // ignore broadcast errors
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
          // show inline success message instead of opening a new tab
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
    <div dir="rtl">
      <h2 className="text-xl font-semibold mb-4">صفحة من نحن</h2>

      {loading ? (
        <div className="h-40 flex items-center justify-center">جاري التحميل...</div>
      ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">العنوان (AR)</label>
              <Input
                value={(doc && doc.title && doc.title.ar) || ""}
                onChange={(e) => updateDoc(d => ({ ...d, title: { ...(d.title||{}), ar: e.target.value } }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">العنوان (EN)</label>
              <Input
                value={(doc && doc.title && doc.title.en) || ""}
                onChange={(e) => updateDoc(d => ({ ...d, title: { ...(d.title||{}), en: e.target.value } }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">الوصف (AR)</label>
            <textarea
              className="w-full border p-2 rounded-md min-h-[100px]"
              value={(doc && doc.description && doc.description.ar) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, description: { ...(d.description||{}), ar: e.target.value } }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">الوصف (EN)</label>
            <textarea
              className="w-full border p-2 rounded-md min-h-[100px]"
              value={(doc && doc.description && doc.description.en) || ""}
              onChange={(e) => updateDoc(d => ({ ...d, description: { ...(d.description||{}), en: e.target.value } }))}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">القوائم التفصيلية (مثال: مميزات، خدمات، فرق العمل)</h3>
            <p className="text-sm text-gray-600 mb-3">أضف/حرّر/احذف قوائم وبنود داخل كل قائمة.</p>

            <div className="space-y-4">
              {(doc?.list || []).map((lst, lIdx) => (
                <div key={listKeysRef.current[lIdx] || lIdx} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <strong className="text-gray-800">القائمة #{lIdx + 1}</strong>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => addItemWithKey(lIdx)} size="sm" className="bg-blue-950 text-slate-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة بند
                      </Button>
                      <Button type="button" onClick={() => removeList(lIdx)} variant="destructive" size="sm" className="bg-red-800 text-slate-100">
                        <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف القائمة
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm">عنوان القائمة (AR)</label>
                      <Input value={lst.title?.ar || ""} onChange={(e) => updateListField(lIdx, 'title', 'ar', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm">عنوان القائمة (EN)</label>
                      <Input value={lst.title?.en || ""} onChange={(e) => updateListField(lIdx, 'title', 'en', e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm">وصف القائمة (AR)</label>
                    <textarea className="w-full border p-2 rounded-md" value={lst.description?.ar || ""} onChange={(e) => updateListField(lIdx, 'description', 'ar', e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm">وصف القائمة (EN)</label>
                    <textarea className="w-full border p-2 rounded-md" value={lst.description?.en || ""} onChange={(e) => updateListField(lIdx, 'description', 'en', e.target.value)} />
                  </div>

                  <div className="space-y-3">
              {(lst.items || []).map((it, itIdx) => (
            <div key={itemKeysRef.current[lIdx]?.[itIdx] || itIdx} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">بند #{itIdx + 1}</span>
                          <Button type="button" onClick={() => removeItem(lIdx, itIdx)} variant="destructive" size="sm" className="bg-red-800 text-slate-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف البند
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <Input placeholder="اسم (AR)" value={it.name?.ar || ""} onChange={(e) => updateItemField(lIdx, itIdx, 'name', 'ar', e.target.value)} />
                          <Input placeholder="اسم (EN)" value={it.name?.en || ""} onChange={(e) => updateItemField(lIdx, itIdx, 'name', 'en', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <textarea placeholder="وصف (AR)" className="w-full border p-2 rounded" value={it.description?.ar || ""} onChange={(e) => updateItemField(lIdx, itIdx, 'description', 'ar', e.target.value)} />
                          <textarea placeholder="وصف (EN)" className="w-full border p-2 rounded" value={it.description?.en || ""} onChange={(e) => updateItemField(lIdx, itIdx, 'description', 'en', e.target.value)} />
                        </div>

                        <div className="mt-2">
                          <Input placeholder="رمز أيقونة SVG أو رابط" value={it.icon || ""} onChange={(e) => updateDoc(d => {
                            const list = d.list ? [...d.list] : [];
                            const l = { ...(list[lIdx] || makeEmptyList()) };
                            const items = l.items ? [...l.items] : [];
                            const item = { ...(items[itIdx] || makeEmptyItem()) };
                            item.icon = e.target.value;
                            items[itIdx] = item;
                            l.items = items;
                            list[lIdx] = l;
                            return { ...d, list };
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
            <Button type="submit" disabled={saving} size="sm" className="bg-blue-950 text-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      )}

      {/* inline success banner (dismissible) */}
      {successMessage && (
        <div className="mt-4 rounded-md bg-green-50 p-3 border border-green-200 flex items-start justify-between">
          <div className="text-sm text-green-800">{successMessage}</div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-green-600 font-medium ml-4">إغلاق</button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}