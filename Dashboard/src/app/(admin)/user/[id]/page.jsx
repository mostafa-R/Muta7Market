'use client';

import {
  ArrowRight,
  CheckCircle,
  Copy,
  Image as ImageIcon,
  Mail,
  Power,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

function apiBase() {
  const root = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1')
    .replace(/\/$/, '');
  return `${root}/admin`; 
}

const BASE = apiBase();

const endpointOne = (id) => `${BASE}/users/${id}`;
const endpointDel = (id) => `${BASE}/users/${id}`;
const endpointVerify = (id) => `${BASE}/users/${id}/email-verified`;


export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const headers = React.useCallback(() => {
let token = null;

if (typeof window !== 'undefined') {
  token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
}
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
      const url = endpointOne(id);
      const res = await fetch(url, { headers: headers(), cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json?.data ?? {};
      const u = data.user ?? data;
      if (!u || !u._id) throw new Error('Data shape unexpected');
      setUser(u);
    } catch (e) {
      console.error('fetchUser error', e);
      setError('تعذر جلب بيانات المستخدم. تحقق من قيمة NEXT_PUBLIC_BASE_URL أو التوكن أو صلاحياتك.');
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const arLocale = 'ar-EG';
  const fmt = (d) => (d ? new Date(d).toLocaleString(arLocale, { hour12: false }) : '—');

  const Copyable = ({ label, value }) => {
    const onCopy = async () => {
      try {
        await navigator.clipboard.writeText(String(value ?? ''));
      } catch {}
    };
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="text-sm font-mono break-all text-gray-800">{value ?? '—'}</div>
        </div>
        <button onClick={onCopy} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="نسخ">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const Chip = ({ ok, trueText = 'نعم', falseText = 'لا' }) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
        ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {ok ? trueText : falseText}
    </span>
  );

  const doToggleEmailVerified = async () => {
    if (!user?._id) return;
    setBusy(true);
    const nextValue = !user.isEmailVerified;
    setUser((u) => ({ ...u, isEmailVerified: nextValue })); // optimistic
    try {
      const res = await fetch(endpointVerify(user._id), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ isEmailVerified: nextValue }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchUser();
      await Swal.fire({
        title: nextValue ? 'تم التفعيل (الإيميل محقق)' : 'تم التعطيل (الإيميل غير محقق)',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error('verify email toggle error =>', e);
      setUser((u) => (u ? { ...u, isEmailVerified: !u.isEmailVerified } : u)); // revert
      await Swal.fire({ title: 'خطأ', text: 'تعذر تعديل حالة تحقق الإيميل.', icon: 'error' });
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
      const res = await fetch(endpointDel(user._id), { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await Swal.fire({ title: 'تم الحذف!', icon: 'success' });
      router.push('/user/table'); // غيّرها لمسار جدولك الفعلي إن لزم
    } catch (e) {
      console.error(e);
      await Swal.fire({ title: 'خطأ', text: 'تعذر حذف المستخدم. حاول مرة أخرى.', icon: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // ===== UI =====
  if (loading) {
    return (
      <div className="p-6" dir="rtl">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50">
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        </div>
        <p className="text-blue-600">جاري التحميل…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6" dir="rtl">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50">
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        </div>
        <p className="text-red-600">{error || 'لا توجد بيانات.'}</p>
        <div className="text-xs text-gray-400 mt-2">URL: <code className="font-mono">{endpointOne(id)}</code></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-gray-50">
            <ArrowRight className="w-4 h-4" />
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
          <button onClick={fetchUser} disabled={busy} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700" title="تحديث">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button
            onClick={doToggleEmailVerified}
            disabled={busy}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white ${
              user.isEmailVerified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={user.isEmailVerified ? 'تعطيل تحقق الإيميل' : 'تفعيل تحقق الإيميل'}
          >
            <Power className="w-4 h-4" />
            {user.isEmailVerified ? 'تعطيل' : 'تفعيل'}
          </button>


          <button onClick={doDelete} disabled={busy} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white" title="حذف المستخدم">
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>

      {/* أعلى الصفحة: صورة وبيانات سريعة */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name || 'user'} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">الدور</div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">{user.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">الحالة</div>
              <Chip ok={!!user.isEmailVerified} trueText="محقق" falseText="غير محقق" />

            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">آخر دخول</div>
              <div className="text-sm text-gray-800">{fmt(user.lastLogin)}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">إنشاء الحساب</div>
              <div className="text-sm text-gray-800">{fmt(user.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">معلومات التواصل</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600" /><span className="font-semibold">{user.email || '—'}</span><Chip ok={!!user.isEmailVerified} trueText="محقق" falseText="غير محقق" /></div>
            <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-green-600" /><span className="font-semibold">{user.phone || '—'}</span><Chip ok={!!user.isPhoneVerified} trueText="محقق" falseText="غير محقق" /></div>
          </div>
        </div>

        {/* 2 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">التحقق</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">OTP تحقق الهاتف</div>
                <div className="text-sm font-mono break-all text-gray-800">{user.phoneVerificationOTP || '—'}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">انتهاء صلاحية تحقق الهاتف</div>
                <div className="text-sm text-gray-800">{fmt(user.phoneVerificationExpires)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">تفاصيل إضافية</h2>
          <div className="space-y-3">
            <Copyable label="المعرّف" value={user._id} />
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">السيرة الذاتية</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{user.bio || '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">آخر تحديث</div>
                <div className="text-sm text-gray-800">{fmt(user.updatedAt)}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">آخر دخول</div>
                <div className="text-sm text-gray-800">{fmt(user.lastLogin)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
