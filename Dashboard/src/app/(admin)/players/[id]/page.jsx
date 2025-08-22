'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  ArrowRight,
  Mail,
  Phone,
  Globe,
  User2,
  Shield,
  BadgeCheck,
  Calendar,
  DollarSign,
  PlayCircle,
  FileText,
  Eye,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ====== API ENDPOINTS (ثابتة وصحيحة) ======
const API_ROOT  = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_BASE = `${API_ROOT}/admin`;

const endpointOne  = (id) => `${ADMIN_BASE}/players/${id}`;           // GET لاعب
const epConfirm    = (id) => `${ADMIN_BASE}/players/${id}/confirm`;   // PATCH { isConfirmed }
const epActive     = (id) => `${ADMIN_BASE}/players/${id}/active`;    // PATCH { isActive }
const epPromote    = (id) => `${ADMIN_BASE}/players/${id}/promote`;   // PATCH { status, startDate?, endDate?, type? }

// ====== Toast عام ======
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

// ====== استخراج رسالة خطأ من الباك ======
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

// ====== Utilities ======
const isCurrentlyPromoted = (promo) => {
  if (!promo || typeof promo !== 'object' || !promo.status) return false;
  const end = promo.endDate ? new Date(promo.endDate) : null;
  return !end || end > new Date();
};

function deriveStatus(p) {
  const raw = (p?.status || '').toLowerCase(); // available | transferred | contracted
  const tStart = p?.transferredTo?.startDate ? new Date(p.transferredTo.startDate) : null;
  if (tStart) {
    const days = (Date.now() - tStart.getTime()) / 86400000;
    return days <= 30 ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  if (p?.contractEndDate && new Date(p.contractEndDate) > new Date()) return 'contracted';
  return 'available';
}
const statusLabel = (s) => ({
  available: 'متاح',
  contracted: 'متعاقد',
  transferred: 'مُنْتَقَل',
  recently_transferred: 'منتقل حديثًا',
}[s] || s);
const statusClass = (s) => ({
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  contracted: 'bg-purple-100 text-purple-700 border-purple-200',
  transferred: 'bg-amber-100 text-amber-700 border-amber-200',
  recently_transferred: 'bg-blue-100 text-blue-700 border-blue-200',
}[s] || 'bg-gray-100 text-gray-700 border-gray-200');

const GenderBadge = ({ gender }) => {
  const g = (gender || '').toLowerCase();
  const isMale = g === 'male' || g === 'ذكر';
  const cls = isMale ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-pink-100 text-pink-700 border-pink-200';
  const symbol = isMale ? '♂' : '♀';
  const label = isMale ? 'ذكر' : 'أنثى';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <span className="leading-none">{symbol}</span>
      {label}
    </span>
  );
};

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('ar-EG') : '—'; }
function fmtMoney(obj) { return obj?.amount ? `${obj.amount.toLocaleString('ar-EG')} ${obj.currency || ''}` : '—'; }
const hasText = (s) => typeof s === 'string' && s.trim().length > 0;

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [player, setPlayer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const headers = React.useCallback(() => {
  let token = null;

if (typeof window !== 'undefined') {
  token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
}

    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const fetchPlayer = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(endpointOne(id), { headers: headers(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setPlayer(null);
        return;
      }
      const json = await res.json();
      const p = json?.data?.player ?? json?.data ?? null;
      setPlayer(p);
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر جلب بيانات اللاعب' });
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => { fetchPlayer(); }, [fetchPlayer]);

  // ====== Actions — تستخدم المسارات الصحيحة ======
  const toggleConfirmed = async () => {
    if (!player?._id) return;
    setBusy(true);
    const next = !Boolean(player.isConfirmed);
    try {
      setPlayer((p) => ({ ...p, isConfirmed: next })); // optimistic
      const res = await fetch(epConfirm(player._id), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ isConfirmed: next }),
      });
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم التأكيد' : 'تم إلغاء التأكيد' });
      await fetchPlayer();
    } catch (e) {
      setPlayer((p) => (p ? { ...p, isConfirmed: !next } : p)); // revert
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل حالة التأكيد' });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async () => {
    if (!player?._id) return;
    setBusy(true);
    const next = !Boolean(player.isActive);
    try {
      setPlayer((p) => ({ ...p, isActive: next })); // optimistic
      const res = await fetch(epActive(player._id), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم تفعيل الحساب' : 'تم التعطيل' });
      await fetchPlayer();
    } catch (e) {
      setPlayer((p) => (p ? { ...p, isActive: !next } : p)); // revert
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل حالة الحساب' });
    } finally {
      setBusy(false);
    }
  };

  const togglePromoted = async () => {
    if (!player?._id) return;
    setBusy(true);
    const was = Boolean(player?.isPromoted?.status);
    const next = !was;

    const current = player.isPromoted || {};
    const payload = {
      status: next,
      startDate: next ? (current.startDate || new Date().toISOString()) : (current.startDate ?? null),
      endDate: next ? (current.endDate ?? null) : (current.endDate ?? null),
      type: current.type ?? 'featured',
    };

    try {
      setPlayer((p) => ({ ...p, isPromoted: { ...payload } })); // optimistic
      const res = await fetch(epPromote(player._id), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await extractBackendError(res));
      await Toast.fire({ icon: 'success', title: next ? 'تم الترويج' : 'تم إلغاء الترويج' });
      await fetchPlayer();
    } catch (e) {
      setPlayer((p) => (p ? { ...p, isPromoted: player.isPromoted } : p)); // revert to previous
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تعديل الترويج' });
    } finally {
      setBusy(false);
    }
  };

  // ====== Render ======
  if (loading) return <div className="p-6 text-blue-600" dir="rtl">جارٍ التحميل…</div>;
  if (!player) {
    return (
      <div className="p-6" dir="rtl">
        <div className="text-red-600 mb-4">لا توجد بيانات لعرضها.</div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>
      </div>
    );
  }

  const promoted = isCurrentlyPromoted(player.isPromoted);
  const st = deriveStatus(player);
  const profURL = player?.media?.profileImage?.url || '';
  const coverURL = profURL || (player?.media?.images?.[0]?.url || '');

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Cover / Hero */}
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
                        alt={player?.name || player?.user?.name || 'player'}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 ring-4 ring-white shadow-xl flex items-center justify-center text-white text-3xl font-bold">
                        {(player?.name || player?.user?.name || 'PL').split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase()}
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {player?.name || player?.user?.name || '—'}
                    </h1>

                    {/* نشط/غير نشط */}
                    {player?.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <BadgeCheck className="w-3.5 h-3.5" /> نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        غير نشط
                      </span>
                    )}

                    {/* مؤكد/غير مؤكد */}
                    {player?.isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                        <CheckCircle className="w-3.5 h-3.5" /> مؤكَّد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        <XCircle className="w-3.5 h-3.5" /> غير مؤكد
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>{player?.roleType || '—'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 border border-gray-200 text-gray-700">
                      {player?.position || '—'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 border border-indigo-200 text-indigo-700">
                      {player?.game || '—'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <GenderBadge gender={player?.gender} />
                    <span className="text-gray-300">•</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClass(deriveStatus(player))}`}>
                      {statusLabel(deriveStatus(player))}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={toggleConfirmed}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full ${player.isConfirmed ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  title={player.isConfirmed ? 'إلغاء التأكيد' : 'تأكيد'}
                >
                  {player.isConfirmed ? 'إلغاء التأكيد' : 'تأكيد'}
                </button>

                <button
                  onClick={toggleActive}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full ${player.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  title={player.isActive ? 'تعطيل ظهور اللاعب' : 'تفعيل ظهور اللاعب'}
                >
                  {player.isActive ? 'تعطيل ظهور اللاعب' : 'تفعيل ظهور اللاعب'}
                </button>

                <button
                  onClick={togglePromoted}
                  disabled={busy}
                  className={`px-3 py-2 text-sm rounded-lg text-white w-full ${isCurrentlyPromoted(player.isPromoted) ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  title={isCurrentlyPromoted(player.isPromoted) ? 'إلغاء الترويج' : 'ترويج'}
                >
                  {isCurrentlyPromoted(player.isPromoted) ? 'إلغاء الترويج' : 'ترويج'}
                </button>

                <button
                  onClick={() => router.push(`/players/update/${player._id}`)}
                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full"
                >
                  تعديل
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 w-full"
                >
                  <ArrowRight className="inline w-4 h-4" /> رجوع
                </button>
              </div>
            </div>
            
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-4 sm:p-6 border-t border-gray-100">
            {/* عمود 1 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">البيانات الأساسية</h2>
              <div className="space-y-3">
                <Info icon={<Mail className="w-4 h-4" />} label="البريد" value={player?.user?.email || player?.contactInfo?.email || '—'} />
                <Info icon={<Phone className="w-4 h-4" />} label="الهاتف" value={player?.contactInfo?.phone || '—'} trailing={player?.contactInfo?.isHidden ? <span className="text-[11px] text-gray-500">مخفي</span> : null} />
                <Info icon={<Globe className="w-4 h-4" />} label="الجنسية" value={player?.nationality || '—'} />
                <Info icon={<User2 className="w-4 h-4" />} label="العمر" value={player?.age ?? '—'} />
                <Info icon={<Calendar className="w-4 h-4" />} label="تاريخ الإنشاء" value={fmtDate(player?.createdAt)} />
                <Info icon={<Calendar className="w-4 h-4" />} label="آخر تحديث" value={fmtDate(player?.updatedAt)} />
                <Info icon={<BadgeCheck className="w-4 h-4" />} label="مؤكَّد؟" value={player?.isConfirmed ? 'نعم' : 'لا'} />
              </div>
            </div>

            {/* عمود 2 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">العقد والانتقال</h2>
              <div className="space-y-3">
                <Info icon={<DollarSign className="w-4 h-4" />} label="الراتب الشهري" value={fmtMoney(player?.monthlySalary)} />
                <Info icon={<DollarSign className="w-4 h-4" />} label="الراتب السنوي" value={fmtMoney(player?.yearSalary)} />
                <Info icon={<Calendar className="w-4 h-4" />} label="نهاية العقد" value={fmtDate(player?.contractEndDate)} />
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">بيانات الانتقال</div>
                  {player?.transferredTo?.club ? (
                    <div className="text-sm text-gray-800 space-y-1">
                      <div>النادي: <span className="font-medium">{player.transferredTo.club}</span></div>
                      <div>تاريخ البدء: {fmtDate(player.transferredTo.startDate)}</div>
                      <div>تاريخ الانتهاء: {fmtDate(player.transferredTo.endDate)}</div>
                      <div>القيمة: {player.transferredTo.amount ? player.transferredTo.amount.toLocaleString('ar-EG') : '—'}</div>
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
                {/* وكيل اللاعب */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">وكيل اللاعب</div>
                  {player?.contactInfo?.agent?.name || player?.contactInfo?.agent?.phone || player?.contactInfo?.agent?.email ? (
                    <div className="text-sm text-gray-800 space-y-1">
                      <div>الاسم: {player.contactInfo.agent.name || '—'}</div>
                      <div>الهاتف: {player.contactInfo.agent.phone || '—'}</div>
                      <div>البريد: {player.contactInfo.agent.email || '—'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">لا يوجد بيانات للوكيل</div>
                  )}
                </div>

                {/* وسائط */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">وسائط</div>

                  {player?.media?.video?.url ? (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <PlayCircle className="w-4 h-4 text-indigo-600" />
                        <span>فيديو تعريفي</span>
                      </div>
                      <video src={player.media.video.url} controls className="w-full rounded-lg border border-gray-200" />
                    </div>
                  ) : null}

                  {player?.media?.document?.url ? (
                    <div className="mb-3">
                      <a
                        href={player.media.document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm"
                      >
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span>{player.media.document.title || 'مستند'}</span>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <span>الصور</span>
                    </div>
                    {Array.isArray(player?.media?.images) && player.media.images.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {player.media.images
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
