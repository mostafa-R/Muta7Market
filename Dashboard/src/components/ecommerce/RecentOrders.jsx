// app/recent/page.jsx
'use client';

import React from 'react';
import {
  Search, ChevronLeft, ChevronRight, Users, ArrowUpDown, ArrowUp, ArrowDown,
  CheckCircle, XCircle, Star, Mail, Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_ROOT  = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_BASE = `${API_ROOT}/admin`;

// ===== Endpoints =====
const ENDPOINTS = {
  listRecent: (queryObj = {}) => {
    const qs = new URLSearchParams(
      Object.entries(queryObj).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return `${ADMIN_BASE}/players/recent?${qs}`;
  },
  confirm: (id) => `${ADMIN_BASE}/players/${id}/confirm`,
};

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

// ---- helpers ----
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

const RECENT_DAYS_DEFAULT = 30;
function deriveStatus(p) {
  const raw = (p.status || '').toLowerCase();
  const tStart = p?.transferredTo?.startDate ? new Date(p.transferredTo.startDate) : null;
  if (tStart) {
    const days = (Date.now() - tStart.getTime()) / 86400000;
    return days <= 30 ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  if (p.contractEndDate && new Date(p.contractEndDate) > new Date()) return 'contracted';
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

export default function RecentUnconfirmedTable() {
  const router = useRouter();

  // server-side pagination & filters
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [query, setQuery] = React.useState('');
  const [jopFilter, setJopFilter] = React.useState('all');          // all | player | coach
  const [activeFilter, setActiveFilter] = React.useState('all');     // all | true | false
  const [promotedFilter, setPromotedFilter] = React.useState('all'); // all | true | false
  const [days, setDays] = React.useState(RECENT_DAYS_DEFAULT);       // recent window

  // client-side sort
  const [sortBy, setSortBy] = React.useState('createdAt'); // createdAt | name | email | nationality | game | age | status | isActive | isPromoted
  const [sortDir, setSortDir] = React.useState('desc');

  // server response
  const [rows, setRows] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [confirmingId, setConfirmingId] = React.useState(null);

  const authHeaders = React.useCallback(() => {
    let token = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    }
    
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const buildQuery = React.useCallback(() => ({
    page, limit: rowsPerPage,
    search: query || undefined,
    jop: jopFilter,
    isActive: activeFilter !== 'all' ? activeFilter : undefined,
    isPromoted: promotedFilter !== 'all' ? promotedFilter : undefined,
    days,
  }), [page, rowsPerPage, query, jopFilter, activeFilter, promotedFilter, days]);

  const mapRows = React.useCallback((players = []) => {
    return players.map((p) => {
      const st = deriveStatus(p);
      const img = p?.media?.profileImage?.url || '';
      const email = p?.user?.email || p?.contactInfo?.email || '';
      const phone = p?.contactInfo?.phone || p?.user?.phone || '';
      return {
        _id: p._id,
        name: p.name || p?.user?.name || '-',
        email,
        phone,
        jop: p.jop || '-', // player | coach
        image: img,
        date: p.createdAt ? new Date(p.createdAt) : null,
        dateLabel: p.createdAt ? new Date(p.createdAt).toLocaleString('ar-EG') : '—',
        isActive: Boolean(p.isActive),
        isPromoted: Boolean(p?.isPromoted?.status),
        isConfirmed: Boolean(p.isConfirmed), // سيكون false هنا حسب API
        status: st,
        statusLabel: statusLabel(st),
        age: Number(p.age ?? 0),
        nationality: p.nationality || '-',
        game: p.game || '-',
        createdAt: p.createdAt ? new Date(p.createdAt).getTime() : 0,
      };
    });
  }, []);

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = ENDPOINTS.listRecent(buildQuery());
      const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setRows([]); setTotalCount(0);
        return;
      }
      const json = await res.json();
      const list = json?.data?.players ?? [];
      const mapped = mapRows(list);
      setRows(mapped);
      const total = json?.data?.pagination?.totalPlayers ?? mapped.length;
      setTotalCount(Number(total));
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر جلب البيانات' });
      setRows([]); setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, authHeaders, mapRows]);

  React.useEffect(() => { fetchRows(); }, [fetchRows]);

  // ===== Column click behavior: filter-by-header (للأعمدة الثنائية/التصنيفية) أو فرز للباقي =====
  const cycle = (val, order) => order[(order.indexOf(val) + 1) % order.length];

  const handleHeaderClick = (col) => {
    switch (col) {
      case 'jop':
        setJopFilter((prev) => cycle(prev, ['all', 'player', 'coach']));
        setPage(1);
        break;
      case 'isActive':
        setActiveFilter((prev) => cycle(prev, ['all', 'true', 'false']));
        setPage(1);
        break;
      case 'isPromoted':
        setPromotedFilter((prev) => cycle(prev, ['all', 'true', 'false']));
        setPage(1);
        break;
      case 'date':
        // يدوّر نافذة الأيام: 7 -> 30 -> 90 -> 7
        setDays((prev) => (prev === 7 ? 30 : prev === 30 ? 90 : 7));
        setPage(1);
        break;
      default:
        // فرز
        if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortBy(col); setSortDir('asc'); }
    }
  };

  // client-side sort for the current page
  const sorted = React.useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let A = a[sortBy], B = b[sortBy];
      if (sortBy === 'date') { A = a.createdAt; B = b.createdAt; }
      if (typeof A === 'string' && typeof B === 'string') {
        const cmp = A.localeCompare(B, 'ar');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (A > B ? 1 : (A < B ? -1 : 0));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-70" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const Avatar = ({ name, src, promoted }) => {
    const initials = (name || '').split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
    const colors = ['from-blue-500 to-purple-600','from-green-500 to-teal-600','from-orange-500 to-red-600','from-pink-500 to-rose-600'];
    const colorIndex = (name || '').length % colors.length;
    return (
      <div className="relative">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shadow-md" />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {initials || 'P'}
          </div>
        )}
        {promoted && (
          <span className="absolute -bottom-1 -left-1 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full shadow inline-flex items-center gap-0.5">
            <Star className="w-3 h-3" /> مروّج
          </span>
        )}
      </div>
    );
  };

  const confirmOne = async (id) => {
    setConfirmingId(id);
    try {
      const res = await fetch(ENDPOINTS.confirm(id), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ isConfirmed: true }),
      });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        throw new Error(msg);
      }
      await Toast.fire({ icon: 'success', title: 'تم التأكيد' });
      // أزل السطر من القائمة الحالية (الـ API يعيد غير المؤكدين فقط)
      setRows((prev) => prev.filter(r => r._id !== id));
      setTotalCount((t) => Math.max(0, t - 1));
      // لو الصفحة أصبحت فارغة ومعك صفحات سابقة — ارجع صفحة ثم اجلب
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchRows();
    } catch (e) {
      await Toast.fire({ icon: 'error', html: e.message || 'تعذر تأكيد المستخدم' });
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" dir="rtl">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">المسجّلون مؤخرًا (غير مؤكَّدين)</h1>
          </div>
          <p className="text-gray-600">عرض آخر اللاعبين/المدربين المسجّلين مع إمكانية التأكيد السريع.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="ابحث بالاسم أو البريد أو الهاتف أو الجنسية أو اللعبة…"
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
                </div>

                {/* Quick chips showing header-based filters */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">
                    الفئة: {jopFilter === 'all' ? 'الكل' : (jopFilter === 'player' ? 'لاعب' : 'مدرب')}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">
                    نشط؟ {activeFilter === 'all' ? 'الكل' : (activeFilter === 'true' ? 'نعم' : 'لا')}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">
                    مروّج؟ {promotedFilter === 'all' ? 'الكل' : (promotedFilter === 'true' ? 'نعم' : 'لا')}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">
                    خلال: {days} يومًا
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <Th label="الشخص" onClick={() => handleHeaderClick('name')} sort={<SortIcon column="name" />} />
                  <Th label="الفئة" onClick={() => handleHeaderClick('jop')} hint={`(اضغط للتبديل: الكل/لاعب/مدرب)`} />
                  <Th label="البريد" onClick={() => handleHeaderClick('email')} sort={<SortIcon column="email" />} />
                  <Th label="الهاتف" onClick={() => handleHeaderClick('phone')} />
                  <Th label="الجنسية" onClick={() => handleHeaderClick('nationality')} sort={<SortIcon column="nationality" />} />
                  <Th label="اللعبة" onClick={() => handleHeaderClick('game')} sort={<SortIcon column="game" />} />
                  <Th label="العمر" onClick={() => handleHeaderClick('age')} sort={<SortIcon column="age" />} />
                  <Th label="الحالة" onClick={() => handleHeaderClick('status')} sort={<SortIcon column="status" />} />
                  <Th label="نشط؟" onClick={() => handleHeaderClick('isActive')} hint="(اضغط: الكل/نعم/لا)" />
                  <Th label="مروّج؟" onClick={() => handleHeaderClick('isPromoted')} hint="(اضغط: الكل/نعم/لا)" />
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">إجراء</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={12} className="px-6 py-10 text-center text-gray-500">جارٍ التحميل…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={12} className="px-6 py-10 text-center text-gray-500">لا توجد نتائج</td></tr>
                ) : (
                  sorted.map((r, index) => (
                    <tr key={r._id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      {/* الشخص */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar name={r.name} src={r.image} promoted={r.isPromoted} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.dateLabel}</div>
                          </div>
                        </div>
                      </td>

                      {/* الفئة */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700">
                          {r.jop === 'coach' ? 'مدرب' : 'لاعب'}
                        </span>
                      </td>


                      {/* البريد */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900 inline-flex items-center gap-1">
                          <Mail className="w-4 h-4 text-indigo-600" /> {r.email || '—'}
                        </div>
                      </td>

                      {/* الهاتف */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 inline-flex items-center gap-1">
                          <Phone className="w-4 h-4 text-emerald-600" /> {r.phone || '—'}
                        </div>
                      </td>

                      {/* الجنسية */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200">
                          {r.nationality}
                        </span>
                      </td>

                      {/* اللعبة */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200">
                          {r.game}
                        </span>
                      </td>

                      {/* العمر */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{r.age || '—'}</div>
                      </td>

                      {/* الحالة */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass(r.status)}`}>
                          {r.statusLabel}
                        </span>
                      </td>

                      {/* نشط؟ */}
                      <td className="px-6 py-4">
                        {r.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="w-4 h-4" /> نعم</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-sm"><XCircle className="w-4 h-4" /> لا</span>
                        )}
                      </td>

                      {/* مروّج؟ */}
                      <td className="px-6 py-4">
                        {r.isPromoted ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600 text-sm"><Star className="w-4 h-4" /> نعم</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-sm"><XCircle className="w-4 h-4" /> لا</span>
                        )}
                      </td>

                      {/* إجراء */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => confirmOne(r._id)}
                          disabled={confirmingId === r._id}
                          className={`px-3 py-2 text-sm rounded-lg text-white ${confirmingId === r._id ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
                          title="تأكيد هذا المستخدم"
                        >
                          {confirmingId === r._id ? 'جارٍ التأكيد…' : 'تأكيد'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (نمط المستخدمين) */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض
                <span className="font-semibold text-gray-900"> {sorted.length ? (page - 1) * rowsPerPage + 1 : 0}</span>
                -
                <span className="font-semibold text-gray-900"> {Math.min(page * rowsPerPage, totalCount)}</span>
                من
                <span className="font-semibold text-gray-900"> {totalCount}</span> عنصر
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg hover:bg-white border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  disabled={page === 1}
                  title="السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let p = i + 1;
                    if (totalPages > 7) {
                      if (i < 2) p = i + 1;
                      else if (i > 4) p = totalPages - (6 - i);
                      else p = Math.max(1, Math.min(totalPages, page - 3 + i));
                    }
                    const isActive = p === page;
                    return (
                      <button
                        key={`${p}-${i}`}
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'hover:bg-white border border-gray-200 text-gray-700 hover:shadow-sm'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg hover:bg-white border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  disabled={page === totalPages}
                  title="التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug */}
        <div className="text-xs text-gray-400 mt-4">
          مصدر: <code className="font-mono">{ENDPOINTS.listRecent(buildQuery())}</code>
        </div>
      </div>
    </div>
  );
}

function Th({ label, onClick, sort, hint }) {
  return (
    <th
      className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
      onClick={onClick}
      title={hint || 'اضغط للفرز/التبديل'}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sort}
      </div>
    </th>
  );
}
