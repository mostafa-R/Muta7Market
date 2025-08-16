'use client';

import React from 'react';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Download,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
// Adjust these if your backend paths differ:
const ENDPOINTS = {
  list: `${BASE}/users`,
  one: (id) => `${BASE}/users/${id}`,
  delete: (id) => `${BASE}/users/${id}`,
};

export default function UsersDashboardTable() {
  const router = useRouter();

  // ------- DATA STATE (matches backend response) -------
  const [users, setUsers] = React.useState([]); // [{ _id, name, email, phone, role, isEmailVerified, isActive, createdAt, lastLogin }]
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // ------- TABLE STATE -------
  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name'); // 'name' | 'email' | 'role' | 'createdAt' | ...
  const [sortDir, setSortDir] = React.useState('asc'); // 'asc' | 'desc'
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [deletingId, setDeletingId] = React.useState(null);

  // ------- AUTH HEADER -------
  const authHeaders = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // ------- API CALLS -------
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(ENDPOINTS.list, { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Expecting: { statusCode, data: { users: [...] }, message, success }
      const list = json?.data?.users ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('فشل في جلب المستخدمين. تحقق من الـ BASE_URL أو التوكن.');
      console.error('fetchUsers error:', e);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);


  const deleteUserById = React.useCallback(async (id) => {
    // confirm dialog
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
      const res = await fetch(ENDPOINTS.delete(id), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
      // optimistic update
      setUsers((prev) => prev.filter((u) => u._id !== id));
  
      // success toast
      await Swal.fire({
        title: 'تم الحذف',
        text: 'تم حذف المستخدم بنجاح.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error('deleteUserById error:', e);
      await Swal.fire({
        title: 'خطأ',
        text: 'تعذر حذف المستخدم. حاول مرة أخرى.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setDeletingId(null);
    }
  }, [authHeaders, setUsers]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ------- HELPERS -------
  const rolesLabel = (r) =>
    r === 'admin' ? 'مدير' : r === 'editor' ? 'محرر' : 'مستخدم';

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return (
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        role.includes(q)
      );
    });
  }, [users, query]);

  const sorted = React.useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const A = a?.[sortBy] ?? '';
      const B = b?.[sortBy] ?? '';
      // normalize dates
      const isDate = sortBy === 'createdAt' || sortBy === 'lastLogin';
      const _A = isDate ? new Date(A).getTime() || 0 : A;
      const _B = isDate ? new Date(B).getTime() || 0 : B;

      if (typeof _A === 'string' && typeof _B === 'string') {
        return sortDir === 'asc' ? _A.localeCompare(_B) : _B.localeCompare(_A);
      }
      if (typeof _A === 'boolean' && typeof _B === 'boolean') {
        return sortDir === 'asc' ? Number(_A) - Number(_B) : Number(_B) - Number(_A);
      }
      return sortDir === 'asc' ? (_A > _B ? 1 : -1) : (_A > _B ? -1 : 1);
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const headers = [
      'المعرف',
      'الاسم',
      'البريد الإلكتروني',
      'الهاتف',
      'الصلاحية',
      'محقق الإيميل',
      'نشط',
      'تاريخ الإنشاء',
      'آخر تسجيل دخول',
    ];
    const rows = sorted.map((u) => [
      u._id,
      u.name || '-',
      u.email || '-',
      u.phone || '-',
      rolesLabel(u.role || 'user'),
      u.isEmailVerified ? 'نعم' : 'لا',
      u.isActive ? 'نعم' : 'لا',
      u.createdAt ? new Date(u.createdAt).toLocaleString() : '-',
      u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
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

  // ------- UI helpers -------
  const Avatar = ({ name }) => {
    const initials = String(name || '')
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0] || '')
      .join('')
      .toUpperCase();
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
    ];
    const colorIndex = (String(name || '').length || 0) % colors.length;
    return (
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}
      >
        {initials || 'U'}
      </div>
    );
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column)
      return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
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
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">النشطون</p>
                <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.isActive).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إيميل محقق</p>
                <p className="text-2xl font-bold text-indigo-600">{users.filter((u) => u.isEmailVerified).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المديرون</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === 'admin').length}</p>
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
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="ابحث بالاسم، الإيميل، الهاتف أو الصلاحية..."
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
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white  dark:bg-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
                    <ChevronRight className="w-4 h-4" />
                    <span className="hidden sm:inline">الرجوع للصفحة الرئيسية</span>
                  </button>

                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">تصدير CSV</span>
                  </button>

                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
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
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>المستخدم</span>
                      <SortIcon column="name" />
                    </div>
                  </th>

                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      <span>البريد الإلكتروني</span>
                      <SortIcon column="email" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الهاتف
                  </th>

                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الصلاحية</span>
                      <SortIcon column="role" />
                    </div>
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('isEmailVerified')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>تحقق الإيميل</span>
                      <SortIcon column="isEmailVerified" />
                    </div>
                  </th>

                  <th
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('isActive')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>الحالة</span>
                      <SortIcon column="isActive" />
                    </div>
                  </th>

                  <th
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      <span>تاريخ الإنشاء</span>
                      <SortIcon column="createdAt" />
                    </div>
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                {pageData.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30  dark:bg-gray-800/10 '
                    }`}
                  >
                    {/* المستخدم */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={user.name} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name || '-'}</div>
                          <div className="text-xs text-gray-500">
                            انضم في {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                          </div>
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
                        {user.isEmailVerified ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" title="محقق" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" title="غير محقق" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                          }`}
                          title={user.isActive ? 'نشط' : 'غير نشط'}
                        />
                      </div>
                    </td>

                    {/* تاريخ الإنشاء */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                      <button
  onClick={() => router.push(`/user/${user._id}`)}
  className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors duration-200 hover:scale-110"
  title="عرض"
>
  <Eye className="w-4 h-4" />
</button>
                        <button
  onClick={() => deleteUserById(user._id)}
  disabled={deletingId === user._id}
  className={`p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200 hover:scale-110 ${
    deletingId === user._id ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  title={deletingId === user._id ? 'جارٍ الحذف…' : 'حذف'}
>
  <Trash2 className="w-4 h-4" />
</button>
<button
  onClick={() => router.push(`/user/update/${user._id}`)}
  className="p-2 rounded-lg hover:bg-blue-100 text-yellow-600 transition-colors duration-200 hover:scale-110"
  title="تحديث"
>
  <Edit3 className="w-4 h-4" />
</button>

                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && pageData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      لا توجد نتائج مطابقة.
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
                عرض <span className="font-semibold text-gray-900">{(page - 1) * rowsPerPage + 1}</span> -
                <span className="font-semibold text-gray-900"> {Math.min(page * rowsPerPage, sorted.length)}</span> من
                <span className="font-semibold text-gray-900"> {sorted.length}</span> مستخدم
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
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
                            : 'hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 hover:shadow-sm'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  disabled={page === totalPages}
                  title="التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* helper: show how we’re calling */}
        <div className="text-xs text-gray-400 mt-4">
          BASE_URL: <code className="font-mono">{BASE}</code>
        </div>
      </div>
    </div>
  );
}
