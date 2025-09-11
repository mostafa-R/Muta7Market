"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/component/ui/select";

const JOB_OPTIONS = [
  { value: "player", label: "لاعب" },
  { value: "coach",  label: "مدرب" },
];

export default function CreateSportForm({ onSportCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconPreview, setIconPreview]   = useState(null);
  const iconInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: { ar: "", en: "" },
    positions: [],               // [{ name:{ar,en} }]
    roleTypes: [],               // [{ jop, name:{ar,en} }]
    seo: {
      metaTitle: { ar: "", en: "" },
      metaDescription: { ar: "", en: "" },
      keywords: "",
    },
  });

  const setByPath = (path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev);
      const parts = path.split(".");
      let t = clone;
      for (let i = 0; i < parts.length - 1; i++) t = t[parts[i]];
      t[parts.at(-1)] = value;
      return clone;
    });
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) setByPath(name, value);
    else setFormData((p) => ({ ...p, [name]: value }));
  };

  // positions
  const addPosition = () =>
    setFormData((p) => ({
      ...p,
      positions: [...p.positions, { name: { ar: "", en: "" } }],
    }));
  const removePosition = (i) =>
    setFormData((p) => ({ ...p, positions: p.positions.filter((_, idx) => idx !== i) }));
  const updatePosition = (i, path, v) =>
    setFormData((prev) => {
      const clone = structuredClone(prev);
      const segs = path.split(".");
      let t = clone.positions[i];
      for (let s = 0; s < segs.length - 1; s++) t = t[segs[s]];
      t[segs.at(-1)] = v;
      return clone;
    });

  // roleTypes
  const addRole = () =>
    setFormData((p) => ({
      ...p,
      roleTypes: [...p.roleTypes, { jop: "", name: { ar: "", en: "" } }],
    }));
  const removeRole = (i) =>
    setFormData((p) => ({ ...p, roleTypes: p.roleTypes.filter((_, idx) => idx !== i) }));
  const updateRole = (i, path, v) =>
    setFormData((prev) => {
      const clone = structuredClone(prev);
      if (path === "jop") {
        clone.roleTypes[i].jop = v;
      } else {
        const segs = path.split(".");
        let t = clone.roleTypes[i];
        for (let s = 0; s < segs.length - 1; s++) t = t[segs[s]];
        t[segs.at(-1)] = v;
      }
      return clone;
    });

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image/")) return toast.error("يرجى اختيار ملف صورة صالح");
    if (file.size > 2 * 1024 * 1024) return toast.error("حجم الصورة كبير جدًا (2MB)");
    const fr = new FileReader();
    fr.onload = (ev) => setIconPreview(ev.target.result);
    fr.readAsDataURL(file);
  };

  // Build payload that NEVER sends an invalid roleTypes array
  const buildPayload = () => {
    const keywords =
      formData.seo.keywords
        ?.split(",")
        .map((k) => k.trim())
        .filter(Boolean) || [];

    const positions = (formData.positions || [])
      .map((p) => ({
        name: {
          ar: (p?.name?.ar || "").trim(),
          en: (p?.name?.en || "").trim(),
        },
      }))
      .filter((p) => p.name.ar && p.name.en);

    const roleTypesValid = (formData.roleTypes || [])
      .map((r) => ({
        jop: (r?.jop || "").trim(), // "player" | "coach"
        name: {
          ar: (r?.name?.ar || "").trim(),
          en: (r?.name?.en || "").trim(),
        },
      }))
      .filter((r) => r.jop && r.name.ar && r.name.en);

    const payload = {
      name: { ar: formData.name.ar.trim(), en: formData.name.en.trim() },
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

    if (positions.length)    payload.positions = positions;
    if (roleTypesValid.length) payload.roleTypes = roleTypesValid; // omit entirely if none valid

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.ar.trim() || !formData.name.en.trim()) {
      toast.error("يرجى إدخال اسم اللعبة باللغتين العربية والإنجليزية");
      return;
    }

    // quick client guard to avoid obvious 400s
    const badPos = formData.positions.some(
      (p) => (p?.name?.ar || p?.name?.en) && (!p?.name?.ar || !p?.name?.en)
    );
    if (badPos) return toast.error("كل موقع يجب أن يحتوي على الاسم بالعربية والإنجليزية");

    const badRoles = formData.roleTypes.some(
      (r) => (r?.jop || r?.name?.ar || r?.name?.en) && (!r?.jop || !r?.name?.ar || !r?.name?.en)
    );
    if (badRoles) {
      return toast.error("كل نوع دور يجب أن يحتوي على (لاعب/مدرب) والاسم بالعربية والإنجليزية");
    }

    const payload = buildPayload();

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("accessToken");
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL ;

      const res = await fetch(`${API_BASE_URL}/sports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // If backend still returns structured details, show them
        const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const created = json?.data ?? json;
      toast.success("تم إنشاء اللعبة الرياضية بنجاح");
      onSportCreated?.(created);

      // reset
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
      if (iconInputRef.current) iconInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error(`حدث خطأ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">المعلومات الأساسية</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">اسم اللعبة (بالعربية) <span className="text-red-500">*</span></label>
                <Input name="name.ar" value={formData.name.ar} onChange={handleSimpleChange} placeholder="أدخل اسم اللعبة بالعربية" required />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">اسم اللعبة (بالإنجليزية) <span className="text-red-500">*</span></label>
                <Input name="name.en" value={formData.name.en} onChange={handleSimpleChange} placeholder="Enter sport name in English" required />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">المراكز</h3>
              <Button type="button" onClick={addPosition} className="bg-primary hover:bg-primary/90">إضافة موقع</Button>
            </div>
            <div className="space-y-4">
              {formData.positions.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد مواقع بعد. اضغط &quot;إضافة موقع&quot; لإضافة أول موقع.</p>
              )}
              {formData.positions.map((pos, idx) => (
                <div key={`pos-${idx}`} className="p-4 rounded-lg border space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="اسم الموقع (عربي) *" value={pos.name.ar} onChange={(e) => updatePosition(idx, "name.ar", e.target.value)} />
                    <Input placeholder="اسم الموقع (إنجليزي) *" value={pos.name.en} onChange={(e) => updatePosition(idx, "name.en", e.target.value)} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => removePosition(idx)} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">إزالة</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">أنواع الوظائف</h3>
              <Button type="button" onClick={addRole} className="bg-primary hover:bg-primary/90">إضافة نوع</Button>
            </div>
            <div className="space-y-4">
              {formData.roleTypes.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد أنواع بعد. اضغط &quot;إضافة نوع&quot; لإضافة أول نوع (لاعب/مدرب).</p>
              )}
              {formData.roleTypes.map((role, idx) => (
                <div key={`role-${idx}`} className="p-4 rounded-lg border space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs mb-1">الفئة</label>
                      <Select value={role.jop || ""} onValueChange={(v) => updateRole(idx, "jop", v)}>
                        <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                        <SelectContent>
                          {JOB_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs mb-1">الاسم (عربي)</label>
                      <Input value={role.name.ar} onChange={(e) => updateRole(idx, "name.ar", e.target.value)} placeholder="اسم النوع (عربي) *" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs mb-1">Name (English)</label>
                      <Input value={role.name.en} onChange={(e) => updateRole(idx, "name.en", e.target.value)} placeholder="Type name (English) *" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => removeRole(idx)} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">إزالة</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">أيقونة اللعبة</h3>
            <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800">
              {iconPreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image src={iconPreview} alt="أيقونة اللعبة" fill className="object-contain" />
                </div>
              ) : (
                <div className="h-32 w-32 flex items-center justify-center text-gray-400 mb-4 border rounded-lg">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <input id="icon-upload" type="file" ref={iconInputRef} onChange={handleIconChange} accept="image/*" className="hidden" />
              <label htmlFor="icon-upload" className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors">اختيار أيقونة</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                يُفضّل SVG/PNG بخلفية شفافة. الحد الأقصى 2MB.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات SEO</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="seo.metaTitle.ar" value={formData.seo.metaTitle.ar} onChange={handleSimpleChange} placeholder="Meta Title (عربي)" />
                <Input name="seo.metaTitle.en" value={formData.seo.metaTitle.en} onChange={handleSimpleChange} placeholder="Meta Title (English)" />
                <Textarea name="seo.metaDescription.ar" value={formData.seo.metaDescription.ar} onChange={handleSimpleChange} placeholder="Meta Description (عربي)" rows={2} />
                <Textarea name="seo.metaDescription.en" value={formData.seo.metaDescription.en} onChange={handleSimpleChange} placeholder="Meta Description (English)" rows={2} />
              </div>
              <div className="space-y-2">
                <label htmlFor="seo.keywords" className="block text-sm font-medium">الكلمات المفتاحية (مفصولة بفواصل)</label>
                <Input id="seo.keywords" name="seo.keywords" value={formData.seo.keywords} onChange={handleSimpleChange} placeholder="football, sport, تدريب" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
          {isSubmitting ? (<><span className="animate-spin mr-2">⏳</span>جاري الإنشاء...</>) : "إنشاء اللعبة"}
        </Button>
      </div>
    </form>
  );
}
