"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useFormik } from "formik";
import Joi from "joi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:5000/api/v1/admin";

const errText = (err, fallback = "حدث خطأ") => {
  const r = err?.response;
  const d = r?.data ?? {};
  const cands = [
    d.message,
    d.msg,
    d.error?.message,
    typeof d.error === "string" ? d.error : undefined,
    d.data?.message,
    err?.message,
  ].filter(Boolean);
  return cands.find((s) => typeof s === "string" && s.trim()) || fallback;
};

const schema = Joi.object({
  name: Joi.string().min(2).max(100).allow(""),
  age: Joi.alternatives().try(Joi.number().integer().min(16).max(50), Joi.string().allow("")),
  gender: Joi.string().valid("male", "female").allow(""),
  nationality: Joi.string().min(2).max(100).allow(""),
  jop: Joi.string().valid("player", "coach").allow(""),
  position: Joi.string().max(100).allow(""),
  status: Joi.string()
    .valid("available", "contracted", "transferred", "recently transferred")
    .allow(""),
  game: Joi.string().max(100).allow(""),
  experience: Joi.alternatives().try(Joi.number().integer().min(0).max(30), Joi.string().allow("")),
  isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false")).allow(""),
});

export default function UpdatePlayerPage() {
  const router = useRouter();
  const { id } = useParams(); // route must be /players/update/[id]
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: "",
      age: "",
      gender: "",
      nationality: "",
      jop: "",
      position: "",
      status: "",
      game: "",
      experience: "",   // will be mapped to expreiance
      isActive: true,
    },
    validate: (values) => {
      const { error } = schema.validate(values, { abortEarly: false });
      if (!error) return {};
      const out = {};
      error.details.forEach((d) => (out[d.path.join(".")] = d.message));
      return out;
    },
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("يرجى تسجيل الدخول");
          return;
        }

        // Build multipart FormData (safe with your multer chain)
        const fd = new FormData();

        // Append only fields that have a value (partial update)
        if (values.name) fd.append("name", values.name);
        if (values.age !== "") fd.append("age", String(values.age));
        if (values.gender) fd.append("gender", values.gender.toLowerCase());
        if (values.nationality) fd.append("nationality", values.nationality);
        if (values.jop) fd.append("jop", values.jop.toLowerCase());
        if (values.position) fd.append("position", values.position);
        if (values.status) fd.append("status", values.status.toLowerCase());
        if (values.game) fd.append("game", values.game);
        if (values.experience !== "")
          fd.append("expreiance", String(Number(values.experience) || 0));
        if (typeof values.isActive !== "undefined")
          fd.append("isActive", String(Boolean(values.isActive)));

        setUploadProgress(10);

        const resp = await axios.patch(`${API_BASE}/players/${id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total || 100));
            setUploadProgress(pct);
          },
        });

        toast.success(resp?.data?.message || "تم تحديث البيانات بنجاح");
        // router.back(); // or router.push('/players')
      } catch (err) {
        toast.error(errText(err, "فشل التحديث"));
      }
    },
  });

  // Load existing player by id
  useEffect(() => {
    (async () => {
      try {
        if (!id) {
          toast.error("المسار غير صحيح");
          setLoading(false);
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("يجب تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/players/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const p = res?.data?.data;
        if (!p) {
          toast.error("لا توجد بيانات لعرضها");
          setLoading(false);
          return;
        }

        formik.setValues({
          name: p.name || "",
          age: p.age ?? "",
          gender: (p.gender || "").toLowerCase(),
          nationality: p.nationality || "",
          jop: (p.jop || "").toLowerCase(),
          position: p.position || "",
          status: (p.status || "").toLowerCase(), // e.g. "available"
          game: p.game || "",
          experience: p.expreiance ?? "",
          isActive: Boolean(p.isActive),
        });
      } catch (err) {
        toast.error(errText(err, "تعذر جلب بيانات اللاعب"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveClick = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) {
      const firstKey = Object.keys(errors)[0];
      toast.error(errors[firstKey] || "يرجى مراجعة الحقول");
      return;
    }
    formik.submitForm();
  };

  if (!id) {
    return (
      <div className="p-6">
        <ToastContainer />
        <p className="text-red-600">استخدم المسار: /players/update/&lt;id&gt;</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">تعديل بيانات اللاعب</h1>

      {loading ? (
        <div className="p-6 bg-white rounded border">جارِ التحميل…</div>
      ) : (
        <form onSubmit={formik.handleSubmit} className="bg-white rounded border p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">الاسم</label>
            <input
              className="w-full border rounded p-2"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && <p className="text-xs text-red-600 mt-1">{formik.errors.name}</p>}
          </div>

          {/* age */}
          <div>
            <label className="block text-sm mb-1">العمر</label>
            <input
              className="w-full border rounded p-2"
              name="age"
              type="number"
              value={formik.values.age}
              onChange={formik.handleChange}
            />
            {formik.errors.age && <p className="text-xs text-red-600 mt-1">{formik.errors.age}</p>}
          </div>

          {/* gender */}
          <div>
            <label className="block text-sm mb-1">الجنس</label>
            <select
              className="w-full border rounded p-2"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            {formik.errors.gender && <p className="text-xs text-red-600 mt-1">{formik.errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">الجنسية</label>
            <input
              className="w-full border rounded p-2"
              name="nationality"
              value={formik.values.nationality}
              onChange={formik.handleChange}
            />
            {formik.errors.nationality && <p className="text-xs text-red-600 mt-1">{formik.errors.nationality}</p>}
          </div>

          {/* jop */}
          <div>
            <label className="block text-sm mb-1">الفئة (jop)</label>
            <select
              className="w-full border rounded p-2"
              name="jop"
              value={formik.values.jop}
              onChange={formik.handleChange}
            >
              <option value="player">لاعب</option>
              <option value="coach">مدرب</option>
            </select>
            {formik.errors.jop && <p className="text-xs text-red-600 mt-1">{formik.errors.jop}</p>}
          </div>

          {/* position (المركز) */}
          <div>
            <label className="block text-sm mb-1">المركز</label>
            <input
              className="w-full border rounded p-2"
              name="position"
              value={formik.values.position}
              onChange={formik.handleChange}
            />
            {formik.errors.position && <p className="text-xs text-red-600 mt-1">{formik.errors.position}</p>}
          </div>


          {/* game */}
          <div>
            <label className="block text-sm mb-1">اللعبة</label>
            <input
              className="w-full border rounded p-2"
              name="game"
              value={formik.values.game}
              onChange={formik.handleChange}
            />
            {formik.errors.game && <p className="text-xs text-red-600 mt-1">{formik.errors.game}</p>}
          </div>


          {/* isActive */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={Boolean(formik.values.isActive)}
              onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm">نشط</label>
          </div>

          {/* footer */}
          <div className="pt-4 flex items-center gap-4">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            )}
            <button
              type="button"
              onClick={async () => {
                const errors = await formik.validateForm();
                if (Object.keys(errors).length) {
                  const first = Object.keys(errors)[0];
                  toast.error(errors[first] || "يرجى مراجعة الحقول");
                  return;
                }
                formik.submitForm();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={formik.isSubmitting}
            >
              حفظ التغييرات
            </button>
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">
              رجوع
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
