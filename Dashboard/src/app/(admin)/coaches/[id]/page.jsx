// app/(admin)/coaches/[id]/page.jsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  ArrowRight, Mail, Phone, Globe, User2, Shield, BadgeCheck,
  Calendar, DollarSign, PlayCircle, FileText, Eye, Star,
  CheckCircle, XCircle
} from 'lucide-react';

/** ===== API BASES ===== */
const API_ROOT   = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_BASE = `${API_ROOT}/admin`;

/** ===== Endpoints ===== */
const epGetOne     = (id) => `${ADMIN_BASE}/players/${id}`;          // GET (coach is same model)
const epConfirm    = (id) => `${ADMIN_BASE}/players/${id}/confirm`;  // PATCH { isConfirmed }
const epActive     = (id) => `${ADMIN_BASE}/players/${id}/active`;   // PATCH { isActive }
const epPromote    = (id) => `${ADMIN_BASE}/players/${id}/promote`;  // PATCH { status, ... }
const epPutUpdate  = (id) => `${ADMIN_BASE}/players/${id}`;          // PUT fallback

/** ===== Toast ===== */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

/** ===== Helpers ===== */
async function extractBackendError(res) {
  const ct = res.headers.get('content-type') || '';
  try {
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const data = typeof body === 'string' ? (() => { try { return JSON.parse(body); } catch { return { message: body }; } })() : body;
    if (Array.isArray(data?.errors)) return data.errors.map(e => e?.message || e?.msg || JSON.stringify(e)).join('<br/>');
    if (data?.errors && typeof data.errors === 'object') return Object.values(data.errors).map(e => e?.message || JSON.stringify(e)).join('<br/>');
    return data?.message || data?.error?.message || data?.error || data?.msg || `HTTP ${res.status} ${res.statusText}`;
  } catch {
    return `HTTP ${res.status} ${res.statusText}`;
  }
}
const fmtDate  = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '—');
const fmtMoney = (m) => (m?.amount ? `${Number(m.amount).toLocaleString('ar-EG')} ${m.currency || ''}` : '—');
const hasText  = (s) => typeof s === 'string' && s.trim().length > 0;

const isCurrentlyPromoted = (promo) => {
  if (!promo || typeof promo !== 'object' || !promo.status) return false;
  const end = promo.endDate ? new Date(promo.endDate) : null;
  return !end || end > new Date();
};

function deriveStatus(p) {
  const raw = (p?.status || '').toLowerCase();
  const tStart = p?.transferredTo?.startDate ? new Date(p.transferredTo.startDate) : null;
  if (tStart) {
    const days = (Date.now() - tStart.getTime()) / 86400000;
    return days <= 30 ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  if (p?.contractEndDate && new Date(p.contractEndDate) > new Date()) return 'contracted';
  return 'available';
}
const statusLabel = (s) => ({ available:'متاح', contracted:'متعاقد', transferred:'مُنْتَقَل', recently_transferred:'منتقل حديثًا' }[s] || s);
const statusClass = (s) => ({
  available:'bg-emerald-100 text-emerald-700 border-emerald-200',
  contracted:'bg-purple-100 text-purple-700 border-purple-200',
  transferred:'bg-amber-100 text-amber-700 border-amber-200',
  recently_transferred:'bg-blue-100 text-blue-700 border-blue-200',
}[s] || 'bg-gray-100 text-gray-700 border-gray-200');

const GenderBadge = ({ gender }) => {
  const g = (gender || '').toLowerCase();
  const isMale = g === 'male' || g === 'ذكر';
  const cls = isMale ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-pink-100 text-pink-700 border-pink-200';
  const symbol = isMale ? '♂' : '♀';
  const label  = isMale ? 'ذكر' : 'أنثى';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <span className="leading-none">{symbol}</span>{label}
    </span>
  );
};

export default function CoachProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [coach, setCoach] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const headers = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const fetchCoach = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(epGetOne(id), { headers: headers(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setCoach(null);
      } else {
        const json = await res.json();
        const p = json?.data?.player ?? json?.data ?? null; // same model
        setCoach(p);
      }
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر جلب بيانات المدرب' });
      setCoach(null);
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => { fetchCoach(); }, [fetchCoach]);

  // ----- Fallback PUT (if PATCH route not found) -----
  const putUpdate = async (payload) => {
    const res = await fetch(epPutUpdate(coach._id), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await extractBackendError(res));
    return res.json().catch(() => null);
  };

  // ----- Toggles -----
  const toggleConfirmed = async () => {
    if (!coach?._id) return;
    setBusy(true);
    const next = !Boolean(coach.isConfirmed);
    try {
      setCoach((p) => ({ ...p, isConfirmed: next })); // optimistic
      let res = await fetch(epConfirm(coach._id), {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ isConfirmed: next })
      });
      if (res.status === 404) { // fallback
        await putUpdate({ isConfirmed: next }); res = { ok: true };
      }
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم التأكيد' : 'تم إلغاء التأكيد' });
      await fetchCoach();
    } catch (e) {
      console.error(e);
      setCoach((p) => (p ? { ...p, isConfirmed: !next } : p));
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل حالة التأكيد' });
    } finally { setBusy(false); }
  };

  const toggleActive = async () => {
    if (!coach?._id) return;
    setBusy(true);
    const next = !Boolean(coach.isActive);
    try {
      setCoach((p) => ({ ...p, isActive: next })); // optimistic
      let res = await fetch(epActive(coach._id), {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ isActive: next })
      });
      if (res.status === 404) { await putUpdate({ isActive: next }); res = { ok: true }; }
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم تفعيل الحساب' : 'تم التعطيل' });
      await fetchCoach();
    } catch (e) {
      console.error(e);
      setCoach((p) => (p ? { ...p, isActive: !next } : p));
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل حالة الحساب' });
    } finally { setBusy(false); }
  };

  const togglePromoted = async () => {
    if (!coach?._id) return;
    setBusy(true);
    const was = isCurrentlyPromoted(coach.isPromoted);
    const next = !was;
    const current = coach.isPromoted || {};
    const body = { status: next, startDate: next ? (current.startDate || new Date().toISOString()) : (current.startDate ?? null), endDate: next ? (current.endDate ?? null) : (current.endDate ?? null), type: current.type ?? 'featured' };

    try {
      setCoach((p) => ({ ...p, isPromoted: { ...body } })); // optimistic
      let res = await fetch(epPromote(coach._id), {
        method: 'PATCH', headers: headers(), body: JSON.stringify(body)
      });
      if (res.status === 404) { await putUpdate({ isPromoted: { ...body } }); res = { ok: true }; }
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم الترويج' : 'تم إلغاء الترويج' });
      await fetchCoach();
    } catch (e) {
      console.error(e);
      setCoach((p) => (p ? { ...p, isPromoted: coach.isPromoted } : p));
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل الترويج' });
    } finally { setBusy(false); }
  };

  // ----- UI -----
  if (loading) return <div className="p-6 text-blue-600" dir="rtl">جارٍ التحميل…</div>;

  if (!coach) {
    return (
      <div className="p-6" dir="rtl">
        <div className="text-red-600 mb-4">لا توجد بيانات لعرضها.</div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>
      </div>
    );
  }

  const st         = deriveStatus(coach);
  const promoted   = isCurrentlyPromoted(coach.isPromoted);
  const profURL    = coach?.media?.profileImage?.url || '';
  const coverURL   = profURL || (coach?.media?.images?.[0]?.url || '');
  const fullName   = coach?.name || coach?.user?.name || '—';

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Cover */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-8/12 mx-auto overflow-hidden">
        {coverURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverURL} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="-mt-14 sm:-mt-16">
                  <div className="relative">
                    {profURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profURL}
                        alt={fullName}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 ring-4 ring-white shadow-xl flex items-center justify-center text-white text-3xl font-bold">
                        {fullName.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase()}
                      </div>
                    )}
                    {promoted && (
                      <span className="absolute -bottom-2 -left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full shadow">
                        <Star className="w-3.5 h-3.5 inline mr-1" /> مروّج
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{fullName}</h1>

                    {/* Active */}
                    {coach?.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <BadgeCheck className="w-3.5 h-3.5" /> نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        غير نشط
                      </span>
                    )}

                    {/* Confirmed */}
                    {coach?.isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                        <CheckCircle className="w-3.5 h-3.5" /> مؤكد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        <XCircle className="w-3.5 h-3.5" /> غير مؤكد
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>{coach?.roleType || '—'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 border border-indigo-200 text-indigo-700">
                      {coach?.game || '—'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <GenderBadge gender={coach?.gender} />
                    <span className="text-gray-300">•</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClass(deriveStatus(coach))}`}>
                      {statusLabel(deriveStatus(coach))}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={toggleConfirmed}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full  ${coach.isConfirmed ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  title={coach.isConfirmed ? 'إلغاء التأكيد' : 'تأكيد'}
                >
                  {coach.isConfirmed ? 'إلغاء التأكيد' : 'تأكيد'}
                </button>

                <button
                  onClick={toggleActive}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full  ${coach.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  title={coach.isActive ? 'تعطيل' : 'تفعيل'}
                >
                  {coach.isActive ? 'تعطيل' : 'تفعيل'}
                </button>

                <button
                  onClick={togglePromoted}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full  ${isCurrentlyPromoted(coach.isPromoted) ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  title={isCurrentlyPromoted(coach.isPromoted) ? 'إلغاء الترويج' : 'ترويج'}
                >
                  {isCurrentlyPromoted(coach.isPromoted) ? 'إلغاء الترويج' : 'ترويج'}
                </button>

                <button
                  onClick={() => router.push(`/coaches/update/${coach._id}`)}
                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full "
                >
                  تعديل
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 w-full "
                >
                  <ArrowRight className="inline w-4 h-4" /> رجوع
                </button>
              </div>
              
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-4 sm:p-6 border-top border-gray-100">
            {/* عمود 1 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">البيانات الأساسية</h2>
              <div className="space-y-3">
                <Info icon={<Mail className="w-4 h-4" />} label="البريد" value={coach?.user?.email || coach?.contactInfo?.email || '—'} />
                <Info icon={<Phone className="w-4 h-4" />} label="الهاتف" value={coach?.contactInfo?.phone || '—'} trailing={coach?.contactInfo?.isHidden ? <span className="text-[11px] text-gray-500">مخفي</span> : null} />
                <Info icon={<Globe className="w-4 h-4" />} label="الجنسية" value={coach?.nationality || '—'} />
                <Info icon={<User2 className="w-4 h-4" />} label="العمر" value={coach?.age ?? '—'} />
                <Info icon={<Calendar className="w-4 h-4" />} label="تاريخ الإنشاء" value={fmtDate(coach?.createdAt)} />
                <Info icon={<Calendar className="w-4 h-4" />} label="آخر تحديث" value={fmtDate(coach?.updatedAt)} />
                <Info icon={<BadgeCheck className="w-4 h-4" />} label="مؤكَّد؟" value={coach?.isConfirmed ? 'نعم' : 'لا'} />
              </div>
            </div>

            {/* عمود 2 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">العقد والحالة</h2>
              <div className="space-y-3">
                <Info icon={<DollarSign className="w-4 h-4" />} label="الراتب الشهري" value={fmtMoney(coach?.monthlySalary)} />
                <Info icon={<DollarSign className="w-4 h-4" />} label="الراتب السنوي" value={fmtMoney(coach?.yearSalary)} />
                <Info icon={<Calendar className="w-4 h-4" />} label="نهاية العقد" value={fmtDate(coach?.contractEndDate)} />
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">بيانات الانتقال</div>
                  {coach?.transferredTo?.club ? (
                    <div className="text-sm text-gray-800 space-y-1">
                      <div>النادي: <span className="font-medium">{coach.transferredTo.club}</span></div>
                      <div>تاريخ البدء: {fmtDate(coach.transferredTo.startDate)}</div>
                      <div>تاريخ الانتهاء: {fmtDate(coach.transferredTo.endDate)}</div>
                      <div>القيمة: {coach.transferredTo.amount ? Number(coach.transferredTo.amount).toLocaleString('ar-EG') : '—'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">لا يوجد انتقالات</div>
                  )}
                </div>
              </div>
            </div>

            {/* عمود 3 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">التواصل والوسائط</h2>

              <div className="space-y-3">
                {/* وكيل */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">وكيل المدرب</div>
                  {coach?.contactInfo?.agent?.name || coach?.contactInfo?.agent?.phone || coach?.contactInfo?.agent?.email ? (
                    <div className="text-sm text-gray-800 space-y-1">
                      <div>الاسم: {coach.contactInfo.agent.name || '—'}</div>
                      <div>الهاتف: {coach.contactInfo.agent.phone || '—'}</div>
                      <div>البريد: {coach.contactInfo.agent.email || '—'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">لا يوجد بيانات للوكيل</div>
                  )}
                </div>

                {/* وسائط */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">وسائط</div>

                  {coach?.media?.video?.url ? (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <PlayCircle className="w-4 h-4 text-indigo-600" />
                        <span>فيديو تعريفي</span>
                      </div>
                      <video src={coach.media.video.url} controls className="w-full rounded-lg border border-gray-200" />
                    </div>
                  ) : null}

                  {coach?.media?.document?.url ? (
                    <div className="mb-3">
                      <a
                        href={coach.media.document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm"
                      >
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span>{coach.media.document.title || 'مستند'}</span>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <span>الصور</span>
                    </div>
                    {Array.isArray(coach?.media?.images) && coach.media.images.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {coach.media.images
                          .filter((img) => hasText(img?.url))
                          .map((img) => (
                            <a key={img.publicId} href={img.url} target="_blank" rel="noreferrer" className="group block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.url}
                                alt={img.title || 'image'}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:opacity-90"
                              />
                            </a>
                          ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">لا يوجد صور</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/** ===== Small UI bits ===== */
function Info({ label, value, icon, trailing }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="text-[11px] text-gray-500 flex items-center gap-1">{icon}{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-1 break-words flex items-center gap-2">
        {value ?? '—'} {trailing}
      </div>
    </div>
  );
}
