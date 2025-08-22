'use client';

import React from 'react';
import {
  Search,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Download,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// ------------------------
// API helpers (always /admin)
// ------------------------
function apiBase() {
  const root = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
  return `${root}/admin`;
}
const BASE = apiBase();

const ENDPOINTS = {
  list: (params) => `${BASE}/players?${params.toString()}`,
  delete: (id) => `${BASE}/players/${id}`,
};

// ------------------------
// Toast
// ------------------------
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

// ------------------------
// Utils
// ------------------------
async function extractBackendError(res) {
  const ct = res.headers.get('content-type') || '';
  try {
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    const data =
      typeof body === 'string'
        ? (() => {
            try {
              return JSON.parse(body);
            } catch {
              return { message: body };
            }
          })()
        : body;
    if (Array.isArray(data?.errors))
      return data.errors.map((e) => e?.message || e?.msg || JSON.stringify(e)).join('<br/>');
    if (data?.errors && typeof data.errors === 'object')
      return Object.values(data.errors).map((e) => e?.message || JSON.stringify(e)).join('<br/>');
    return data?.message || data?.error?.message || data?.error || data?.msg || `HTTP ${res.status} ${res.statusText}`;
  } catch {
    return `HTTP ${res.status} ${res.statusText}`;
  }
}

const RECENT_PROMO_VALID = (promo) => {
  if (!promo || typeof promo !== 'object') return false;
  if (!promo.status) return false;
  const end = promo.endDate ? new Date(promo.endDate) : null;
  if (!end) return true;
  return end > new Date();
};

function deriveStatus(p) {
  const raw = (p.status || '').toLowerCase();
  const tStart = p?.transferredTo?.startDate ? new Date(p.transferredTo.startDate) : null;
  if (tStart) {
    const days = (Date.now() - tStart.getTime()) / 86400000;
    return days <= 30 ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  if (p.contractEndDate) {
    const end = new Date(p.contractEndDate);
    if (end > new Date()) return 'contracted';
  }
  return 'available';
}

const statusLabel = (s) =>
  ({
    available: 'متاح',
    contracted: 'متعاقد',
    transferred: 'مُنْتَقَل',
    recently_transferred: 'منتقل حديثًا',
  }[s] || s);

const statusClass = (s) =>
  ({
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    contracted: 'bg-purple-100 text-purple-700 border-purple-200',
    transferred: 'bg-amber-100 text-amber-700 border-amber-200',
    recently_transferred: 'bg-blue-100 text-blue-700 border-blue-200',
  }[s] || 'bg-gray-100 text-gray-700 border-gray-200');

export default function PlayersDashboardTable() {
  const router = useRouter();

  const [rows, setRows] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [serverTotalPages, setServerTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState(''); // '' => use priority ranking
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filters
  const [filterMode, setFilterMode] = React.useState('all'); // all | promoted | active | inactive
  const [confirmFilter, setConfirmFilter] = React.useState('all'); // all | confirmed | unconfirmed

  const authHeaders = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const mapPlayers = React.useCallback((players = []) => {
    return players.map((p) => {
      const promoted = RECENT_PROMO_VALID(p?.isPromoted);
      const st = deriveStatus(p);
      return {
        _id: p._id,
        name: p.name || p.user?.name || '-',
        email: p.user?.email || p.contactInfo?.email || '-',
        gender: (p.gender || '').toLowerCase(),
        nationality: p.nationality || '-',
        game: p.game || '-',
        age: Number(p.age ?? 0),
        image: p.media?.profileImage?.url || '',
        status: st,
        statusLabel: statusLabel(st),
        joinDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-EG') : '-',
        createdAt: p.createdAt ? new Date(p.createdAt).getTime() : 0,
        isActive: !!p.isActive,
        isPromoted: promoted,
        isConfirmed: !!p.isConfirmed, // may be absent in many docs
      };
    });
  }, []);

  const buildQueryParams = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(rowsPerPage));
    params.set('jop', 'player'); // harmless if backend ignores it
    if (query.trim()) params.set('search', query.trim());
    if (filterMode === 'active') params.set('isActive', 'true');
    else if (filterMode === 'inactive') params.set('isActive', 'false');
    // confirmFilter is client-only (unless your backend supports it)
    return params;
  }, [page, rowsPerPage, query, filterMode]);

  const fetchPlayers = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = buildQueryParams();
      const res = await fetch(ENDPOINTS.list(params), { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setRows([]);
        setTotalCount(0);
        setServerTotalPages(1);
        return;
      }
      const json = await res.json();
      const players = json?.data?.players ?? [];
      let mapped = mapPlayers(players);

      // Filter: promoted/active/inactive
      if (filterMode === 'promoted') {
        mapped = mapped.filter((r) => r.isPromoted);
      } else if (filterMode === 'active') {
        mapped = mapped.filter((r) => r.isActive);
      } else if (filterMode === 'inactive') {
        mapped = mapped.filter((r) => !r.isActive);
      }

      // Filter: isConfirmed
      if (confirmFilter === 'confirmed') {
        mapped = mapped.filter((r) => r.isConfirmed === true);
      } else if (confirmFilter === 'unconfirmed') {
        mapped = mapped.filter((r) => r.isConfirmed === false);
      }

      setRows(mapped);
      const pag = json?.data?.pagination;
      if (pag) {
        // backend may use totalPlayers
        const total = Number(pag.totalPlayers ?? pag.total ?? mapped.length);
        setTotalCount(total);
        setServerTotalPages(Number(pag.totalPages ?? 1));
      } else {
        setTotalCount(mapped.length);
        setServerTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      setError('تعذر جلب اللاعبين');
      await Toast.fire({ icon: 'error', title: 'تعذر جلب اللاعبين' });
      setRows([]);
      setTotalCount(0);
      setServerTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, buildQueryParams, mapPlayers, filterMode, confirmFilter]);

  React.useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Debounced search
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchPlayers();
    }, 400);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Priority ranking:
  // 1) isPromoted === true
  // 2) isActive === true && isConfirmed === true
  // 3) isActive === true && isConfirmed === false
  // 4) inactive
  function rankRow(r) {
    if (r.isPromoted) return 0;
    if (r.isActive && r.isConfirmed) return 1;
    if (r.isActive && !r.isConfirmed) return 2;
    return 3;
  }

  // Client-side sort for current page (or default ranking if sortBy === '')
  const sorted = React.useMemo(() => {
    const copy = [...rows];
    if (!sortBy) {
      copy.sort((a, b) => {
        const ra = rankRow(a),
          rb = rankRow(b);
        if (ra !== rb) return ra - rb;
        return b.createdAt - a.createdAt; // newest first within same rank
      });
      return copy;
    }
    copy.sort((a, b) => {
      const A = a[sortBy] ?? '';
      const B = b[sortBy] ?? '';
      if (typeof A === 'string' && typeof B === 'string') {
        return sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
      }
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (A > B ? -1 : 1);
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  const totalPages = Math.max(1, serverTotalPages);
  const pageStart = (page - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(page * rowsPerPage, totalCount);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
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
      await Toast.fire({ icon: 'success', title: 'تم حذف اللاعب' });
      fetchPlayers();
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر حذف اللاعب' });
    }
  };

  const handleEdit = (id) => router.push(`/players/update/${encodeURIComponent(id)}`);

  const exportCSV = () => {
    const headers = [
      'المعرف',
      'الاسم',
      'البريد الإلكتروني',
      'الجنس',
      'الجنسية',
      'اللعبة',
      'السن',
      'الحالة',
      'مروّج',
      'مؤكَّد',
      'نشط',
      'تاريخ الانضمام',
    ];
    const rowsCsv = sorted.map((r) => [
      r._id,
      r.name,
      r.email,
      r.gender,
      r.nationality,
      r.game,
      r.age,
      r.statusLabel,
      r.isPromoted ? 'نعم' : 'لا',
      r.isConfirmed ? 'نعم' : 'لا',
      r.isActive ? 'نعم' : 'لا',
      r.joinDate,
    ]);
    const csv = [headers, ...rowsCsv]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `اللاعبين_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI helpers
  const Avatar = ({ name, src }) => {
    const initials = (name || '')
      .split(' ')
      .slice(0, 2)
      .map((s) => s?.[0] || '')
      .join('')
      .toUpperCase();
    const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-pink-500 to-rose-600'];
    const colorIndex = (name || '').length % colors.length;
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shadow-md" />
    ) : (
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}
      >
        {initials || 'PL'}
      </div>
    );
  };

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

  const SortIcon = ({ column }) => {
    if (sortBy !== column)
      return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة اللاعبين</h1>
          </div>
          <p className="text-gray-600">إدارة وتتبع جميع اللاعبين في النظام</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي اللاعبين</p>
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
                <p className="text-2xl font-bold text-yellow-600">{rows.filter((r) => r.isPromoted).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المؤكَّدون (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-emerald-600">{rows.filter((r) => r.isConfirmed).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-2xl font-bold text-indigo-600">{new Date().toLocaleTimeString('ar-EG')}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم، الإيميل، الجنسية، اللعبة أو الحالة..."
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
                </div>

                {/* Filter: promoted/active/inactive */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عرض:</span>
                  <select
                    value={filterMode}
                    onChange={(e) => {
                      setFilterMode(e.target.value);
                      setPage(1);
                      fetchPlayers();
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">الكل</option>
                    <option value="promoted">المروّجون فقط</option>
                    <option value="active">النشطون فقط</option>
                    <option value="inactive">غير النشطين فقط</option>
                  </select>
                </div>

                {/* Filter: isConfirmed */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>التأكيد:</span>
                  <select
                    value={confirmFilter}
                    onChange={(e) => {
                      setConfirmFilter(e.target.value);
                      setPage(1);
                      fetchPlayers();
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">الكل</option>
                    <option value="confirmed">مؤكَّد فقط</option>
                    <option value="unconfirmed">غير مؤكد فقط</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                      fetchPlayers();
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">الرجوع للصفحة الرئيسية</span>
                  </button>

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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full" dir="rtl">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>اللاعب</span>
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      <span>البريد الإلكتروني</span>
                      <SortIcon column="email" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('gender')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الجنس</span>
                      <SortIcon column="gender" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('nationality')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الجنسية</span>
                      <SortIcon column="nationality" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('game')}
                  >
                    <div className="flex items-center gap-2">
                      <span>اللعبة</span>
                      <SortIcon column="game" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('age')}
                  >
                    <div className="flex items-center gap-2">
                      <span>السن</span>
                      <SortIcon column="age" />
                    </div>
                  </th>
                  {/* Status */}
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الحالة</span>
                      <SortIcon column="status" />
                    </div>
                  </th>
                  {/* Promoted */}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">مروّج</th>
                  {/* Confirmed */}
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
                    onClick={() => toggleSort('isConfirmed')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>مؤكَّد</span>
                      <SortIcon column="isConfirmed" />
                    </div>
                  </th>
                  {/* Active */}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">نشط</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-gray-500">
                      جارٍ التحميل…
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-gray-500">
                      لا توجد نتائج
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, index) => (
                    <tr
                      key={r._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      {/* اللاعب */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar name={r.name} src={r.image} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              {r.name}
                              {r.isPromoted && <Star className="w-4 h-4 text-yellow-500" title="مروّج" />}
                            </div>
                            <div className="text-xs text-gray-500">انضم في {r.joinDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* البريد الإلكتروني */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{r.email}</div>
                      </td>

                      {/* الجنس */}
                      <td className="px-6 py-4">
                        <GenderBadge gender={r.gender} />
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

                      {/* السن */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">{r.age}</div>
                      </td>

                      {/* الحالة */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass(r.status)}`}>
                          {r.statusLabel}
                        </span>
                      </td>

                      {/* مروّج */}
                      <td className="px-6 py-4 text-center">
                        {r.isPromoted ? <Star className="w-4 h-4 text-yellow-500 inline" /> : <span className="text-gray-400 text-xs">—</span>}
                      </td>

                      {/* مؤكد */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            r.isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {r.isConfirmed ? 'نعم' : 'لا'}
                        </span>
                      </td>

                      {/* نشط */}
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
                          title={r.isActive ? 'نشط' : 'غير نشط'}
                        />
                      </td>

                      {/* الإجراءات */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/players/${r._id}`)}
                            className="p-2 rounded-lg hover:bg-sky-100 text-sky-600 transition-colors duration-200 hover:scale-110"
                            title="عرض الملف"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(r._id)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-yellow-600 transition-colors duration-200 hover:scale-110"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200 hover:scale-110"
                            title="حذف"
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

          {/* Pagination — نفس ستايل المستخدمين */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض <span className="font-semibold text-gray-900">{totalCount ? pageStart : 0}</span> -
                <span className="font-semibold text-gray-900"> {totalCount ? pageEnd : 0}</span> من
                <span className="font-semibold text-gray-900"> {totalCount}</span> لاعب
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
