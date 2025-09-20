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
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const API_ROOT = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_BASE = `${API_ROOT}/admin`;

const ENDPOINTS = {
  list: (params) => `${ADMIN_BASE}/players?${params.toString()}`,
  delete: (id) => `${ADMIN_BASE}/players/${id}`,
};

const SortIcon = React.memo(({ column, sortBy, sortDir }) => {
  if (sortBy !== column) {
    return <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />;
  }
  return sortDir === 'asc' ? 
    <ArrowUp className="w-4 h-4 text-blue-600" /> : 
    <ArrowDown className="w-4 h-4 text-blue-600" />;
});

const Avatar = React.memo(({ name, src, promoted }) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gray-100 flex items-center justify-center">
        {src ? (
          <img 
            src={src} 
            alt={name || 'صورة المدرب'} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Users className="w-5 h-5 text-gray-400" />
        )}
      </div>
      {promoted && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-yellow-800" />
        </div>
      )}
    </div>
  </div>
));

const StatusBadge = React.memo(({ status, label }) => {
  const statusInfo = useMemo(() => {
    const statusClass = {
      available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      contracted: 'bg-purple-100 text-purple-700 border-purple-200',
      transferred: 'bg-amber-100 text-amber-700 border-amber-200',
      recently_transferred: 'bg-blue-100 text-blue-700 border-blue-200',
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return { class: statusClass, label: label || status };
  }, [status, label]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.class}`}>
      {statusInfo.label}
    </span>
  );
});

const BooleanBadge = React.memo(({ value, trueText = 'نعم', falseText = 'لا' }) => {
  const info = useMemo(() => 
    value ? 
      { label: trueText, class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> } :
      { label: falseText, class: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> }
  , [value, trueText, falseText]);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${info.class}`}>
      {info.icon}
      {info.label}
    </span>
  );
});

const GenderBadge = React.memo(({ gender }) => {
  const genderInfo = useMemo(() => ({
    male: { label: 'ذكر', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    female: { label: 'أنثى', class: 'bg-pink-50 text-pink-700 border-pink-200' },
  }[String(gender || '').toLowerCase()] || { label: gender || 'غير محدد', class: 'bg-gray-50 text-gray-700 border-gray-200' }), [gender]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${genderInfo.class}`}>
      {genderInfo.label}
    </span>
  );
});

const TableActions = React.memo(({ coach, onView, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => onView(coach._id)}
      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
      title="عرض تفاصيل المدرب"
    >
      <Eye className="w-4 h-4" />
    </button>
    <button
      onClick={() => onEdit(coach._id)}
      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
      title="تعديل المدرب"
    >
      <Edit3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onDelete(coach._id)}
      disabled={deletingId === coach._id}
      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="حذف المدرب"
    >
      {deletingId === coach._id ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  </div>
));

const CoachRow = React.memo(({ coach, onView, onEdit, onDelete, deletingId, statusClass }) => (
  <tr className="transition-colors duration-150 hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <Avatar name={coach.name} src={coach.media.profileImage.url} promoted={coach.isPromoted} />
        <div className="min-w-20 flex-1">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
            <span className="line-clamp-1 min-w-28" title={coach.name}>
              {coach.name}
            </span>
            {coach.isPromoted && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" title="مروّج" />}
          </div>
          <div className="text-xs text-gray-500 mt-1">انضم في {coach.joinDate}</div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4">
      <div className="text-sm text-gray-900 font-mono truncate">
        <span className="truncate" title={coach.email}>
          {coach.email}
        </span>
      </div>
    </td>

    <td className="px-6 py-4">
      <GenderBadge gender={coach.gender} />
    </td>

    <td className="px-6 py-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" title={coach.nationality}>
        <span className="truncate">{coach.nationality}</span>
      </span>
    </td>

    <td className="px-6 py-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200" title={coach.game}>
        <span className="truncate">{coach.game}</span>
      </span>
    </td>

    <td className="px-6 py-4 text-center">
      <span className="text-sm font-medium text-gray-700">
        {coach.age || '-'}
      </span>
    </td>

    <td className="px-6 py-4 text-center">
      <StatusBadge status={coach.status} label={coach.statusLabel} />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={coach.isPromoted} trueText="مروّج" falseText="عادي" />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={coach.isConfirmed} trueText="مؤكَّد" falseText="غير مؤكَّد" />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={coach.isActive} trueText="نشط" falseText="غير نشط" />
    </td>

    <td className="px-6 py-4 text-center">
      <TableActions 
        coach={coach} 
        onView={onView}
        onEdit={onEdit} 
        onDelete={onDelete} 
        deletingId={deletingId} 
      />
    </td>
  </tr>
));

const getSportsDisplayValue = (sportsData) => {
  if (!sportsData) return '-';
  
  if (typeof sportsData === 'string') {
    return sportsData || '-';
  }
  
  if (typeof sportsData === 'object' && sportsData.ar) {
    return sportsData.ar;
  }
  
  if (typeof sportsData === 'object' && sportsData.en) {
    return sportsData.en;
  }
  
  return '-';
};

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
  transferred: 'منتقل',
  recently_transferred: 'منتقل حديثًا',
}[s] || s);

const statusClass = (s) =>
  ({
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  contracted: 'bg-purple-100 text-purple-700 border-purple-200',
  transferred: 'bg-amber-100 text-amber-700 border-amber-200',
  recently_transferred: 'bg-blue-100 text-blue-700 border-blue-200',
}[s] || 'bg-gray-100 text-gray-700 border-gray-200');

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

async function extractBackendError(res) {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const json = await res.json();
      return json?.message || json?.error || `خطأ ${res.status}`;
    } else {
      const text = await res.text();
      return text || `خطأ ${res.status}`;
    }
  } catch {
    return `خطأ ${res.status}`;
  }
}

export default function CoachesDashboardTable() {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterMode, setFilterMode] = useState('all');
  const [confirmFilter, setConfirmFilter] = useState('all');

  const [databaseAnalytics, setDatabaseAnalytics] = useState({
    totalCoaches: 0,
    promotedCoaches: 0,
    confirmedCoaches: 0,
    activeCoaches: 0
  });

  const fetchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const authHeaders = useCallback(() => {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(rowsPerPage),
      jop: 'coach',
    });

    if (query.trim()) {
      params.set('search', query.trim());
    }
    return params;
  }, [page, rowsPerPage, query]);

  const mapCoaches = useCallback((coaches) => {
    if (!Array.isArray(coaches)) {
      console.warn('Expected coaches to be an array, got:', typeof coaches, coaches);
      return [];
    }
    
    return coaches.map((c) => {
      const status = deriveStatus(c);
        return {
        ...c,
        _id: c.id || c._id,
        email: c.user?.email || c.contactInfo?.email || c.email || '-',
        status,
        statusLabel: statusLabel(status),
        joinDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '-',
        game: getSportsDisplayValue(c.game),

        isPromoted: Boolean(c.isPromoted && c.isPromoted.status === true),
        isConfirmed: Boolean(c.isConfirmed === true),
        isActive: Boolean(c.isActive === true),
        };
      });
  }, []);

  const calculateDatabaseAnalytics = useCallback(async () => {
    try {
      const countQuery = new URLSearchParams({
        page: '1',
        pageSize: '1',
        jop: 'coach'
      });
      
      const countRes = await fetch(`/api/players?${countQuery}`, {
        headers: authHeaders(),
        cache: 'no-store'
      });

      let totalCoaches = 0;
      if (countRes.ok) {
        const countJson = await countRes.json();
        totalCoaches = Number(countJson?.data?.pagination?.totalPlayers || 0);
      }

      const pageSize = 500; 
      const totalPages = Math.ceil(totalCoaches / pageSize);
      let allCoaches = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const coachQuery = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          jop: 'coach'
        });
        
        const res = await fetch(`/api/players?${coachQuery}`, {
          headers: authHeaders(),
          cache: 'no-store'
        });

        if (res.ok) {
          const json = await res.json();
          const coaches = Array.isArray(json?.data?.players) ? json.data.players : [];
          allCoaches = [...allCoaches, ...coaches];
        }
      }
      
      if (allCoaches.length > 0) {
        const mappedCoaches = mapCoaches(allCoaches);
        
        let promotedCount = 0;
        let confirmedCount = 0;
        let activeCount = 0;
        
        mappedCoaches.forEach((coach) => {
          if (coach.isPromoted) promotedCount++;
          if (coach.isConfirmed) confirmedCount++;
          if (coach.isActive) activeCount++;
        });
        
        const newAnalytics = {
          totalCoaches: allCoaches.length,
          promotedCoaches: promotedCount,
          confirmedCoaches: confirmedCount,
          activeCoaches: activeCount
        };
        
        setDatabaseAnalytics(newAnalytics);
      } else {
        setDatabaseAnalytics({
          totalCoaches: 0,
          promotedCoaches: 0,
          confirmedCoaches: 0,
          activeCoaches: 0
        });
      }

    } catch (error) {
      console.error('Failed to fetch coaches analytics:', error);
    }
  }, [authHeaders, mapCoaches]);

  const fetchCoaches = useCallback(async (isRefresh = false) => {
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
      const params = buildQueryParams();
      const url = ENDPOINTS.list(params);
      const res = await fetch(url, { 
        headers: authHeaders(), 
        cache: 'no-store',
        signal 
      });

      if (!res.ok) {
        const msg = await extractBackendError(res);
        throw new Error(msg);
      }

      const json = await res.json();
      
      if (signal.aborted) return;

      const coaches = Array.isArray(json?.data?.players) ? json.data.players : [];
      const total = json?.data?.pagination?.totalPlayers ?? json?.data?.pagination?.total ?? coaches.length;
      const pages = Math.ceil(total / rowsPerPage);

      const mapped = mapCoaches(coaches);
      setRows(mapped);
      setTotalCount(total);
      setServerTotalPages(pages);
      setError('');
    } catch (err) {
      if (err.name === 'AbortError') return; 
      
      console.error('Fetch coaches error:', err);
      setError(err.message || 'حدث خطأ في تحميل البيانات');
      await Toast.fire({ icon: 'error', title: err.message || 'خطأ في تحميل البيانات' });
      setRows([]);
      setTotalCount(0);
      setServerTotalPages(1);
    } finally {
      if (!signal.aborted) {
      setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    }
  }, [buildQueryParams, authHeaders, mapCoaches, rowsPerPage]);

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchCoaches();
    }, query ? 500 : 0);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchCoaches]);

  useEffect(() => {
    calculateDatabaseAnalytics();
  }, [calculateDatabaseAnalytics]);

  const rankRow = useCallback((index) => {
    return (page - 1) * rowsPerPage + index + 1;
  }, [page, rowsPerPage]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (!sortBy) return copy;
    
    copy.sort((a, b) => {
      const A = a[sortBy] ?? '';
      const B = b[sortBy] ?? '';
      if (typeof A === 'string' && typeof B === 'string') {
        return sortDir === 'asc' ? A.localeCompare(B, 'ar') : B.localeCompare(A, 'ar');
      }
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (A > B ? -1 : 1);
    });
    return copy;
  }, [rows, sortBy, sortDir, rankRow]);

  const analytics = useMemo(() => {
    const avgAge = rows.length > 0 ? Math.round(rows.reduce((sum, c) => sum + (c.age || 0), 0) / rows.length) : 0;
    
    if (databaseAnalytics.totalCoaches > 0) {
      return {
        total: databaseAnalytics.totalCoaches,
        promoted: databaseAnalytics.promotedCoaches,
        confirmed: databaseAnalytics.confirmedCoaches,
        active: databaseAnalytics.activeCoaches,
        avgAge
      };
    }
    
    const promoted = rows.filter(c => c.isPromoted);
    const confirmed = rows.filter(c => c.isConfirmed);
    const active = rows.filter(c => c.isActive);
    
    return {
      total: totalCount || rows.length,
      promoted: promoted.length,
      confirmed: confirmed.length,
      active: active.length,
      avgAge
    };
  }, [databaseAnalytics, rows, totalCount]);

  const paginationInfo = useMemo(() => ({
    totalPages: Math.max(1, serverTotalPages),
    pageStart: (page - 1) * rowsPerPage + 1,
    pageEnd: Math.min(page * rowsPerPage, totalCount)
  }), [serverTotalPages, page, rowsPerPage, totalCount]);

  const toggleSort = useCallback((col) => {
    if (sortBy === col) {
      setSortDir(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }, [sortBy]);

  const handleView = useCallback((id) => {
    router.push(`/players/${encodeURIComponent(id)}`);
  }, [router]);

  const handleEdit = useCallback((id) => {
    router.push(`/players/update/${encodeURIComponent(id)}`);
  }, [router]);

  const handleDelete = useCallback(async (id) => {
    const ask = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن يمكنك التراجع بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
    });

    if (!ask.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(ENDPOINTS.delete(id), {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        const msg = await extractBackendError(res);
        throw new Error(msg);
      }

      await Toast.fire({ icon: 'success', title: 'تم حذف المدرب بنجاح' });
      await fetchCoaches();
    } catch (err) {
      console.error('Delete error:', err);
      await Toast.fire({ icon: 'error', title: err.message || 'خطأ في حذف المدرب' });
    } finally {
      setDeletingId(null);
    }
  }, [authHeaders, fetchCoaches]);

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
      'مؤكَّد',
      'نشط',
      'تاريخ الانضمام',
    ];
    const rowsCsv = sorted.map((c) => [
      c._id,
      c.name,
      c.email,
      c.gender,
      c.nationality,
      c.game,
      c.age,
      c.statusLabel,
      c.isPromoted ? 'نعم' : 'لا',
      c.isConfirmed ? 'نعم' : 'لا',
      c.isActive ? 'نعم' : 'لا',
      c.joinDate,
    ]);
    const csvContent = [headers, ...rowsCsv].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `coaches_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جارٍ تحميل المدربين...</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">إدارة المدربين</h1>
            <p className="text-blue-100">إدارة وعرض جميع المدربين المسجلين في النظام</p>
            </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-blue-200">إجمالي المدربين</p>
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
                <p className="text-sm text-gray-600">إجمالي المدربين</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-gray-600">المروجون</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.promoted}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-gray-600">المؤكدون</p>
              <p className="text-2xl font-bold text-emerald-600">{analytics.confirmed}</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                  type="text"
                  placeholder="ابحث بالاسم ..."
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
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                  disabled={loading || refreshing}
                >
                  {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

              {(loading || refreshing) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{refreshing ? 'جاري التحديث...' : 'جاري التحميل...'}</span>
                </div>
              )}

                <button
                  onClick={exportCSV}
                disabled={loading || !sorted.length}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تصدير البيانات"
                >
                  <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              <button
                onClick={() => fetchCoaches(true)}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px]" dir="rtl">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2">
                      <span>المدرب</span>
                      <SortIcon column="name" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-2">
                      <span>البريد الإلكتروني</span>
                      <SortIcon column="email" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('gender')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>الجنس</span>
                      <SortIcon column="gender" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('nationality')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>الجنسية</span>
                      <SortIcon column="nationality" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('game')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>اللعبة</span>
                      <SortIcon column="game" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('age')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>السن</span>
                      <SortIcon column="age" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('status')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>الحالة</span>
                      <SortIcon column="status" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isPromoted')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>مروّج</span>
                      <SortIcon column="isPromoted" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isConfirmed')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>مؤكَّد</span>
                      <SortIcon column="isConfirmed" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isActive')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>نشط</span>
                      <SortIcon column="isActive" sortBy={sortBy} sortDir={sortDir} />
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
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">جارٍ تحميل المدربين</h3>
                          <p className="text-sm text-gray-500">يرجى الانتظار...</p>
                          </div>
                        </div>
                      </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <XCircle className="w-12 h-12 text-red-500" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">خطأ في تحميل البيانات</h3>
                          <p className="text-sm text-gray-500 mb-3">{error}</p>
                          <button
                            onClick={() => fetchCoaches()}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            إعادة المحاولة
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">لا يوجد مدربون</h3>
                          <p className="text-sm text-gray-500">
                            {query ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يتم العثور على أي مدربين'}
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
                  sorted.map((coach) => (
                    <CoachRow
                      key={coach._id}
                      coach={coach}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                      statusClass={statusClass}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination improved */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                عرض <span className="font-medium">{paginationInfo.pageStart}</span> إلى{' '}
                <span className="font-medium">{paginationInfo.pageEnd}</span> من{' '}
                <span className="font-medium">{totalCount}</span> مدرب
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  {page} من {paginationInfo.totalPages}
                </span>

                <button
                  onClick={() => setPage(Math.min(paginationInfo.totalPages, page + 1))}
                  disabled={page >= paginationInfo.totalPages}
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
    </div>
  );
}