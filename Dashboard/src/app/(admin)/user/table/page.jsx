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
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const SortIcon = React.memo(({ column, sortBy, sortDir }) => {
  if (sortBy !== column) {
    return <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />;
  }
  return sortDir === 'asc' ? 
    <ArrowUp className="w-4 h-4 text-blue-600" /> : 
    <ArrowDown className="w-4 h-4 text-blue-600" />;
});

const Avatar = React.memo(({ name, profilePicture }) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gray-100 flex items-center justify-center">
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt={name || 'صورة المستخدم'} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Users className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate" title={name}>
        {name || 'بدون اسم'}
      </p>
    </div>
  </div>
));

const RoleBadge = React.memo(({ role }) => {
  const roleInfo = useMemo(() => {
    if (role === 'admin') return { 
      label: 'مدير', 
      class: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Shield className="w-3 h-3" />
    };
    return { 
      label: 'مستخدم', 
      class: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Users className="w-3 h-3" />
    };
  }, [role]);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${roleInfo.class}`}>
      {roleInfo.icon}
      {roleInfo.label}
    </span>
  );
});

const BooleanBadge = React.memo(({ value, trueLabel = 'نعم', falseLabel = 'لا' }) => {
  const info = useMemo(() => 
    value ? 
      { label: trueLabel, class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> } :
      { label: falseLabel, class: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> }
  , [value, trueLabel, falseLabel]);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${info.class}`}>
      {info.icon}
      {info.label}
    </span>
  );
});

const TableActions = React.memo(({ user, onView, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onView(user._id)}
      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
      title="عرض التفاصيل"
    >
      <Eye className="w-4 h-4" />
    </button>
    <button
      onClick={() => onEdit(user._id)}
      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
      title="تعديل"
    >
      <Edit3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onDelete(user._id)}
      disabled={deletingId === user._id}
      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="حذف"
    >
      {deletingId === user._id ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  </div>
));

const UserRow = React.memo(({ user, onView, onEdit, onDelete, deletingId }) => (
  <tr className="transition-colors duration-150 hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <Avatar name={user.name} profilePicture={user.profilePicture} />
    </td>
    <td className="px-6 py-4 text-sm text-gray-900 max-w-0">
      <div className="truncate" title={user.email}>
        {user.email || '-'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <RoleBadge role={user.role} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <BooleanBadge value={user.isVerified} trueLabel="مؤكد" falseLabel="غير مؤكد" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <BooleanBadge value={user.isActive} trueLabel="نشط" falseLabel="غير نشط" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
      {user.joinDate}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <TableActions 
        user={user}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        deletingId={deletingId}
      />
    </td>
  </tr>
));

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

export default function UsersDashboardTable() {
  const router = useRouter();

  const [rawUsers, setRawUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalUsers, setServerTotalUsers] = useState(0);

  const abortControllerRef = useRef(null);
  const stateRef = useRef();

  const arLocale = 'ar-EG';

  const toArabicDigits = useCallback((input) => {
    const map = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
    return String(input).replace(/[0-9]/g, (d) => map[d] || d);
  }, []);

  const rolesLabel = useCallback((r) => (r === 'admin' ? 'مدير' : 'مستخدم'), []);

  const formatDateAr = useCallback((iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString(arLocale, { hour12: false });
    } catch {
      return iso;
    }
  }, [arLocale]);

  const authHeaders = useCallback(() => {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchUsers = useCallback(
    async (opts = {}, isRefresh = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const currentPage = opts.page ?? page;
        const currentLimit = opts.limit ?? rowsPerPage;
        const currentSearch = opts.search !== undefined ? opts.search : query;
        const currentSortBy = opts.sortBy ?? sortBy;
        const currentSortDir = opts.sortDir ?? sortDir;
        
        const searchParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(currentLimit),
          ...(currentSearch ? { search: currentSearch } : {}),
          ...(currentSortBy ? { sortBy: currentSortBy } : {}),
          ...(currentSortDir ? { sortDir: currentSortDir } : {}),
        });

        const res = await fetch(`${ENDPOINTS.list}?${searchParams}`, {
          headers: authHeaders(),
          cache: 'no-store',
          signal
        });

        if (!res.ok) {
          const errorMsg = res.status === 401 ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 
                          res.status === 403 ? 'ليس لديك صلاحية للوصول لهذه البيانات.' :
                          'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
          throw new Error(errorMsg);
        }

        const json = await res.json();
        
        if (signal.aborted) return;

        const responseData = json?.data || json;
        const users = responseData?.users || [];
        const pagination = responseData?.pagination || {};
        const total = pagination?.totalUsers || responseData?.totalUsers || users.length;
        const totalPages = pagination?.totalPages || responseData?.totalPages || Math.ceil(total / (opts.limit ?? rowsPerPage));

        const processedUsers = users.map((u) => ({
          ...u,
          _id: u.id || u._id,
          joinDate: formatDateAr(u.createdAt),
          rolesLabel: rolesLabel(u.role),
        }));

        setRawUsers(processedUsers);
        setServerTotalUsers(total);
        setServerTotalPages(totalPages);
        setError('');
      } catch (err) {
        if (err.name === 'AbortError') return; 
        
        console.error('Fetch users error:', err);
        setError(err.message || 'حدث خطأ في تحميل البيانات');
        await Toast.fire({ icon: 'error', title: err.message || 'خطأ في تحميل البيانات' });
        setRawUsers([]);
        setServerTotalUsers(0);
        setServerTotalPages(1);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setRefreshing(false);
          setInitialLoading(false);
        }
      }
    },
    [authHeaders, formatDateAr, rolesLabel]
  );

  const displayUsers = useMemo(() => {
    return rawUsers; 
  }, [rawUsers]);

  const analytics = useMemo(() => {
    const admins = displayUsers.filter(u => u.role === 'admin');
    const verified = displayUsers.filter(u => u.isVerified);
    const active = displayUsers.filter(u => u.isActive);
    
    return {
      total: displayUsers.length,
      admins: admins.length,
      verified: verified.length,
      active: active.length
    };
  }, [displayUsers]);

  const paginationInfo = useMemo(() => ({
    totalPages: Math.max(1, serverTotalPages),
    pageStart: (page - 1) * rowsPerPage + 1,
    pageEnd: Math.min(page * rowsPerPage, serverTotalUsers)
  }), [serverTotalPages, page, rowsPerPage, serverTotalUsers]);

  const toggleSort = useCallback((col) => {
    if (sortBy === col) {
      setSortDir(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }, [sortBy]);

  const handleView = useCallback((id) => {
    router.push(`/user/${id}`);
  }, [router]);

  const handleEdit = useCallback((id) => {
    router.push(`/user/update/${id}`);
  }, [router]);

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(ENDPOINTS.delete(id), {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error('فشل في حذف المستخدم');
      }

      await Toast.fire({ icon: 'success', title: 'تم حذف المستخدم بنجاح' });
      await fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      await Toast.fire({ icon: 'error', title: err.message || 'خطأ في حذف المستخدم' });
    } finally {
      setDeletingId(null);
    }
  }, [authHeaders, fetchUsers]);

  const exportToCsv = useCallback(() => {
    const headers = ['الرقم', 'الاسم', 'البريد الإلكتروني', 'الدور', 'مؤكد', 'نشط', 'تاريخ الانضمام'];
    const rowsCsv = displayUsers.map((u) => [
      u._id,
      u.name,
      u.email,
      u.rolesLabel,
      u.isVerified ? 'نعم' : 'لا',
      u.isActive ? 'نعم' : 'لا',
      u.joinDate,
    ]);
    const csvContent = [headers, ...rowsCsv].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [displayUsers]);


  useEffect(() => {
    fetchUsers();
  }, []); 

  useEffect(() => {
    if (!initialLoading) { 
      fetchUsers({
        page,
        limit: rowsPerPage,
        search: query,
        sortBy,
        sortDir
      });
    }
  }, [page, rowsPerPage, sortBy, sortDir, initialLoading]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) {
        setPage(1); 
      } else {
        fetchUsers({ search: query, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جارٍ تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: lineClampStyles }} />
      
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">إدارة المستخدمين</h1>
            <p className="text-blue-100">إدارة وعرض جميع المستخدمين المسجلين في النظام</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold">{serverTotalUsers}</p>
              <p className="text-blue-200">إجمالي المستخدمين</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-400">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{serverTotalUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المدراء</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.admins}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المؤكدون</p>
              <p className="text-2xl font-bold text-emerald-600">{analytics.verified}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">النشطون</p>
              <p className="text-2xl font-bold text-green-600">{analytics.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الإيميل..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:w-64 lg:w-72 pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                <span>عدد الصفوف:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setRowsPerPage(newLimit);
                    setPage(1);
                   
                    if (!loading) setLoading(true);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                  disabled={loading || refreshing}
                >
                  {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value={serverTotalUsers > 0 ? serverTotalUsers : 1000}>عرض الكل ({serverTotalUsers})</option>
                </select>
              </div>

              {(loading || refreshing) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{refreshing ? 'جاري التحديث...' : 'جاري التحميل...'}</span>
                </div>
              )}

              <button
                onClick={exportToCsv}
                disabled={loading || !displayUsers.length}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تصدير البيانات"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              <button
                onClick={() => {
                  setRowsPerPage(serverTotalUsers > 0 ? serverTotalUsers : 1000);
                  setPage(1);
                }}
                disabled={loading || refreshing || serverTotalUsers === 0}
                className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="عرض جميع المستخدمين"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">عرض الكل</span>
              </button>

              <button
                onClick={() => fetchUsers({}, true)}
                disabled={loading || refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>
            </div>
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

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span>المستخدم</span>
                    <SortIcon column="name" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    <span>البريد الإلكتروني</span>
                    <SortIcon column="email" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('role')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>الدور</span>
                    <SortIcon column="role" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('isVerified')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>مؤكد</span>
                    <SortIcon column="isVerified" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('isActive')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>نشط</span>
                    <SortIcon column="isActive" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>تاريخ الانضمام</span>
                    <SortIcon column="createdAt" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">جارٍ تحميل المستخدمين</h3>
                        <p className="text-sm text-gray-500">يرجى الانتظار...</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <XCircle className="w-12 h-12 text-red-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">خطأ في تحميل البيانات</h3>
                        <p className="text-sm text-gray-500 mb-3">{error}</p>
                        <button
                          onClick={() => fetchUsers()}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          إعادة المحاولة
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users className="w-12 h-12 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">لا يوجد مستخدمون</h3>
                        <p className="text-sm text-gray-500">
                          {query ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يتم العثور على أي مستخدمين'}
                        </p>
                        {query && (
                          <button
                            onClick={() => setQuery('')}
                            className="text-sm text-blue-600 hover:text-blue-700 underline mt-2"
                          >
                            مسح البحث
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              عرض <span className="font-medium">{paginationInfo.pageStart}</span> إلى{' '}
              <span className="font-medium">{paginationInfo.pageEnd}</span> من{' '}
              <span className="font-medium">{serverTotalUsers}</span> مستخدم
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Page input for direct navigation */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max={paginationInfo.totalPages}
                  value={page}
                  onChange={(e) => {
                    const newPage = Math.max(1, Math.min(paginationInfo.totalPages, Number(e.target.value) || 1));
                    setPage(newPage);
                  }}
                  className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  disabled={loading}
                />
                <span className="text-sm text-gray-500">من {paginationInfo.totalPages}</span>
              </div>
              
              <button
                onClick={() => setPage(Math.min(paginationInfo.totalPages, page + 1))}
                disabled={page >= paginationInfo.totalPages || loading}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}