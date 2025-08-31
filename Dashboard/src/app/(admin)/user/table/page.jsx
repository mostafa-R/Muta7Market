'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Image as ImageIcon,
  Search,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

const BASE = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`;

const ENDPOINTS = {
  list: `${BASE}/users`,
  one: (id) => `${BASE}/users/${id}`,
  delete: (id) => `${BASE}/users/${id}`,
};

export default function UsersDashboardTable() {
  const router = useRouter();

  // ------- state -------
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortDir, setSortDir] = React.useState('asc');

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [deletingId, setDeletingId] = React.useState(null);

  // من السيرفر
  const [serverTotalPages, setServerTotalPages] = React.useState(1);
  const [serverTotalUsers, setServerTotalUsers] = React.useState(0);

  const arLocale = 'ar-EG'; // تنسيق عربي للتواريخ والأرقام

  // ------- helpers -------
  const toArabicDigits = (input) => {
    const map = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
    return String(input).replace(/[0-9]/g, (d) => map[d] || d);
  };

  const rolesLabel = (r) => (r === 'admin' ? 'مدير'  : 'مستخدم');

  const formatDateAr = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString(arLocale, { hour12: false });
    } catch {
      return iso;
    }
  };

  const authHeaders = React.useCallback(() => {
 let token = null;

if (typeof window !== 'undefined') {
  token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
}

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // ------- fetching -------
  const fetchUsers = React.useCallback(
    async (opts) => {
      setLoading(true);
      setError('');
      try {
        const p = new URLSearchParams();
        p.set('page', String(opts?.page ?? page));
        p.set('limit', String(opts?.limit ?? rowsPerPage));
        // إن كان السيرفر يدعم البحث
        if ((opts?.search ?? query).trim()) p.set('search', (opts?.search ?? query).trim());

        const url = `${ENDPOINTS.list}?${p.toString()}`;
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const listRaw = json?.data?.users ?? [];
        // تصفية العناصر الفارغة أو التالفة
        const list = (Array.isArray(listRaw) ? listRaw : []).filter(
          (u) => u && typeof u === 'object' && u._id
        );

        // فرز داخل الصفحة الحالية فقط (الفرز من السيرفر أفضل إن كان متاحًا)
        const sorted = sortBy
          ? [...list].sort((a, b) => {
              const isDate = sortBy === 'createdAt' || sortBy === 'lastLogin';
              const Araw = a?.[sortBy];
              const Braw = b?.[sortBy];
              const A = isDate ? new Date(Araw || 0).getTime() : Araw ?? '';
              const B = isDate ? new Date(Braw || 0).getTime() : Braw ?? '';

              if (typeof A === 'string' && typeof B === 'string')
                return sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
              if (typeof A === 'boolean' && typeof B === 'boolean')
                return sortDir === 'asc' ? Number(A) - Number(B) : Number(B) - Number(A);
              return sortDir === 'asc' ? (A > B ? 1 : -1) : A > B ? -1 : 1;
            })
          : list;

        setUsers(sorted);

        const pg = json?.data?.pagination;
        if (pg) {
          setServerTotalPages(pg.totalPages || 1);
          setServerTotalUsers(pg.totalUsers || sorted.length);
          // مزامنة الصفحة الحالية لو اختلفت
          if (typeof pg.currentPage === 'number' && pg.currentPage !== page) {
            setPage(pg.currentPage);
          }
        } else {
          // fallback لو لم يرجع السيرفر معلومات التصفح
          setServerTotalPages(1);
          setServerTotalUsers(sorted.length);
        }
      } catch (e) {
        console.error('fetchUsers error:', e);
        setError('فشل في جلب المستخدمين. تأكد من المتغير NEXT_PUBLIC_BASE_URL والتوكن وصلاحياتك.');
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, page, rowsPerPage, sortBy, sortDir, query]
  );

  // الجلب الأولي وكلما تغيرت وسائط التصفح/الحجم
  React.useEffect(() => {
    fetchUsers({ page, limit: rowsPerPage, search: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // تنفيذ البحث بتأخير بسيط (debounce)
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers({ page: 1, limit: rowsPerPage, search: query });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const deleteUserById = React.useCallback(
    async (id) => {
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

      setDeletingId(id);
      try {
        const res = await fetch(ENDPOINTS.delete(id), { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // تحديث متفائل
        setUsers((prev) => prev.filter((u) => u._id !== id));
        // تحديث العدّادات من السيرفر (اختياري)
        fetchUsers({ page, limit: rowsPerPage, search: query });
        await Swal.fire({ title: 'تم الحذف', text: 'تم حذف المستخدم بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (e) {
        console.error('deleteUserById error:', e);
        await Swal.fire({ title: 'خطأ', text: 'تعذر حذف المستخدم. حاول مرة أخرى.', icon: 'error', confirmButtonColor: '#3085d6' });
      } finally {
        setDeletingId(null);
      }
    },
    [authHeaders, fetchUsers, page, rowsPerPage, query]
  );

  // ------- UI helpers -------
  const Avatar = ({ name, src }) => {
    if (src) {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gray-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={name || 'user'} className="w-full h-full object-cover" />
        </div>
      );
    }
    const initials = String(name || '')
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0] || '')
      .join('')
      .toUpperCase();
    const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-pink-500 to-rose-600'];
    const colorIndex = (String(name || '').length || 0) % colors.length;
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
        {initials || 'U'}
      </div>
    );
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
    // إعادة الجلب مع الفرز من السيرفر إن أمكن (اختياري):
    // fetchUsers({ page: 1, limit: rowsPerPage, search: query, sortBy: col, sortDir: sortDir === 'asc' ? 'desc' : 'asc' })
  };

  const exportCSV = () => {
    const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الهاتف', 'الصلاحية', 'تحقق الإيميل', 'نشط', 'تاريخ الإنشاء', 'آخر تسجيل دخول'];
    const rows = users.map((u) => [
      u._id,
      u.name || '-',
      u.email || '-',
      u.phone || '-',
      rolesLabel(u.role || 'user'),
      u.isEmailVerified ? 'نعم' : 'لا',
      u.isActive ? 'نعم' : 'لا',
      formatDateAr(u.createdAt),
      formatDateAr(u.lastLogin),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المستخدمين_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------- derived -------
  const showingFrom = users.length ? (page - 1) * rowsPerPage + 1 : 0;
  const showingTo = (page - 1) * rowsPerPage + users.length;

  return (
    <div className="min-h-screen p-4 sm:p-6" dir="rtl">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          </div>
          <p className="text-gray-600">إدارة وتتبع جميع المستخدمين في النظام</p>
          {loading && <p className="mt-2 text-sm text-blue-600">جاري التحميل...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{toArabicDigits(serverTotalUsers)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">النشطون (في الصفحة الحالية)</p>
                <p className="text-2xl font-bold text-green-600">{toArabicDigits(users.filter((u) => u.isActive).length)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إيميل محقق (في الصفحة)</p>
                <p className="text-2xl font-bold text-indigo-600">{toArabicDigits(users.filter((u) => u.isEmailVerified).length)}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المديرون (في الصفحة)</p>
                <p className="text-2xl font-bold text-purple-600">{toArabicDigits(users.filter((u) => u.role === 'admin').length)}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم، الإيميل أو الهاتف (يعتمد على دعم API)"
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white dark:bg-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
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
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {toArabicDigits(n)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <ChevronRight className="w-4 h-4" />
                    <span className="hidden sm:inline">الرجوع للصفحة الرئيسية</span>
                  </button>

                  <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">تصدير CSV</span>
                  </button>

                  <button onClick={() => fetchUsers({ page, limit: rowsPerPage, search: query })} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    تحديث
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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2">
                      <span>المستخدم</span>
                      <SortIcon column="name" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-2">
                      <span>البريد الإلكتروني</span>
                      <SortIcon column="email" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">الهاتف</th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('role')}>
                    <div className="flex items-center gap-2">
                      <span>الصلاحية</span>
                      <SortIcon column="role" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isEmailVerified')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>تحقق الإيميل</span>
                      <SortIcon column="isEmailVerified" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isActive')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>الحالة</span>
                      <SortIcon column="isActive" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('createdAt')}>
                    <div className="flex items-center gap-2">
                      <span>تاريخ الإنشاء</span>
                      <SortIcon column="createdAt" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr key={user._id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30  dark:bg-gray-800/10 '}`}>
                    {/* المستخدم */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={user.name} src={user?.profileImage?.url} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {user.name || '-'}
                            {!user?.profileImage?.url && <ImageIcon className="w-4 h-4 text-gray-300" title="لا توجد صورة" />}
                          </div>
                          <div className="text-xs text-gray-500">انضم في {formatDateAr(user.createdAt)}</div>
                        </div>
                      </div>
                    </td>

                    {/* البريد الإلكتروني */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email || '-'}</div>
                    </td>

                    {/* الهاتف */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">{user.phone || '-'}</div>
                    </td>

                    {/* الصلاحية */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200'
                            : user.role === 'editor'
                            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {rolesLabel(user.role || 'user')}
                      </span>
                    </td>

                    {/* تحقق الإيميل + الحالة */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {user.isEmailVerified ? <CheckCircle className="w-4 h-4 text-emerald-500" title="محقق" /> : <XCircle className="w-4 h-4 text-gray-400" title="غير محقق" />}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} title={user.isActive ? 'نشط' : 'غير نشط'} />
                      </div>
                    </td>

                    {/* تاريخ الإنشاء */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{formatDateAr(user.createdAt)}</div>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => router.push(`/user/${user._id}`)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors duration-200 hover:scale-110" title="عرض">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUserById(user._id)} disabled={deletingId === user._id} className={`p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200 hover:scale-110 ${deletingId === user._id ? 'opacity-50 cursor-not-allowed' : ''}`} title={deletingId === user._id ? 'جارٍ الحذف…' : 'حذف'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => router.push(`/user/update/${user._id}`)} className="p-2 rounded-lg hover:bg-blue-100 text-yellow-600 transition-colors duration-200 hover:scale-110" title="تحديث">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      لا توجد نتائج.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض <span className="font-semibold text-gray-900">{toArabicDigits(showingFrom)}</span>
                {' '}–{' '}
                <span className="font-semibold text-gray-900">{toArabicDigits(showingTo)}</span>
                {' '}من{' '}
                <span className="font-semibold text-gray-900">{toArabicDigits(serverTotalUsers)}</span> مستخدم
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm" disabled={page <= 1} title="السابق">
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(serverTotalPages, 7) }).map((_, i) => {
                    let p = i + 1;
                    if (serverTotalPages > 7) {
                      if (i < 2) p = i + 1;
                      else if (i > 4) p = serverTotalPages - (6 - i);
                      else p = Math.max(1, Math.min(serverTotalPages, page - 3 + i));
                    }
                    const isActive = p === page;
                    return (
                      <button key={`${p}-${i}`} onClick={() => setPage(p)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 hover:shadow-sm'}`}>
                        {toArabicDigits(p)}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setPage((p) => Math.min(serverTotalPages, p + 1))} className="p-2 rounded-lg hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm" disabled={page >= serverTotalPages} title="التالي">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* helper: show how we’re calling */}
        {/* <div className="text-xs text-gray-400 mt-4">
          API: <code className="font-mono">{ENDPOINTS.list}?page={page}&limit={rowsPerPage}{query ? `&search=${encodeURIComponent(query)}` : ''}</code>
        </div> */}
      </div>
    </div>
  );
}
