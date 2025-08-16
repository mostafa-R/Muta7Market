'use client';

import React from 'react';
import { Formik, Form, Field } from 'formik';
import Joi from 'joi';
import Swal from 'sweetalert2';
import {
  UserPlus, User as UserIcon, Mail, Phone, Shield,
  Lock, Eye, EyeOff, RotateCcw
} from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
const CREATE_ENDPOINT = `${BASE}/users`;

// ------ Joi Schema ------
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
  role: Joi.string().valid('user', 'admin', 'editor').default('user'),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'كلمة المرور مطلوبة',
    'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'كلمتا المرور غير متطابقتين',
    'any.required': 'تأكيد كلمة المرور مطلوب',
  }),
  isActive: Joi.boolean().default(true),
  // visual only; backend auto-sets email/phone verification true
  isVerified: Joi.boolean().default(true),
});


async function extractBackendError(res) {
  const ct = res.headers.get('content-type') || '';
  let body;

  try {
    if (ct.includes('application/json')) {
      body = await res.json();
    } else {
      const text = await res.text();
      try { body = JSON.parse(text); } catch { return text || `HTTP ${res.status} ${res.statusText}`; }
    }
  } catch {
    return `HTTP ${res.status} ${res.statusText}`;
  }

  // Common message locations
  const direct =
    body?.message ||
    body?.error?.message ||
    body?.error ||
    body?.msg ||
    body?.title;

  // Array style: [{ msg/message, path }]
  if (Array.isArray(body?.errors)) {
    const lines = body.errors.map(e =>
      e?.message || e?.msg || (e?.path ? `${e.path}: ${e?.message || 'Invalid'}` : JSON.stringify(e))
    );
    return lines.join('<br/>');
  }

  // Mongoose validation object: { errors: { field: { message } } }
  if (body?.errors && typeof body.errors === 'object') {
    const lines = Object.values(body.errors).map(e => e?.message || JSON.stringify(e));
    if (lines.length) return lines.join('<br/>');
  }

  return direct || `HTTP ${res.status} ${res.statusText}`;
}
// convert Joi errors -> Formik { field: message }
function validateWithJoi(values) {
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};
  const formikErrors = {};
  for (const d of error.details) {
    const key = d.path[0];
    if (!formikErrors[key]) formikErrors[key] = d.message;
  }
  return formikErrors;
}

export default function CreateUserPage() {
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const headers = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    customClass: { container: 'my-toast-under-navbar' },
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
  });

  const onSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role || 'user',
        password: values.password,
        isActive: values.isActive,
      };
  
      const res = await fetch(CREATE_ENDPOINT, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      });
  
      // If the request failed, read and show the backend error
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg }); // html -> supports multi-line errors
        return;
      }
  
      // Success: now it's safe to parse once
      const data = await res.json().catch(() => null);
      const created = data?.data ?? data;
      const title = data?.message || 'تم إنشاء المستخدم بنجاح';
  
      // Optional: append useful detail (email) if present
      const detail = created?.email ? ` (${created.email})` : '';
      await Toast.fire({ icon: 'success', title: `${title}${detail}` });
  
      resetForm();
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'حدث خطأ غير متوقع' });
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen   py-6 px-4">
      <div className="w-9/12 mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-4 shadow-lg">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء مستخدم جديد</h1>
          <p className="text-gray-600 text-sm">املأ البيانات التالية لإضافة مستخدم جديد</p>
        </div>

        <Formik
          initialValues={{
            name: '',
            email: '',
            phone: '',
            role: 'user',
            password: '',
            confirmPassword: '',
            isActive: true,
            isVerified: true, // visual only
          }}
          validate={validateWithJoi}
          onSubmit={onSubmit}
          validateOnBlur
          validateOnChange={false}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit, setFieldValue, resetForm }) => (
            <Form
              onSubmit={handleSubmit}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="p-6 space-y-5">
                {/* Name — FULL WIDTH */}
                <div className="space-y-2">
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    الاسم الكامل *
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    onChange={handleChange}
                    value={values.name}
                    placeholder="أدخل الاسم الكامل"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none dark:text-white ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email — FULL WIDTH */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Mail className="w-4 h-4 text-blue-600" />
                    البريد الإلكتروني *
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={values.email}
                    placeholder="example@email.com"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none dark:text-white ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <Phone className="w-4 h-4 text-blue-600" />
                      رقم الهاتف *
                    </label>
                    <Field
                      id="phone"
                      name="phone"
                      type="tel"
                      onChange={handleChange}
                      value={values.phone}
                      placeholder="+201234567890"
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none dark:text-white ${
                        errors.phone
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <Shield className="w-4 h-4 text-blue-600" />
                      نوع المستخدم
                    </label>
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      onChange={handleChange}
                      value={values.role}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="user">مستخدم</option>
                      <option value="admin">مدير</option>
                      <option value="editor">محرر</option>
                    </Field>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <Lock className="w-4 h-4 text-blue-600" />
                      كلمة المرور *
                    </label>
                    <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <Field
                        id="password"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        onChange={handleChange}
                        value={values.password}
                        placeholder="كلمة مرور"
                        className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:ring-2 focus:outline-none dark:text-white ${
                          errors.password
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                        }`}
                      />
                      
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <Lock className="w-4 h-4 text-blue-600" />
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        onChange={handleChange}
                        value={values.confirmPassword}
                        placeholder="أعد إدخال كلمة المرور"
                        className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:ring-2 focus:outline-none dark:text-white ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* isActive */}
                  <div className="flex items-center justify-between  border border-gray-200 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">حالة الحساب</div>
                      <div className="text-xs text-gray-500">تفعيل/تعطيل المستخدم</div>
                    </div>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={values.isActive}
                        onChange={(e) => setFieldValue('isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 relative transition">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>

                  {/* isVerified (visual only) */}
                  <div className="flex items-center justify-between  border border-gray-200 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">موثق</div>
                      <div className="text-xs text-gray-500">حقل مرئي فقط — الخادم يفعّل التحقق تلقائيًا</div>
                    </div>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={values.isVerified}
                        onChange={(e) => setFieldValue('isVerified', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 relative transition">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100  dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md transition disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isSubmitting ? 'جاري الحفظ…' : 'إنشاء'}
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
