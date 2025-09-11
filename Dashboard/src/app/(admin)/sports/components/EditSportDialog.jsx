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
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const JOB_OPTIONS = [
  { value: "player", label: "لاعب" },
  { value: "coach", label: "مدرب" },
];

export default function EditSportDialog({
  sport,
  isOpen,
  onClose,
  onSportUpdated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIconSubmitting, setIsIconSubmitting] = useState(false);
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

  // Keep dialog in sync if user opens a different row without closing
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
    if (iconInputRef.current) iconInputRef.current.value = "";
  }, [sport]);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("accessToken");

  /* ----------------------- helpers ----------------------- */
  const setField = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const segs = path.split(".");
      let target = next;
      for (let i = 0; i < segs.length - 1; i++) target = target[segs[i]];
      target[segs[segs.length - 1]] = value;
      return next;
    });
  };

  // positions
  const addPosition = () =>
    setForm((p) => ({
      ...p,
      positions: [...p.positions, { name: { ar: "", en: "" } }],
    }));

  const removePosition = (idx) =>
    setForm((p) => ({
      ...p,
      positions: p.positions.filter((_, i) => i !== idx),
    }));

  const updatePosition = (idx, lang, value) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.positions[idx].name[lang] = value;
      return next;
    });

  // roles
  const addRole = () =>
    setForm((p) => ({
      ...p,
      roleTypes: [...p.roleTypes, { jop: "", name: { ar: "", en: "" } }],
    }));

  const removeRole = (idx) =>
    setForm((p) => ({
      ...p,
      roleTypes: p.roleTypes.filter((_, i) => i !== idx),
    }));

  const updateRole = (idx, path, value) =>
    setForm((p) => {
      const next = structuredClone(p);
      if (path === "jop") next.roleTypes[idx].jop = value;
      else next.roleTypes[idx].name[path] = value; // ar/en
      return next;
    });

  // icon preview only
  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جدًا. الحد الأقصى هو 2 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setIconPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const buildPayload = () => {
    const keywords =
      form.seo.keywords
        ?.split(",")
        .map((k) => k.trim())
        .filter(Boolean) || [];

    const positions = (form.positions || [])
      .map((p) => ({
        name: {
          ar: (p?.name?.ar || "").trim(),
          en: (p?.name?.en || "").trim(),
        },
      }))
      .filter((p) => p.name.ar || p.name.en);

    const roleTypes = (form.roleTypes || [])
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
  };

  /* ----------------------- submit ----------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.ar.trim() || !form.name.en.trim()) {
      toast.error("يرجى إدخال اسم اللعبة باللغتين العربية والإنجليزية");
      return;
    }

    // quick validations
    const invalidPos = form.positions.some(
      (p) => (p?.name?.ar || p?.name?.en) && (!p?.name?.ar || !p?.name?.en)
    );
    if (invalidPos) {
      toast.error("كل موقع يجب أن يحتوي على الاسم بالعربية والإنجليزية");
      return;
    }

    const invalidRoles = form.roleTypes.some(
      (r) => (r?.name?.ar || r?.name?.en || r?.jop) && (!r?.jop || !r?.name?.ar || !r?.name?.en)
    );
    if (invalidRoles) {
      toast.error("كل نوع دور يجب أن يحتوي على الفئة (لاعب/مدرب) والاسم بالعربية والإنجليزية");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const updated = json?.data ?? json;
      onSportUpdated?.(updated);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (err) {
      console.error(err);
      toast.error(`حدث خطأ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIconSubmit = async () => {
    if (!iconInputRef.current?.files?.[0]) {
      toast.error("يرجى اختيار أيقونة");
      return;
    }
    setIsIconSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("icon", iconInputRef.current.files[0]);

      const res = await fetch(`${API_BASE_URL}/sports/${sport._id}/icon`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const updated = json?.data ?? json;
      onSportUpdated?.(updated);
      toast.success("تم تحديث الأيقونة بنجاح");
      // clear input after successful upload
      if (iconInputRef.current) iconInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error(`فشل رفع الأيقونة: ${err.message}`);
    } finally {
      setIsIconSubmitting(false);
    }
  };

  /* ----------------------- UI ----------------------- */
  const title = useMemo(
    () => form?.name?.ar || form?.name?.en || "تعديل اللعبة",
    [form?.name?.ar, form?.name?.en]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose} dir="rtl">
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-lg shadow-lg border-0">
        {/* header */}
        <div className="bg-gradient-to-l from-primary/80 to-primary p-6 text-black pb-3">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              تعديل: <span className="font-semibold">{title}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm mt-2 opacity-90">
            حدّث معلومات اللعبة، المواقع، وأنواع الأدوار. ثم اضغط حفظ.
          </p>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* left (form) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-5 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-semibold text-lg mb-4 text-primary">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="اسم اللعبة (عربي) *"
                  value={form.name.ar}
                  onChange={(e) => setField("name.ar", e.target.value)}
                />
                <Input
                  placeholder="Name (English) *"
                  value={form.name.en}
                  onChange={(e) => setField("name.en", e.target.value)}
                />
              </div>

              {/* SEO */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="md:col-span-2 font-medium text-gray-600 dark:text-gray-300">معلومات SEO</h4>
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
                  onChange={(e) =>
                    setField("seo.metaDescription.ar", e.target.value)
                  }
                />
                <Textarea
                  rows={2}
                  placeholder="Meta Description (English)"
                  value={form.seo.metaDescription.en}
                  onChange={(e) =>
                    setField("seo.metaDescription.en", e.target.value)
                  }
                />
                <div className="md:col-span-2">
                  <Input
                    placeholder="الكلمات المفتاحية (مفصولة بفواصل)"
                    value={form.seo.keywords}
                    onChange={(e) => setField("seo.keywords", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Positions */}
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-primary">المواقع</h3>
                <Button type="button" onClick={addPosition} className="bg-primary hover:bg-primary/90 transition-colors">
                  إضافة موقع
                </Button>
              </div>

              {form.positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد مواقع بعد.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.positions.map((pos, idx) => (
                    <div
                      key={`pos-${idx}`}
                      className="grid grid-cols-1 md:grid-cols-7 gap-3 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white/80 dark:bg-slate-800/60"
                    >
                      <Input
                        className="md:col-span-3"
                        placeholder="اسم الموقع (عربي) *"
                        value={pos.name.ar}
                        onChange={(e) => updatePosition(idx, "ar", e.target.value)}
                      />
                      <Input
                        className="md:col-span-3"
                        placeholder="اسم الموقع (إنجليزي) *"
                        value={pos.name.en}
                        onChange={(e) => updatePosition(idx, "en", e.target.value)}
                      />
                      <div className="md:col-span-1 flex items-center justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removePosition(idx)}
                          className="h-9 hover:bg-red-600 transition-colors"
                        >
                          إزالة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Role Types */}
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-primary">أنواع الأدوار</h3>
                <Button type="button" onClick={addRole} className="bg-primary hover:bg-primary/90 transition-colors">
                  إضافة نوع
                </Button>
              </div>

              {form.roleTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد أنواع بعد.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.roleTypes.map((role, idx) => (
                    <div
                      key={`role-${idx}`}
                      className="grid grid-cols-1 md:grid-cols-7 gap-3 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white/80 dark:bg-slate-800/60"
                    >
                      <div className="md:col-span-2">
                        <Select
                          value={role.jop || ""}
                          onValueChange={(v) => updateRole(idx, "jop", v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        className="md:col-span-2"
                        placeholder="اسم النوع (عربي) *"
                        value={role.name.ar}
                        onChange={(e) => updateRole(idx, "ar", e.target.value)}
                      />
                      <Input
                        className="md:col-span-2"
                        placeholder="Type name (English) *"
                        value={role.name.en}
                        onChange={(e) => updateRole(idx, "en", e.target.value)}
                      />

                      <div className="md:col-span-1 flex items-center justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeRole(idx)}
                          className="h-9 hover:bg-red-600 transition-colors"
                        >
                          إزالة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* right (icon + meta) */}
          <div className="space-y-6 h-full flex flex-col">
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-5 shadow-sm transition-all hover:shadow-md flex-grow">
              <h3 className="font-semibold text-lg mb-4 text-primary">أيقونة اللعبة</h3>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => document.getElementById('icon-upload-edit').click()}>
                {iconPreview ? (
                  <div className="relative w-36 h-36 mb-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                    <Image src={iconPreview} alt="أيقونة اللعبة" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="h-36 w-36 flex items-center justify-center text-gray-400 mb-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-slate-700/50">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
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
                  className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  اختيار/تغيير الأيقونة
                </label>

                <Button
                  type="button"
                  onClick={handleIconSubmit}
                  disabled={isIconSubmitting || !iconInputRef.current?.files?.[0]}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isIconSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      تحديث الأيقونة
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  يُفضّل SVG/PNG بخلفية شفافة. الحد الأقصى 2MB.
                </p>
              </div>
            </section>

            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-5 text-sm shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-primary">معلومات</h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2"><span className="font-medium">المعرّف:</span> <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{sport?._id}</code></div>
                {sport?.slug && (
                  <div className="flex items-center gap-2"><span className="font-medium">الرابط:</span> <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{sport.slug}</code></div>
                )}
                <div className="flex items-center gap-2"><span className="font-medium">أنشئ:</span> <span>{sport?.createdAt ? new Date(sport.createdAt).toLocaleDateString("ar-SA") : "—"}</span></div>
                <div className="flex items-center gap-2"><span className="font-medium">آخر تحديث:</span> <span>{sport?.updatedAt ? new Date(sport.updatedAt).toLocaleDateString("ar-SA") : "—"}</span></div>
              </div>
            </section>
          </div>
        </div>

        {/* footer */}
        <DialogFooter className="border-t bg-gray-50 dark:bg-slate-900 px-6 py-4 flex items-center justify-between sticky bottom-0">
          <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                حفظ التغييرات
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
