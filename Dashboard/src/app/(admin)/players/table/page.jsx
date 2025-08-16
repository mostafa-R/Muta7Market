'use client';

import React from 'react';
import {
  Search, Edit3, Trash2, ChevronLeft, ChevronRight,
  CheckCircle, Download, Users, ArrowUpDown, ArrowUp, ArrowDown,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
const ENDPOINTS = {
  list: (page, limit) => `${BASE}/players?page=${page}&limit=${limit}`,
  delete: (id) => `${BASE}/players/${id}`,
};

// Toast (under navbar if you added CSS class from earlier)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

// Safely extract backend error text
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

// derive status with "recently transferred" window
const RECENT_DAYS = 30;
function deriveStatus(p) {
  const raw = (p.status || '').toLowerCase(); // e.g., "available"
  const tDate = p?.transferredTo?.date ? new Date(p.transferredTo.date) : null;
  if (tDate) {
    const days = (Date.now() - tDate.getTime()) / 86400000;
    return days <= RECENT_DAYS ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  // fallback: if has active contract
  if (p.contractEndDate) {
    const end = new Date(p.contractEndDate);
    if (end > new Date()) return 'contracted';
  }
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

export default function PlayersDashboardTable() {
  const router = useRouter();

  const [rows, setRows] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name'); // name | email | gender | nationality | game | age | status
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const authHeaders = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const mapPlayers = React.useCallback((players = []) => {
    return players.map((p) => {
      const st = deriveStatus(p);
      return {
        _id: p._id,
        name: p.name || p.user?.name || '-',
        email: p.user?.email || p.contactInfo?.email || '-',
        gender: (p.gender || '').toLowerCase(), // 'male' | 'female'
        nationality: p.nationality || '-',
        game: p.game || '-',
        age: Number(p.age ?? 0),
        image: p.media?.profileImage?.url || '',
        status: st,
        statusLabel: statusLabel(st),
        joinDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-',
      };
    });
  }, []);

  const fetchPlayers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.list(page, rowsPerPage), { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setRows([]);
        setTotalCount(0);
        return;
      }
      const json = await res.json();
      const mapped = mapPlayers(json?.data?.players ?? []);
      setRows(mapped);
      setTotalCount(Number(json?.data?.pagination?.total ?? mapped.length));
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر جلب اللاعبين' });
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, authHeaders, mapPlayers]);

  React.useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  // filter (client-side for current page)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.nationality.toLowerCase().includes(q) ||
      r.game.toLowerCase().includes(q) ||
      r.statusLabel.toLowerCase().includes(q)
    );
  }, [rows, query]);

  // sort (client-side for current page)
  const sorted = React.useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const A = a[sortBy] ?? '';
      const B = b[sortBy] ?? '';
      if (typeof A === 'string' && typeof B === 'string') {
        return sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
      }
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (A > B ? -1 : 1);
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
      await Toast.fire({ icon: 'success', title: 'تم حذف اللاعب' });
      fetchPlayers();
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر حذف اللاعب' });
    }
  };

  const handleEdit = (id) => {
    router.push(`/players/update/${id}`);
  };

  const exportCSV = () => {
    const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الجنس', 'الجنسية', 'اللعبة', 'السن', 'الحالة', 'تاريخ الإنضمام'];
    const rowsCsv = sorted.map(r => [
      r._id, r.name, r.email, r.gender, r.nationality, r.game, r.age, r.statusLabel, r.joinDate
    ]);
    const csv = [headers, ...rowsCsv].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `اللاعبين_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // UI helpers
  const Avatar = ({ name, src }) => {
    const initials = (name || '').split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
    const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-pink-500 to-rose-600'];
    const colorIndex = (name || '').length % colors.length;
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shadow-md" />
    ) : (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
        {initials || 'PL'}
      </div>
    );
  };

  const GenderBadge = ({ gender }) => {
    const g = (gender || '').toLowerCase();
    const isMale = g === 'male' || g === 'ذكر';
    const cls = isMale
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-pink-100 text-pink-700 border-pink-200';
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
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة اللاعبين</h1>
          </div>
          <p className="text-gray-600">إدارة وتتبع جميع اللاعبين في النظام</p>
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
                <p className="text-sm text-gray-600">المتاحون (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-emerald-600">{rows.filter(r => r.status === 'available').length}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط السن (هذه الصفحة)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rows.length ? Math.round(rows.reduce((s, r) => s + (r.age || 0), 0) / rows.length) : 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-2xl font-bold text-indigo-600">{new Date().toLocaleTimeString()}</p>
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم، الإيميل، الجنسية، اللعبة أو الحالة..."
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2"><span>اللاعب</span><SortIcon column="name" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-2"><span>البريد الإلكتروني</span><SortIcon column="email" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('gender')}>
                    <div className="flex items-center gap-2"><span>الجنس</span><SortIcon column="gender" /></div>
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
                  {/* NEW: Status */}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-2"><span>الحالة</span><SortIcon column="status" /></div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">جارٍ التحميل…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">لا توجد نتائج</td></tr>
                ) : (
                  sorted.map((r, index) => (
                    <tr key={r._id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      {/* اللاعب */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar name={r.name} src={r.image} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-500">انضم في {r.joinDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* البريد الإلكتروني */}
                      <td className="px-6 py-4"><div className="text-sm text-gray-900">{r.email}</div></td>

                      {/* الجنس with colored badge */}
                      <td className="px-6 py-4"><GenderBadge gender={r.gender} /></td>

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

                      {/* الحالة — new chips */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass(r.status)}`}>
                          {r.statusLabel}
                        </span>
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
                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors duration-200 hover:scale-110"
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                الصفحة <span className="font-semibold text-gray-900">{page}</span> من
                <span className="font-semibold text-gray-900"> {totalPages}</span> — إجمالي
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
