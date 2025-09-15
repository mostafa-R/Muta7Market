// app/(admin)/coaches/page.jsx
'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft, ChevronRight,
  Download,
  Edit3,
  Eye,
  Search,
  Star,
  Trash2,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

// ===== API base =====
const API_ROOT   = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_BASE = `${API_ROOT}/admin`;

const ENDPOINTS = {
  list: (page, limit, search = '') => {
    const qs = new URLSearchParams({
      page: String(page ?? 1),
      limit: String(limit ?? 10),
      jop: 'coach',
      ...(search ? { search } : {}),
    }).toString();
    return `${ADMIN_BASE}/players?${qs}`;
  },
  delete: (id) => `${ADMIN_BASE}/players/${id}`,
};

// Helper functions to extract Arabic names from sports object format
const getSportsDisplayValue = (sportsData) => {
  if (!sportsData) return '-';
  
  // If it's already a string (legacy data or custom entry)
  if (typeof sportsData === 'string') {
    return sportsData || '-';
  }
  
  // If it's an object with ar property, use Arabic name
  if (typeof sportsData === 'object' && sportsData.ar) {
    return sportsData.ar;
  }
  
  // Fallback to English name if Arabic not available
  if (typeof sportsData === 'object' && sportsData.en) {
    return sportsData.en;
  }
  
  return '-';
};

// ===== Toast =====
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

// ===== Helpers =====
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

const RECENT_DAYS = 30;
function deriveStatus(p) {
  const raw = (p?.status || '').toLowerCase();
  const tStart = p?.transferredTo?.startDate ? new Date(p.transferredTo.startDate) : null;
  if (tStart) {
    const days = (Date.now() - tStart.getTime()) / 86400000;
    return days <= RECENT_DAYS ? 'recently_transferred' : 'transferred';
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

export default function CoachesDashboardTable() {
  const router = useRouter();

  // data
  const [rows, setRows] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);

  // ui state
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // controls
  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // filters (client-side)
  const [onlyPromoted, setOnlyPromoted] = React.useState('all'); // all | yes | no
  const [activeFilter, setActiveFilter]   = React.useState('all'); // all | true | false
  const [confirmFilter, setConfirmFilter] = React.useState('all'); // all | true | false

  const authHeaders = React.useCallback(() => {
  let token = null;

if (typeof window !== 'undefined') {
  token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
}

    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const mapCoaches = React.useCallback((items = []) => {
    // فلترة المدربين فقط للتأكد
    return items
      .filter((p) => p.jop === 'coach') // التأكد من أنها مدربين فقط
      .map((p) => {
        const st = deriveStatus(p);
        const promoted = Boolean(p?.isPromoted?.status);
        return {
          _id: p._id,
          jop: p.jop,
          name: p.name || p.user?.name || '-',
          email: p.user?.email || p.contactInfo?.email || '-',
          nationality: p.nationality || '-',
          game: getSportsDisplayValue(p.game),
          age: Number(p.age ?? 0),
          image: p.media?.profileImage?.url || '',
          status: st,
          statusLabel: statusLabel(st),
          isActive: Boolean(p.isActive),
          isConfirmed: Boolean(p.isConfirmed),
          isPromoted: promoted,
          createdAt: p.createdAt ? new Date(p.createdAt).getTime() : 0,
          joinDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-EG') : '-',
        };
      });
  }, []);

  const fetchCoaches = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(ENDPOINTS.list(page, rowsPerPage, query.trim()), { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        setRows([]); setTotalCount(0);
        setError(msg || 'تعذر جلب المدربين');
        await Toast.fire({ icon: 'error', html: msg });
        return;
      }
      const json = await res.json();
      const list = Array.isArray(json?.data?.players) ? json.data.players : [];
      
      const mapped = mapCoaches(list);
      setRows(mapped);
      const total = json?.data?.pagination?.totalPlayers ?? json?.data?.pagination?.total ?? mapped.length;
      setTotalCount(Number(total));
    } catch (e) {
      console.error(e);
      setRows([]); setTotalCount(0);
      const msg = 'تعذر جلب المدربين';
      setError(msg);
      await Toast.fire({ icon: 'error', title: msg });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, query, authHeaders, mapCoaches]);

  React.useEffect(() => { fetchCoaches(); }, [fetchCoaches]);

  // ترتيب الأعمال: مروّج → نشط ومؤكّد → نشط وغير مؤكد → غير نشط
  const priority = (r) => {
    if (r.isPromoted) return 0;
    if (r.isActive && r.isConfirmed) return 1;
    if (r.isActive && !r.isConfirmed) return 2;
    return 3;
  };

  // filter (client)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (q) {
        const hit =
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.nationality.toLowerCase().includes(q) ||
          r.game.toLowerCase().includes(q) ||
          r.statusLabel.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (onlyPromoted !== 'all') {
        const want = onlyPromoted === 'yes';
        if (Boolean(r.isPromoted) !== want) return false;
      }
      if (activeFilter !== 'all') {
        const want = activeFilter === 'true';
        if (Boolean(r.isActive) !== want) return false;
      }
      if (confirmFilter !== 'all') {
        const want = confirmFilter === 'true';
        if (Boolean(r.isConfirmed) !== want) return false;
      }
      return true;
    });
  }, [rows, query, onlyPromoted, activeFilter, confirmFilter]);

  // sort (business priority -> selected column -> createdAt desc)
  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const pa = priority(a), pb = priority(b);
      if (pa !== pb) return pa - pb;
      if (sortBy) {
        const A = a[sortBy] ?? '', B = b[sortBy] ?? '';
        let cmp;
        if (typeof A === 'string' && typeof B === 'string') cmp = A.localeCompare(B, 'ar');
        else cmp = A > B ? 1 : (A < B ? -1 : 0);
        if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp;
      }
      return b.createdAt - a.createdAt;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleDelete = async (id) => {
    const ask = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن يمكنك التراجع بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    });
    if (!ask.isConfirmed) return;
    try {
      const res = await fetch(ENDPOINTS.delete(id), { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        return;
      }
      await Toast.fire({ icon: 'success', title: 'تم حذف المدرب' });
      fetchCoaches();
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر حذف المدرب' });
    }
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
            {initials || 'C'}
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

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const exportCSV = () => {
    const headers = ['المعرف','الاسم','البريد الإلكتروني','الجنسية','اللعبة','السن','الحالة','مؤكَّد؟','نشط؟','مروّج؟','تاريخ الانضمام'];
    const rowsCsv = sorted.map(r => [
      r._id, r.name, r.email, r.nationality, r.game, r.age, r.statusLabel,
      r.isConfirmed ? 'نعم' : 'لا',
      r.isActive ? 'نعم' : 'لا',
      r.isPromoted ? 'نعم' : 'لا',
      r.joinDate
    ]);
    const csv = [headers, ...rowsCsv]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `المدربين_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة المدربين</h1>
          </div>
          <p className="text-gray-600">إدارة وتتبع جميع المدربين في النظام</p>
          {loading && <p className="mt-2 text-sm text-blue-600">جاري التحميل...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المدربين</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المروّجون (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-yellow-600">{rows.filter(r => r.isPromoted).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مؤكَّدون (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-teal-600">{rows.filter(r => r.isConfirmed).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-teal-100">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نشطون (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-emerald-600">{rows.filter(r => r.isActive).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
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
                    placeholder="ابحث بالاسم، البريد، الجنسية، اللعبة أو الحالة..."
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <select
                    value={onlyPromoted}
                    onChange={(e) => { setOnlyPromoted(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    title="الترويج"
                  >
                    <option value="all">كلّهم</option>
                    <option value="yes">مروّج فقط</option>
                    <option value="no">غير مروّج</option>
                  </select>

                  <select
                    value={activeFilter}
                    onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    title="الحالة"
                  >
                    <option value="all">الحالة: الكل</option>
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>

                  <select
                    value={confirmFilter}
                    onChange={(e) => { setConfirmFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    title="التأكيد"
                  >
                    <option value="all">التأكيد: الكل</option>
                    <option value="true">مؤكَّد</option>
                    <option value="false">غير مؤكَّد</option>
                  </select>
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

                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">تصدير CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 w-80" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2"><span>المدرب</span><SortIcon column="name" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-2"><span>البريد الإلكتروني</span><SortIcon column="email" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('nationality')}>
                    <div className="flex items-center gap-2"><span>الجنسية</span><SortIcon column="nationality" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('game')}>
                    <div className="flex items-center gap-2"><span>اللعبة</span><SortIcon column="game" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('age')}>
                    <div className="flex items-center gap-2"><span>السن</span><SortIcon column="age" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">مؤكَّد؟</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">نشط؟</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">مروّج؟</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={10} className="px-6 py-10 text-center text-gray-500">جارٍ التحميل…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-10 text-center text-gray-500">لا توجد نتائج</td></tr>
                ) : (
                  sorted.map((r, index) => (
                    <tr
                      key={r._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      {/* المدرب */}
                      <td className="px-6 py-4 w-80">
                        <div className="flex items-center gap-4">
                          <Avatar name={r.name} src={r.image} promoted={r.isPromoted} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <span className="line-clamp-2 max-w-64 break-words" title={r.name}>
                                {r.name}
                              </span>
                              {r.isPromoted && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" title="مروّج" />}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">انضم في {r.joinDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* البريد */}
                      <td className="px-6 py-4"><div className="text-sm text-gray-900">{r.email}</div></td>

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

                      {/* السن */}
                      <td className="px-6 py-4"><div className="text-sm text-gray-600 font-medium">{r.age}</div></td>

                      {/* الحالة */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass(r.status)}`}>
                          {r.statusLabel}
                        </span>
                      </td>

                      {/* مؤكد؟ */}
                      <td className="px-6 py-4">
                        {r.isConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="w-4 h-4" /> نعم</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-sm"><XCircle className="w-4 h-4" /> لا</span>
                        )}
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

                      {/* الإجراءات */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/coaches/${r._id}`)}
                            className="p-2 rounded-lg hover:bg-sky-100 text-sky-600 transition-colors duration-200 hover:scale-110"
                            title="عرض ملف المدرب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/players/update/${r._id}`)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-yellow-600 transition-colors duration-200 hover:scale-110"
                            title="تعديل بيانات المدرب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200 hover:scale-110"
                            title="حذف المدرب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — نفس نمط المستخدمين */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض <span className="font-semibold text-gray-900">{sorted.length ? (page - 1) * rowsPerPage + 1 : 0}</span> -
                <span className="font-semibold text-gray-900"> {Math.min(page * rowsPerPage, totalCount)}</span> من
                <span className="font-semibold text-gray-900"> {totalCount}</span> مدرّب
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

      </div>
    </div>
  );
}
