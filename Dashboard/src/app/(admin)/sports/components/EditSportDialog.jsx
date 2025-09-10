"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/app/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/component/ui/dialog";
import { Input } from "@/app/component/ui/input";
import { Textarea } from "@/app/component/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";

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
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        {/* header */}
        <div className="bg-gradient-to-l from-primary/80 to-primary p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              تعديل: <span className="font-semibold">{title}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs mt-1 opacity-90">
            حدّث معلومات اللعبة، المواقع، وأنواع الأدوار. ثم اضغط حفظ.
          </p>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* left (form) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-4">
              <h3 className="font-medium mb-3">المعلومات الأساسية</h3>
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
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">المواقع</h3>
                <Button type="button" onClick={addPosition} className="bg-primary">
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
                      className="grid grid-cols-1 md:grid-cols-7 gap-3 border rounded-lg p-3"
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
                          className="h-9"
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
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">أنواع الأدوار</h3>
                <Button type="button" onClick={addRole} className="bg-primary">
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
                      className="grid grid-cols-1 md:grid-cols-7 gap-3 border rounded-lg p-3"
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
                          className="h-9"
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
          <div className="space-y-6">
            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-4">
              <h3 className="font-medium mb-4">أيقونة اللعبة</h3>
              <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800">
                {iconPreview ? (
                  <div className="relative w-32 h-32 mb-4">
                    <Image src={iconPreview} alt="أيقونة اللعبة" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center text-gray-400 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
                  className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  اختيار/تغيير الأيقونة
                </label>

                <Button
                  type="button"
                  onClick={handleIconSubmit}
                  disabled={isIconSubmitting || !iconInputRef.current?.files?.[0]}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                >
                  {isIconSubmitting ? "جاري الرفع..." : "تحديث الأيقونة"}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  يُفضّل SVG/PNG بخلفية شفافة. الحد الأقصى 2MB.
                </p>
              </div>
            </section>

            <section className="rounded-xl border bg-white/50 dark:bg-slate-900/40 p-4 text-sm">
              <h3 className="font-medium mb-2">معلومات</h3>
              <div className="space-y-1 text-muted-foreground">
                <div>المعرّف: <code className="text-xs">{sport?._id}</code></div>
                {sport?.slug && (
                  <div>الرابط: <code className="text-xs">{sport.slug}</code></div>
                )}
                <div>أنشئ: {sport?.createdAt ? new Date(sport.createdAt).toLocaleDateString("ar-SA") : "—"}</div>
                <div>آخر تحديث: {sport?.updatedAt ? new Date(sport.updatedAt).toLocaleDateString("ar-SA") : "—"}</div>
              </div>
            </section>
          </div>
        </div>

        {/* footer */}
        <DialogFooter className="border-t bg-gray-50 dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary">
            {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
