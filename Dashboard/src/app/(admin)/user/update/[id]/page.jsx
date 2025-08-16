'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import Joi from 'joi';
import Swal from 'sweetalert2';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
const endpointOne   = (id) => `${BASE}/users/${id}`; // GET by id
const endpointUpdate = (id) => `${BASE}/users/${id}`; // PUT same path

// Toast under navbar (adjust top offset in globals.css below)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  zIndex: 999999,
});

// Joi schema
const schema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'الاسم مطلوب',
    'string.min': 'الاسم يجب أن يكون 3 أحرف على الأقل',
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'البريد الإلكتروني مطلوب',
    'string.email': 'البريد الإلكتروني غير صحيح',
  }),
  phone: Joi.string().trim().pattern(/^\+?\d{9,15}$/).required().messages({
    'string.empty': 'رقم الهاتف مطلوب',
    'string.pattern.base': 'رقم الهاتف غير صحيح (استخدم أرقام فقط وقد يبدأ بـ +)',
  }),
  role: Joi.string().valid('user', 'admin', 'editor').required(),
  isActive: Joi.boolean().required(),
  isEmailVerified: Joi.boolean().required(),
  isPhoneVerified: Joi.boolean().required(),
});

async function extractBackendError(res) {
  const ct = res.headers.get('content-type') || '';
  let body;

  try {
    if (ct.includes('application/json')) body = await res.json();
    else {
      const text = await res.text();
      try { body = JSON.parse(text); } catch { return text || `HTTP ${res.status} ${res.statusText}`; }
    }
  } catch {
    return `HTTP ${res.status} ${res.statusText}`;
  }

  // Common places for error messages
  const direct =
    body?.message ||
    body?.error?.message ||
    body?.error ||
    body?.msg ||
    body?.title;

  // Express-validator / Zod / Joi style arrays
  if (Array.isArray(body?.errors)) {
    const lines = body.errors.map(e =>
      e?.message || e?.msg || (e?.path ? `${e.path}: ${e?.message || 'Invalid'}` : JSON.stringify(e))
    );
    return lines.join('<br/>');
  }

  // Mongoose validation: { errors: { field: { message } } }
  if (body?.errors && typeof body.errors === 'object') {
    const lines = Object.values(body.errors).map((e) => e?.message || JSON.stringify(e));
    if (lines.length) return lines.join('<br/>');
  }

  return direct || `HTTP ${res.status} ${res.statusText}`;
}

function validateWithJoi(values) {
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};
  const errs = {};
  for (const d of error.details) {
    const key = d.path[0];
    if (!errs[key]) errs[key] = d.message;
  }
  return errs;
}

export default function UpdateUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const headers = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchUser = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(endpointOne(id), { headers: headers(), cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const u = json?.data?.user ?? json?.data ?? null;
      setUser(u);
    } catch (e) {
      console.error(e);
      setError('تعذر جلب بيانات المستخدم.');
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => { fetchUser(); }, [fetchUser]);

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        isActive: values.isActive,
        isEmailVerified: values.isEmailVerified,
        isPhoneVerified: values.isPhoneVerified,
      };
  
      const res = await fetch(endpointUpdate(id), {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        // ⛔ we have an error: read and show backend message in the toast
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg }); // use `html` for multiline errors
        return;
      }
  
      // ✅ success branch: now it's safe to read JSON
      const data = await res.json().catch(() => null);
      await Toast.fire({ icon: 'success', title: data?.message || 'تم تحديث المستخدم بنجاح' });
      setUser(data?.data ?? data);
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'حدث خطأ غير متوقع' });
    } finally {
      setSubmitting(false);
    }
  };
  

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">تحديث المستخدم</h1>
        <p className="text-blue-600">جاري التحميل…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">تحديث المستخدم</h1>
        <p className="text-red-600">{error || 'لا توجد بيانات.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen   py-6 px-4">
      <div className="w-9/12 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">تحديث المستخدم</h1>
          <p className="text-gray-600 text-sm">عدّل البيانات ثم احفظ التغييرات</p>
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            role: user?.role || 'user',
            isActive: !!user?.isActive,
            isEmailVerified: !!user?.isEmailVerified,
            isPhoneVerified: !!user?.isPhoneVerified,
          }}
          validate={validateWithJoi}
          validateOnChange={false}
          validateOnBlur={true} // show errors on blur
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Name — FULL WIDTH */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">الاسم الكامل *</label>
                  <Field
                    id="name" name="name" type="text"
                    onChange={handleChange} onBlur={handleBlur} value={values.name}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                      touched.name && errors.name ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                    }`}
                    placeholder="أدخل الاسم الكامل"
                  />
                  {touched.name && errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email — FULL WIDTH */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                  <Field
                    id="email" name="email" type="email"
                    onChange={handleChange} onBlur={handleBlur} value={values.email}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                      touched.email && errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                    }`}
                    placeholder="example@email.com"
                  />
                  {touched.email && errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">رقم الهاتف *</label>
                    <Field
                      id="phone" name="phone" type="tel"
                      onChange={handleChange} onBlur={handleBlur} value={values.phone}
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none ${
                        touched.phone && errors.phone ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                      }`}
                      placeholder="+201234567890"
                    />
                    {touched.phone && errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium text-gray-700">نوع المستخدم</label>
                    <Field
                      as="select" id="role" name="role"
                      onChange={handleChange} onBlur={handleBlur} value={values.role}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400 bg-white"
                    >
                      <option value="user">مستخدم</option>
                      <option value="admin">مدير</option>
                      <option value="editor">محرر</option>
                    </Field>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Toggle
                    label="حالة الحساب"
                    subtitle="تفعيل/تعطيل المستخدم"
                    checked={values.isActive}
                    onChange={(v) => setFieldValue('isActive', v)}
                    color="emerald"
                  />
                  <Toggle
                    label="الإيميل موثق"
                    subtitle="تبديل حالة توثيق البريد"
                    checked={values.isEmailVerified}
                    onChange={(v) => setFieldValue('isEmailVerified', v)}
                    color="indigo"
                  />
                  <Toggle
                    label="الهاتف موثق"
                    subtitle="تبديل حالة توثيق الهاتف"
                    checked={values.isPhoneVerified}
                    onChange={(v) => setFieldValue('isPhoneVerified', v)}
                    color="blue"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الحفظ…' : 'حفظ التغييرات'}
                  </button>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

// Small toggle component
function Toggle({ label, subtitle, checked, onChange, color }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-${color}-500 relative transition`}>
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
        </div>
      </label>
    </div>
  );
}
