'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, XCircle, Users, Copy,
  Shield, Smartphone, Mail, RefreshCw, Power, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
const endpointOne   = (id) => `${BASE}/users/${id}`;
const endpointPatch = (id) => `${BASE}/users/${id}`;
const endpointDel   = (id) => `${BASE}/users/${id}`;

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false); // for actions

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
      setError('تعذر جلب بيانات المستخدم. تحقق من الـ BASE_URL أو التوكن.');
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');

  const Copyable = ({ label, value }) => {
    const onCopy = async () => {
      try { await navigator.clipboard.writeText(String(value ?? '')); } catch {}
    };
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-sm font-mono break-all text-gray-800">{value ?? '-'}</div>
        </div>
        <button onClick={onCopy} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="نسخ">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const Chip = ({ ok, trueText = 'نعم', falseText = 'لا' }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
      ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}>
      {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {ok ? trueText : falseText}
    </span>
  );

  // ===== Actions =====
  const doToggleActive = async () => {
    if (!user?._id) return;
    setBusy(true);
    try {
      // optimistic
      const nextActive = !user.isActive;
      setUser((u) => ({ ...u, isActive: nextActive }));
      const res = await fetch(endpointPatch(user._id), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // re-fetch to stay in sync with backend
      await fetchUser();
      alert(nextActive ? 'تم تفعيل المستخدم.' : 'تم تعطيل المستخدم.');
    } catch (e) {
      console.error(e);
      // revert optimistic if failed
      setUser((u) => (u ? { ...u, isActive: !u.isActive } : u));
      alert('تعذر تعديل حالة المستخدم.');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!user?._id) return;
  
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن يمكنك التراجع عن هذا الإجراء بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    });
  
    if (!result.isConfirmed) return;
  
    setBusy(true);
    try {
      const res = await fetch(endpointDel(user._id), {
        method: 'DELETE',
        headers: headers(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
      await Swal.fire({
        title: 'تم الحذف!',
        text: 'تم حذف المستخدم بنجاح.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
  
      router.push('/'); // أو '/users' حسب مسارك
    } catch (e) {
      console.error(e);
      await Swal.fire({
        title: 'خطأ',
        text: 'تعذر حذف المستخدم. حاول مرة أخرى.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setBusy(false);
    }
  };

  // ===== UI =====
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        </div>
        <p className="text-blue-600">جاري التحميل…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        </div>
        <p className="text-red-600">{error || 'لا توجد بيانات.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || '—'}</h1>
              <p className="text-gray-600 text-sm">ملف المستخدم</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUser}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>

          <button
            onClick={doToggleActive}
            disabled={busy}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white ${
              user.isActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={user.isActive ? 'تعطيل' : 'تفعيل'}
          >
            <Power className="w-4 h-4" />
            {user.isActive ? 'تعطيل' : 'تفعيل'}
          </button>

          <button
            onClick={doDelete}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="حذف المستخدم"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">الدور</div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="font-semibold">
              {user.role === 'admin' ? 'مدير' : user.role === 'editor' ? 'محرر' : 'مستخدم'}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">الإيميل</div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{user.email || '-'}</span>
            <Chip ok={!!user.isEmailVerified} trueText="محقق" falseText="غير محقق" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">الهاتف</div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{user.phone || '-'}</span>
            <Chip ok={!!user.isPhoneVerified} trueText="محقق" falseText="غير محقق" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">البيانات الأساسية</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">المعرف:</span><span className="font-mono">{user._id}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">الاسم:</span><span>{user.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">الحالة:</span><Chip ok={!!user.isActive} trueText="نشط" falseText="غير نشط" /></div>
            <div className="flex justify-between"><span className="text-gray-600">آخر تسجيل دخول:</span><span className="text-gray-800">{fmt(user.lastLogin)}</span></div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">التحقق</h2>
          <div className="space-y-3">
            <Copyable label="رمز تحقق الإيميل" value={user.emailVerificationToken} />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">انتهاء صلاحية تحقق الإيميل</div>
                <div className="text-sm text-gray-800">{fmt(user.emailVerificationExpires)}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">رمز تحقق الهاتف (OTP)</div>
                <div className="text-sm font-mono break-all text-gray-800">{user.phoneVerificationOTP || '-'}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">انتهاء صلاحية تحقق الهاتف</div>
                <div className="text-sm text-gray-800">{fmt(user.phoneVerificationExpires)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">تفاصيل إضافية</h2>
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">السيرة الذاتية</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{user.bio || '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</div>
                <div className="text-sm text-gray-800">{fmt(user.createdAt)}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">آخر تحديث</div>
                <div className="text-sm text-gray-800">{fmt(user.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug */}
      <div className="text-xs text-gray-400 mt-6">
        مصدر البيانات: <code className="font-mono">{endpointOne(id)}</code>
      </div>
    </div>
  );
}
