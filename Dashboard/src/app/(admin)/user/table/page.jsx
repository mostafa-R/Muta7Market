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
  Loader2,
  RefreshCw,
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

const lineClampStyles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default function UsersDashboardTable() {
  const router = useRouter();

  const [rawUsers, setRawUsers] = React.useState([]); 
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [deletingId, setDeletingId] = React.useState(null);
  const [serverTotalPages, setServerTotalPages] = React.useState(1);
  const [serverTotalUsers, setServerTotalUsers] = React.useState(0);

  const arLocale = 'ar-EG';

  const toArabicDigits = (input) => {
    const map = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
    return String(input).replace(/[0-9]/g, (d) => map[d] || d);
  };

  const rolesLabel = (r) => (r === 'admin' ? 'مدير' : 'مستخدم');

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

  const fetchUsers = React.useCallback(
    async (opts = {}, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      try {
        const p = new URLSearchParams();
        p.set('page', String(opts?.page ?? page));
        p.set('limit', String(opts?.limit ?? rowsPerPage));
        if ((opts?.search ?? query).trim()) p.set('search', (opts?.search ?? query).trim());
        p.set('sortBy', opts?.sortBy ?? sortBy);
        p.set('sortDir', opts?.sortDir ?? sortDir);

        const url = `${ENDPOINTS.list}?${p.toString()}`;
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const listRaw = json?.data?.users ?? [];
        const list = (Array.isArray(listRaw) ? listRaw : []).filter(
          (u) => u && typeof u === 'object' && u._id
        );

        setRawUsers(list);

        const pg = json?.data?.pagination;
        if (pg) {
          setServerTotalPages(pg.totalPages || 1);
          setServerTotalUsers(pg.totalUsers || list.length);
          if (typeof pg.currentPage === 'number' && pg.currentPage !== page) {
            setPage(pg.currentPage);
          }
        } else {
          setServerTotalPages(1);
          setServerTotalUsers(list.length);
        }
      } catch (e) {
        console.error('fetchUsers error:', e);
        setError('فشل في جلب المستخدمين. تأكد من الاتصال بالإنترنت والصلاحيات.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        if (initialLoading) setInitialLoading(false);
      }
    },
    [authHeaders, rowsPerPage, sortBy, sortDir, query, initialLoading]
  );

  React.useEffect(() => {
    fetchUsers({ page, limit: rowsPerPage, sortBy, sortDir, search: query });
  }, [fetchUsers, page, rowsPerPage, sortBy, sortDir, query]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchUsers({ page: 1, limit: rowsPerPage, sortBy, sortDir, search: query });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [fetchUsers, query]);

  const users = React.useMemo(() => {
    return [...rawUsers].sort((a, b) => {
      const isDate = sortBy === 'createdAt' || sortBy === 'lastLogin';
      const Araw = a?.[sortBy];
      const Braw = b?.[sortBy];

      if (Araw == null && Braw == null) return 0;
      if (Araw == null) return sortDir === 'asc' ? 1 : -1;
      if (Braw == null) return sortDir === 'asc' ? -1 : 1;

      if (isDate) {
        const A = new Date(Araw || 0).getTime();
        const B = new Date(Braw || 0).getTime();
        return sortDir === 'asc' ? A - B : B - A;
      }

      if (typeof Araw === 'string' && typeof Braw === 'string') {
        return sortDir === 'asc' ? Araw.localeCompare(Braw) : Braw.localeCompare(Araw);
      }

      if (typeof Araw === 'boolean' && typeof Braw === 'boolean') {
        return sortDir === 'asc' ? (Araw === Braw ? 0 : Araw ? -1 : 1) : Braw === Araw ? 0 : Braw ? -1 : 1;
      }

      return sortDir === 'asc' ? (Araw > Braw ? 1 : -1) : Araw < Braw ? 1 : -1;
    });
  }, [rawUsers, sortBy, sortDir]);

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
        
        await fetchUsers({ page, limit: rowsPerPage, sortBy, sortDir, search: query });
        await Swal.fire({ title: 'تم الحذف', text: 'تم حذف المستخدم بنجاح.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (e) {
        console.error('deleteUserById error:', e);
        await Swal.fire({ title: 'خطأ', text: 'تعذر حذف المستخدم. حاول مرة أخرى.', icon: 'error', confirmButtonColor: '#3085d6' });
      } finally {
        setDeletingId(null);
      }
    },
    [authHeaders, fetchUsers, page, rowsPerPage, sortBy, sortDir, query]
  );

  const Avatar = React.memo(({ name, src }) => {
    if (src) {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gray-100 flex items-center justify-center">
          <img 
            src={src} 
            alt={name || 'صورة المستخدم'} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling?.style.setProperty('display', 'flex');
            }}
          />
          <div className="w-full h-full hidden items-center justify-center text-gray-500 text-xs bg-gray-100">
            <ImageIcon className="w-4 h-4" />
          </div>
        </div>
      );
    }
    
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
      'from-pink-500 to-rose-600'
    ];
    const colorIndex = (String(name || '').length || 0) % colors.length;
    
    return (
      <div 
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}
        title={name || 'مستخدم'}
        role="img"
        aria-label={`صورة ${name || 'المستخدم'}`}
      >
        {initials || 'U'}
      </div>
    );
  });

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const toggleSort = (col) => {
    const newSortDir = sortBy === col ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortBy(col);
    setSortDir(newSortDir);
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

  const showingFrom = users.length ? (page - 1) * rowsPerPage + 1 : 0;
  const showingTo = (page - 1) * rowsPerPage + users.length;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">جارٍ تحميل المستخدمين</h2>
          <p className="text-sm text-gray-500">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: lineClampStyles }} />
      <div className="min-h-screen p-4 sm:p-6 bg-gray-50" dir="rtl">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
                <p className="text-gray-600 mt-1">إدارة وتتبع جميع المستخدمين في النظام</p>
              </div>
              {(loading || refreshing) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{refreshing ? 'جاري التحديث...' : 'جاري التحميل...'}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
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
                    placeholder="البحث في الاسم والبريد الإلكتروني..."
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white dark:bg-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full sm:w-80"
                    disabled={loading}
                    aria-label="البحث في المستخدمين"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="مسح البحث"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
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

                  <button 
                    onClick={exportCSV} 
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || users.length === 0}
                    title="تصدير البيانات إلى ملف CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">تصدير CSV</span>
                  </button>

                  <button 
                    onClick={() => fetchUsers({ page, limit: rowsPerPage, sortBy, sortDir, search: query }, true)} 
                    disabled={loading || refreshing} 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="تحديث البيانات"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">تحديث</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px]" dir="rtl">
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
                  <tr key={user._id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-800/10'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={user.name} src={user?.profileImage?.url} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="line-clamp-1 max-w-48" title={user.name || 'غير محدد'}>
                              {user.name || 'غير محدد'}
                            </span>
                            {!user?.profileImage?.url && (
                              <ImageIcon className="w-4 h-4 text-gray-300 flex-shrink-0" title="لا توجد صورة" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            انضم في {formatDateAr(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-mono">
                        <span className="line-clamp-1 max-w-48" title={user.email || 'غير محدد'}>
                          {user.email || 'غير محدد'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">
                        <span className="line-clamp-1 max-w-32" title={user.phone || 'غير محدد'}>
                          {user.phone || 'غير محدد'}
                        </span>
                      </div>
                    </td>

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

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{formatDateAr(user.createdAt)}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => router.push(`/user/${user._id}`)} 
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200" 
                          title="عرض تفاصيل المستخدم"
                          aria-label={`عرض تفاصيل المستخدم ${user.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => router.push(`/user/update/${user._id}`)} 
                          className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-yellow-200" 
                          title="تحرير المستخدم"
                          aria-label={`تحرير المستخدم ${user.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteUserById(user._id)} 
                          disabled={deletingId === user._id} 
                          className={`p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-200 ${
                            deletingId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`} 
                          title={deletingId === user._id ? 'جارٍ الحذف…' : 'حذف المستخدم'}
                          aria-label={`حذف المستخدم ${user.name}`}
                        >
                          {deletingId === user._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-300" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">لا توجد مستخدمين</h3>
                          <p className="text-sm text-gray-500">
                            {query ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يتم العثور على أي مستخدمين في النظام'}
                          </p>
                        </div>
                        {query && (
                          <button
                            onClick={() => setQuery('')}
                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                          >
                            مسح البحث
                          </button>
                        )}
                      </div>
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
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                    let endPage = Math.min(serverTotalPages, startPage + maxVisible - 1);
                    
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    if (startPage > 1) {
                      pages.push(
                        <button
                          key="1"
                          onClick={() => setPage(1)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 hover:shadow-sm"
                        >
                          {toArabicDigits(1)}
                        </button>
                      );
                      
                      if (startPage > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                        );
                      }
                    }

                    for (let p = startPage; p <= endPage; p++) {
                      const isActive = p === page;
                      pages.push(
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 hover:shadow-sm'
                          }`}
                        >
                          {toArabicDigits(p)}
                        </button>
                      );
                    }

                    if (endPage < serverTotalPages) {
                      if (endPage < serverTotalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={serverTotalPages}
                          onClick={() => setPage(serverTotalPages)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 hover:shadow-sm"
                        >
                          {toArabicDigits(serverTotalPages)}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button onClick={() => setPage((p) => Math.min(serverTotalPages, p + 1))} className="p-2 rounded-lg hover:bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm" disabled={page >= serverTotalPages} title="التالي">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}