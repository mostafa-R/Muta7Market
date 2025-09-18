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
  Loader2,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';

function apiBase() {
  const root = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
  return `${root}/admin`;
}

const BASE = apiBase();

const ENDPOINTS = {
  list: (params) => `${BASE}/players?${params.toString()}`,
  delete: (id) => `${BASE}/players/${id}`,
};

// Optimized Components for better performance
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
            alt={name || 'صورة اللاعب'} 
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
  const statusClass = useMemo(() => ({
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    contracted: 'bg-purple-100 text-purple-700 border-purple-200',
    transferred: 'bg-amber-100 text-amber-700 border-amber-200',
    recently_transferred: 'bg-blue-100 text-blue-700 border-blue-200',
  }[status] || 'bg-gray-100 text-gray-700 border-gray-200'), [status]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
      {label}
    </span>
  );
});

const BooleanBadge = React.memo(({ value, trueText = 'نعم', falseText = 'لا' }) => (
  <div className="flex justify-center">
    {value ? (
      <CheckCircle className="w-5 h-5 text-green-600" title={trueText} />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" title={falseText} />
    )}
  </div>
));

const TableActions = React.memo(({ player, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => onEdit(player._id)}
      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
      title="تعديل اللاعب"
    >
      <Edit3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onDelete(player._id)}
      disabled={deletingId === player._id}
      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
      title="حذف اللاعب"
    >
      {deletingId === player._id ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  </div>
));

const GenderBadge = React.memo(({ gender }) => {
  const genderInfo = useMemo(() => {
    switch (gender?.toLowerCase()) {
      case 'male': return { text: 'ذكر', class: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'female': return { text: 'أنثى', class: 'bg-pink-50 text-pink-700 border-pink-200' };
      default: return { text: '-', class: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  }, [gender]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${genderInfo.class}`}>
      {genderInfo.text}
    </span>
  );
});

const PlayerRow = React.memo(({ player, onEdit, onDelete, deletingId, statusClass }) => (
  <tr className="transition-colors duration-150 hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <Avatar name={player.name} src={player.image} promoted={player.isPromoted} />
        <div className="min-w-20 flex-1">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
            <span className="line-clamp-1 min-w-28" title={player.name}>
              {player.name}
            </span>
            {player.isPromoted && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" title="مروّج" />}
          </div>
          <div className="text-xs text-gray-500 mt-1">انضم في {player.joinDate}</div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4">
      <div className="text-sm text-gray-900 font-mono truncate">
        <span className="truncate" title={player.email}>
          {player.email}
        </span>
      </div>
    </td>

    <td className="px-6 py-4">
      <GenderBadge gender={player.gender} />
    </td>

    <td className="px-6 py-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" title={player.nationality}>
        <span className="truncate">{player.nationality}</span>
      </span>
    </td>

    <td className="px-6 py-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 max-w-28" title={player.game}>
        <span className="truncate max-w-28">{player.game}</span>
      </span>
    </td>

    <td className="px-6 py-4">
      <div className="text-sm text-gray-600 font-medium">{player.age}</div>
    </td>

    <td className="px-6 py-4">
      <StatusBadge status={player.status} label={player.statusLabel} />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={player.isPromoted} trueText="مروّج" falseText="عادي" />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={player.isConfirmed} />
    </td>

    <td className="px-6 py-4 text-center">
      <BooleanBadge value={player.isActive} trueText="نشط" falseText="غير نشط" />
    </td>

    <td className="px-6 py-4 text-center">
      <TableActions 
        player={player} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        deletingId={deletingId} 
      />
    </td>
  </tr>
));

// Helper functions to extract Arabic names from sports object format
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

function RECENT_PROMO_VALID(promoData) {
  if (!promoData) return false;
  if (typeof promoData === 'boolean') return promoData;
  if (typeof promoData === 'object' && promoData.isPromoted) {
    const promoDate = promoData.promotedAt ? new Date(promoData.promotedAt) : null;
    if (!promoDate) return !!promoData.isPromoted;
    const now = new Date();
    const diffTime = now.getTime() - promoDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && !!promoData.isPromoted;
  }
  return false;
}

function deriveStatus(p) {
  const raw = p.status;
  if (p.transferHistory && Array.isArray(p.transferHistory) && p.transferHistory.length > 0) {
    const lastTransfer = p.transferHistory[p.transferHistory.length - 1];
    if (lastTransfer && lastTransfer.transferDate) {
      const transferDate = new Date(lastTransfer.transferDate);
      const now = new Date();
      const days = Math.ceil((now.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      return days <= 30 ? 'recently_transferred' : 'transferred';
    }
  }
  
  if (p.lastTransferDate) {
    const transferDate = new Date(p.lastTransferDate);
    const now = new Date();
    const days = Math.ceil((now.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
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

export default function PlayersDashboardTable() {
  const router = useRouter();

  // State management with proper hooks
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter state
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterMode, setFilterMode] = useState('all');
  const [confirmFilter, setConfirmFilter] = useState('all');

  // Refs for optimization
  const fetchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Optimized callbacks
  const authHeaders = useCallback(() => {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    return { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}) 
    };
  }, []);

  const mapPlayers = useCallback((players = []) => {
    return players.map((p) => {
      const promoted = RECENT_PROMO_VALID(p?.isPromoted);
      const st = deriveStatus(p);
      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      
      return {
        _id: p._id,
        name: p.name || p.user?.name || '-',
        email: p.user?.email || p.contactInfo?.email || '-',
        gender: (p.gender || '').toLowerCase(),
        nationality: p.nationality || '-',
        game: getSportsDisplayValue(p.game),
        age: Number(p.age ?? 0),
        image: p.media?.profileImage?.url || '',
        status: st,
        statusLabel: statusLabel(st),
        joinDate: createdAt ? createdAt.toLocaleDateString('ar-EG') : '-',
        createdAt: createdAt ? createdAt.getTime() : 0,
        isActive: !!p.isActive,
        isPromoted: promoted,
        isConfirmed: !!p.isConfirmed, 
      };
    });
  }, []);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(rowsPerPage));
    params.set('jop', 'player');
    
    const trimmedQuery = query.trim();
    if (trimmedQuery) params.set('search', trimmedQuery);
    
    // Filter parameters
    if (filterMode === 'active') params.set('isActive', 'true');
    else if (filterMode === 'inactive') params.set('isActive', 'false');
    else if (filterMode === 'promoted') params.set('isPromoted', 'true');
    
    if (confirmFilter === 'confirmed') params.set('isConfirmed', 'true');
    else if (confirmFilter === 'unconfirmed') params.set('isConfirmed', 'false');
    
    return params;
  }, [page, rowsPerPage, query, filterMode, confirmFilter]);

  const fetchPlayers = useCallback(async (isRefresh = false) => {
    // Cancel previous request if it exists
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
      const res = await fetch(ENDPOINTS.list(params), { 
        headers: authHeaders(), 
        cache: 'no-store',
        signal 
      });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        setRows([]);
        setTotalCount(0);
        setServerTotalPages(1);
        return;
      }
      const json = await res.json();
      
      // Check if request was cancelled
      if (signal.aborted) return;
      
      const players = json?.data?.players ?? [];
      let mapped = mapPlayers(players);

      if (filterMode === 'promoted') {
        mapped = mapped.filter((r) => r.isPromoted);
      } else if (filterMode === 'active') {
        mapped = mapped.filter((r) => r.isActive);
      } else if (filterMode === 'inactive') {
        mapped = mapped.filter((r) => !r.isActive);
      }

      if (confirmFilter === 'confirmed') {
        mapped = mapped.filter((r) => r.isConfirmed === true);
      } else if (confirmFilter === 'unconfirmed') {
        mapped = mapped.filter((r) => r.isConfirmed === false);
      }

      setRows(mapped);
      const pag = json?.data?.pagination;
      if (pag) {
        const total = Number(pag.totalPlayers ?? pag.total ?? mapped.length);
        setTotalCount(total);
        setServerTotalPages(Number(pag.totalPages ?? 1));
      } else {
        setTotalCount(mapped.length);
        setServerTotalPages(1);
      }
    } catch (e) {
      if (e.name === 'AbortError') return; // Request was cancelled
      
      console.error(e);
      setError('فشل في جلب اللاعبين. تأكد من الاتصال بالإنترنت والصلاحيات.');
      await Toast.fire({ icon: 'error', title: 'تعذر جلب اللاعبين' });
      setRows([]);
      setTotalCount(0);
      setServerTotalPages(1);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setRefreshing(false);
        if (initialLoading) setInitialLoading(false);
      }
    }
  }, [authHeaders, buildQueryParams, mapPlayers, filterMode, confirmFilter, initialLoading, page]);

  // Optimized effect for fetching players
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Debounced search effect
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchPlayers();
      }
    }, 400);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [query, filterMode, confirmFilter, fetchPlayers, page]);

  // Reset page and fetch when filters/sorting change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchPlayers();
    }
  }, [rowsPerPage, sortBy, sortDir, filterMode, confirmFilter, fetchPlayers]);

  // Optimized row ranking function
  const rankRow = useCallback((r) => {
    if (r.isPromoted) return 0;
    if (r.isActive && r.isConfirmed) return 1;
    if (r.isActive && !r.isConfirmed) return 2;
    return 3;
  }, []);

  // Memoized sorted data
  const sorted = useMemo(() => {
    const copy = [...rows];
    if (!sortBy) {
      copy.sort((a, b) => {
        const ra = rankRow(a);
        const rb = rankRow(b);
        if (ra !== rb) return ra - rb;
        return b.createdAt - a.createdAt;
      });
      return copy;
    }
    
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

  // Memoized pagination calculations
  const paginationInfo = useMemo(() => ({
    totalPages: Math.max(1, serverTotalPages),
    pageStart: (page - 1) * rowsPerPage + 1,
    pageEnd: Math.min(page * rowsPerPage, totalCount)
  }), [serverTotalPages, page, rowsPerPage, totalCount]);

  // Optimized sort toggle function
  const toggleSort = useCallback((col) => {
    if (sortBy === col) {
      setSortDir(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }, [sortBy]);

  const handleDelete = useCallback(async (id) => {
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

    setDeletingId(id);
    try {
      const res = await fetch(ENDPOINTS.delete(id), { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        return;
      }
      await Toast.fire({ icon: 'success', title: 'تم حذف اللاعب' });
      await fetchPlayers();
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر حذف اللاعب' });
    } finally {
      setDeletingId(null);
    }
  }, [authHeaders, fetchPlayers]);

  const handleEdit = useCallback((id) => {
    router.push(`/players/update/${encodeURIComponent(id)}`);
  }, [router]);

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
    const csvContent = [headers, ...rowsCsv].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `players_${new Date().toISOString().split('T')[0]}.csv`);
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
          <p className="text-gray-600">جارٍ تحميل اللاعبين...</p>
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
            <h1 className="text-2xl font-bold mb-2">إدارة اللاعبين</h1>
            <p className="text-blue-100">إدارة وعرض جميع اللاعبين المسجلين في النظام</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-blue-200">إجمالي اللاعبين</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
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
                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="البحث في الاسم والبريد الإلكتروني..."
                  className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white dark:bg-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full md:w-64 lg:w-72"
                  disabled={loading}
                  aria-label="البحث في اللاعبين"
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                {/* Filter: promoted/active/inactive */}
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                  <span className="whitespace-nowrap">عرض:</span>
                  <select
                    value={filterMode}
                    onChange={(e) => {
                      setFilterMode(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                    disabled={loading}
                  >
                    <option value="all">الكل</option>
                    <option value="promoted">المروّجون فقط</option>
                    <option value="active">النشطون فقط</option>
                    <option value="inactive">غير النشطين فقط</option>
                  </select>
                </div>

                {/* Filter: isConfirmed */}
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                  <span className="whitespace-nowrap">التأكيد:</span>
                  <select
                    value={confirmFilter}
                    onChange={(e) => {
                      setConfirmFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                    disabled={loading}
                  >
                    <option value="all">الكل</option>
                    <option value="confirmed">مؤكَّد فقط</option>
                    <option value="unconfirmed">غير مؤكد فقط</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>عدد الصفوف:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || sorted.length === 0}
                title="تصدير البيانات إلى ملف CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير CSV</span>
              </button>

              <button 
                onClick={() => fetchPlayers(true)} 
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px]" dir="rtl">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2">
                      <span>اللاعب</span>
                      <SortIcon column="name" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-2">
                      <span>البريد الإلكتروني</span>
                      <SortIcon column="email" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('gender')}>
                    <div className="flex items-center gap-2">
                      <span>الجنس</span>
                      <SortIcon column="gender" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('nationality')}>
                    <div className="flex items-center gap-2">
                      <span>الجنسية</span>
                      <SortIcon column="nationality" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('game')}>
                    <div className="flex items-center gap-2">
                      <span>اللعبة</span>
                      <SortIcon column="game" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('age')}>
                    <div className="flex items-center gap-2">
                      <span>السن</span>
                      <SortIcon column="age" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-2">
                      <span>الحالة</span>
                      <SortIcon column="status" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">مروّج</th>
                  
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => toggleSort('isConfirmed')}>
                    <div className="flex items-center justify-center gap-2">
                      <span>مؤكَّد</span>
                      <SortIcon column="isConfirmed" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </th>
                  
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">نشط</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">جارٍ تحميل اللاعبين</h3>
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
                            onClick={() => fetchPlayers()}
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
                          <h3 className="text-sm font-medium text-gray-900 mb-1">لا توجد بيانات</h3>
                          <p className="text-sm text-gray-500">لم يتم العثور على أي لاعبين</p>
                          {query && (
                            <button
                              onClick={() => setQuery('')}
                              className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                              مسح البحث
                            </button>
                          )}
                          {(filterMode !== 'all' || confirmFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setFilterMode('all');
                                setConfirmFilter('all');
                                setPage(1);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                              مسح الفلاتر
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  ) : (
                    sorted.map((player) => (
                      <PlayerRow
                        key={player._id}
                        player={player}
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
                <span className="font-medium">{totalCount}</span> لاعب
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