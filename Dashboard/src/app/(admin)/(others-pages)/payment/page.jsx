'use client';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  XCircle
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const API_ROOT = (process.env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '');
const PAY_BASE = `${API_ROOT}/payments/admin`;
const ADMIN_BASE = `${API_ROOT}/admin`;

const ENDPOINTS = {
  list: (q = {}) => {
    const qs = new URLSearchParams(
      Object.entries(q).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return `${PAY_BASE}/invoices?${qs}`;
  },
  user: (id) => `${ADMIN_BASE}/users/${id}`,
};

const SortIcon = React.memo(({ column, sortBy, sortDir }) => {
  if (sortBy !== column) {
    return <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />;
  }
  return sortDir === 'asc' ? 
    <ArrowUp className="w-4 h-4 text-blue-600" /> : 
    <ArrowDown className="w-4 h-4 text-blue-600" />;
});

const StatusBadge = React.memo(({ status }) => {
  const statusInfo = useMemo(() => {
    const v = String(status || '').toLowerCase();
    if (v === 'paid') return { 
      label: 'مدفوع', 
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      icon: <CheckCircle className="w-4 h-4" /> 
    };
    if (v === 'pending' || v === 'unpaid' || v === 'notpaid') return { 
      label: 'غير مدفوع', 
      class: 'bg-red-50 text-red-700 border-red-200', 
      icon: <XCircle className="w-4 h-4" /> 
    };
    return { 
      label: v || 'غير معروف', 
      class: 'bg-gray-50 text-gray-700 border-gray-200', 
      icon: null 
    };
  }, [status]);

  return (
    <div className="flex items-center justify-center">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusInfo.class}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    </div>
  );
});

const TargetBadge = React.memo(({ target }) => {
  const targetInfo = useMemo(() => ({
    player: { label: 'لاعب', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    coach: { label: 'مدرب', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    user: { label: 'مستخدم', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  }[String(target || '').toLowerCase()] || { label: target || 'مستخدم', class: 'bg-purple-50 text-purple-700 border-purple-200' }), [target]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${targetInfo.class}`}>
      {targetInfo.label}
    </span>
  );
});

const ProductBadge = React.memo(({ product }) => {
  const productInfo = useMemo(() => ({
    listing: { label: 'إعلان', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    promotion: { label: 'ترويج', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    contact_access: { label: 'الوصول للجهات', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    contacts_access: { label: 'الوصول للجهات', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  }[String(product || '').toLowerCase()] || { label: product || 'غير معروف', class: 'bg-gray-50 text-gray-700 border-gray-200' }), [product]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${productInfo.class}`}>
      {productInfo.label}
    </span>
  );
});

const UserCell = React.memo(({ userId, userMap, loadingUsers, onLoadUser }) => {
  const user = userMap[userId];
  const isLoading = loadingUsers.has(userId);

  useEffect(() => {
    if (!user && !isLoading && userId) {
      onLoadUser(userId);
    }
  }, [userId, user, isLoading, onLoadUser]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">جاري التحميل...</span>
      </div>
    );
  }

  if (!user) {
    return <span className="text-sm text-gray-500">غير متاح</span>;
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900 truncate" title={user.name}>
        {user.name}
      </span>
      <span className="text-xs text-gray-500 truncate" title={user.email}>
        {user.email}
      </span>
    </div>
  );
});

const PaymentRow = React.memo(({ invoice, userMap, loadingUsers, onLoadUser, onCopyInvoice, onSendEmail }) => (
  <tr className="transition-colors duration-150 hover:bg-gray-50">
    <td className="px-4 py-3 text-sm">
      <UserCell 
        userId={invoice.userId} 
        userMap={userMap} 
        loadingUsers={loadingUsers} 
        onLoadUser={onLoadUser} 
      />
    </td>

    <td className="px-4 py-3 text-center">
      <TargetBadge target={invoice.targetType} />
    </td>

    <td className="px-4 py-3 text-center">
      <ProductBadge product={invoice.product} />
    </td>

    <td className="px-4 py-3 text-center">
      <StatusBadge status={invoice.status} />
    </td>

    <td className="px-4 py-3 text-sm font-mono text-center">
      <span className="font-bold text-gray-900">{invoice.amountLabel}</span>
    </td>

    <td className="px-4 py-3 text-sm text-center">
      {invoice.providerInvoiceId ? (
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {invoice.providerInvoiceId}
          </span>
          <button
            onClick={() => onCopyInvoice(invoice.providerInvoiceId)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="نسخ رقم الفاتورة"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>

    <td className="px-4 py-3 text-xs text-gray-600 text-center">
      {invoice.paidAtLabel}
    </td>

    <td className="px-4 py-3 text-sm text-center">
      {invoice.durationDays ? (
        <span className="font-medium">{invoice.durationDays}</span>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>

    <td className="px-4 py-3 text-sm text-center">
      {invoice.remainingDays !== null ? (
        <span className={`font-medium ${
          invoice.remainingDays <= 0 ? 'text-red-600' : 
          invoice.remainingDays <= 7 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {invoice.remainingDays <= 0 ? 'منتهي' : `${invoice.remainingDays} يوم`}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>

    <td className="px-4 py-3 text-xs text-gray-600 text-center">
      {invoice.expireAtLabel}
    </td>

    <td className="px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-1">
        {invoice.paymentUrl && (
          <a
            href={invoice.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="رابط الدفع"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onSendEmail(invoice)}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="إرسال إيميل"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </td>

    <td className="px-4 py-3 text-xs text-gray-600 text-center">
      {invoice.createdAtLabel}
    </td>
  </tr>
));

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' },
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

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

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('ar-EG') : '—';
const money = (amt, cur='SAR') => (amt || amt === 0) ? `${Number(amt).toLocaleString('ar-EG')} ${cur}` : '—';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusServer, setStatusServer] = useState('all');
  const [productServer, setProductServer] = useState('all');
  const [userIdServer, setUserIdServer] = useState('');
  const [orderServer, setOrderServer] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [serverAnalytics, setServerAnalytics] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalRevenue: 0
  });
  const [userMap, setUserMap] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(new Set());

  const inFlightUsersRef = useRef(new Set());
  const abortControllerRef = useRef(null);

  const authHeaders = useCallback(() => {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    return { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}) 
    };
  }, []);

  const productToServer = useCallback((p) => (p === 'contacts_access' ? 'contact_access' : p), []);



  const buildServerQuery = useCallback(() => {
    const q = { page, pageSize };
    if (statusServer !== 'all') q.status = statusServer === 'notpaid' ? 'pending' : 'paid';
    if (productServer !== 'all') q.product = productToServer(productServer);
    if (userIdServer.trim()) q.userId = userIdServer.trim();
    if (orderServer.trim()) q.orderNumber = orderServer.trim();
    return q;
  }, [page, pageSize, statusServer, productServer, userIdServer, orderServer, productToServer]);

  const mapInvoices = useCallback((items) => {
    return items.map((it) => {
        const target = it.targetType || 'user';
        const paidAt = it.paidAt ? new Date(it.paidAt) : null;
        let expireAt = it.expireAt || it.expiresAt || null;
        if (!expireAt && paidAt && it.durationDays) {
          expireAt = new Date(paidAt.getTime() + it.durationDays * 86400000).toISOString();
        }
        let remainingDays = null;
        if (expireAt) {
          remainingDays = Math.ceil((new Date(expireAt).getTime() - Date.now()) / 86400000);
        }
        return {
          ...it,
          targetType: target,
          expireAt,
          remainingDays,
          _id: it.id,
          createdAtLabel: fmtDateTime(it.createdAt),
          paidAtLabel: fmtDateTime(it.paidAt),
          expireAtLabel: fmtDateTime(expireAt),
          amountLabel: money(it.amount, it.currency),
        };
      });
  }, []);

  const fetchAllAnalytics = useCallback(async () => {
    try {
      const allQuery = new URLSearchParams({
        page: '1',
        pageSize: '1' 
      });
      
      const allRes = await fetch(ENDPOINTS.list(allQuery), {
        headers: authHeaders(),
        cache: 'no-store'
      });

      let totalInvoices = 0;
      if (allRes.ok) {
        const allJson = await allRes.json();
        totalInvoices = Number(allJson?.data?.total || 0);
      }

      const paidCountQuery = new URLSearchParams({
        status: 'paid',
        page: '1',
        pageSize: '1' 
      });
      
      const paidCountRes = await fetch(ENDPOINTS.list(paidCountQuery), {
        headers: authHeaders(),
        cache: 'no-store'
      });

      let paidCount = 0;
      if (paidCountRes.ok) {
        const paidCountJson = await paidCountRes.json();
        paidCount = Number(paidCountJson?.data?.total || 0);
      }

      const pageSize = 500; 
      const totalPages = Math.ceil(paidCount / pageSize);
      let allPaidInvoices = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const paidQuery = new URLSearchParams({
          status: 'paid',
          page: String(page),
          pageSize: String(pageSize)
        });
        
        const res = await fetch(ENDPOINTS.list(paidQuery), {
          headers: authHeaders(),
          cache: 'no-store'
        });

        if (res.ok) {
          const json = await res.json();
          const paidItems = json?.data?.items ?? [];
          allPaidInvoices = [...allPaidInvoices, ...paidItems];
        }
      }
      
      const mappedPaid = mapInvoices(allPaidInvoices);
      const totalRevenue = mappedPaid.reduce((sum, invoice) => {
        return sum + (Number(invoice.amount) || 0);
      }, 0);

      setServerAnalytics({
        totalInvoices: totalInvoices,
        paidInvoices: paidCount,
        unpaidInvoices: Math.max(0, totalInvoices - paidCount),
        totalRevenue: totalRevenue
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [authHeaders, mapInvoices]);

  const fetchPayments = useCallback(async (isRefresh = false) => {
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
      const q = buildServerQuery();
        const url = ENDPOINTS.list(q);
      const res = await fetch(url, { 
        headers: authHeaders(), 
        cache: 'no-store', 
        signal 
      });
      
        if (!res.ok) {
          const msg = await extractBackendError(res);
          await Toast.fire({ icon: 'error', html: msg });
            setRows([]);
            setTotal(0);
            setError('فشل في جلب الفواتير. تأكد من الاتصال بالإنترنت والصلاحيات.');
          return;
        }
      
        const json = await res.json();
      
      if (signal.aborted) return;
      
      const items = json?.data?.items ?? [];
      const mapped = mapInvoices(items);

          setRows(mapped);
          setTotal(Number(json?.data?.total ?? mapped.length));
      
      if (json?.data?.analytics) {
        setServerAnalytics({
          totalInvoices: Number(json.data.analytics.totalInvoices || 0),
          paidInvoices: Number(json.data.analytics.paidInvoices || 0),
          unpaidInvoices: Number(json.data.analytics.unpaidInvoices || 0),
          totalRevenue: Number(json.data.analytics.totalRevenue || 0)
        });
      } else {
        const totalCount = Number(json?.data?.total ?? mapped.length);
        setServerAnalytics({
          totalInvoices: totalCount,
          paidInvoices: 0, 
          unpaidInvoices: 0, 
          totalRevenue: 0 
        });
      }
      
      setError('');
      } catch (e) {
      if (e.name === 'AbortError') return;  
      
          // Error occurred
          await Toast.fire({ icon: 'error', title: 'تعذر جلب الفواتير' });
            setRows([]);
            setTotal(0);
            setError('حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.');
      } finally {
      if (!signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [buildServerQuery, authHeaders, mapInvoices]);

  const loadUser = useCallback(async (userId) => {
    if (inFlightUsersRef.current.has(userId)) return;
    
    inFlightUsersRef.current.add(userId);
    setLoadingUsers(prev => new Set([...prev, userId]));

    try {
      const res = await fetch(ENDPOINTS.user(userId), { headers: authHeaders(), cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
          const u = data?.data?.user ?? data?.data ?? null;
        if (u) {
          setUserMap(prev => ({
            ...prev,
            [userId]: { 
              name: u.name || '-', 
              email: u.email || '-', 
              phone: u.phone || null 
            }
          }));
        }
      }
    } catch (e) {
      // Error loading user
      } finally {
      inFlightUsersRef.current.delete(userId);
          setLoadingUsers(prev => {
            const next = new Set(prev);
        next.delete(userId);
            return next;
      });
    }
  }, [authHeaders]);

 
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

 
  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);


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
  }, [rows, sortBy, sortDir]);

 
  const analytics = useMemo(() => {

    if (serverAnalytics.totalInvoices === 0 && rows.length > 0) {
      const paid = rows.filter(r => String(r.status || '').toLowerCase() === 'paid');
      const unpaid = rows.filter(r => String(r.status || '').toLowerCase() !== 'paid');
      const totalRevenue = paid.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      
      return {
        total: total || rows.length, 
        paid: paid.length,
        unpaid: unpaid.length,
        revenue: totalRevenue
      };
    }
    

    return {
      total: serverAnalytics.totalInvoices || total || 0,
      paid: serverAnalytics.paidInvoices || 0,
      unpaid: serverAnalytics.unpaidInvoices || 0,
      revenue: serverAnalytics.totalRevenue || 0
    };
  }, [serverAnalytics, rows, total]);

 
  const paginationInfo = useMemo(() => ({
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    pageStart: (page - 1) * pageSize + 1,
    pageEnd: Math.min(page * pageSize, total)
  }), [total, page, pageSize]);


  const toggleSort = useCallback((col) => {
    if (sortBy === col) {
      setSortDir(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }, [sortBy]);

  const copyInvoiceId = useCallback(async (invoiceId) => {
    try {
      await navigator.clipboard.writeText(invoiceId);
      await Toast.fire({ icon: 'success', title: 'تم نسخ رقم الفاتورة' });
    } catch (e) {
      // Failed to copy
      await Toast.fire({ icon: 'error', title: 'فشل في نسخ رقم الفاتورة' });
    }
  }, []);

  const sendEmail = useCallback(async (invoice) => {
    await Toast.fire({ icon: 'info', title: 'جاري إرسال الإيميل...' });
   
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
            <h1 className="text-2xl font-bold mb-2">إدارة المدفوعات</h1>
            <p className="text-gray-300">إدارة وعرض جميع الفواتير والمدفوعات في النظام</p>
              </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold">{total}</p>
              <p className="text-gray-300">إجمالي الفواتير</p>
                  </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{analytics.revenue}</p>
              <p className="text-gray-300">إجمالي الإيرادات</p>
              </div>
            </div>
              </div>
          </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
              <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المدفوعة</p>
              <p className="text-2xl font-bold text-emerald-600">{analytics.paid}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
              <p className="text-sm text-gray-600">غير المدفوعة</p>
              <p className="text-2xl font-bold text-red-600">{analytics.unpaid}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              <p className="text-xl font-bold text-green-600">{money(analytics.revenue)}</p>
                  </div>
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

        {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={statusServer}
                  onChange={(e) => { setStatusServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                  disabled={loading}
                >
                  <option value="all">الحالة: الكل</option>
                  <option value="paid">مدفوع</option>
                  <option value="notpaid">غير مدفوع</option>
                </select>

                <select
                  value={productServer}
                  onChange={(e) => { setProductServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-0"
                  disabled={loading}
                >
                  <option value="all">المنتج: الكل</option>
                  <option value="listing">إعلان</option>
                  <option value="promotion">ترويج</option>
                  <option value="contacts_access">الوصول للجهات</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    disabled={loading}
                  >
                    {[5,10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

              {(loading || refreshing) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{refreshing ? 'جاري التحديث...' : 'جاري التحميل...'}</span>
              </div>
              )}

              <button
                onClick={() => fetchPayments(true)}
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
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
          </div>

          {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1200px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  المستخدم
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('targetType')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>الفئة</span>
                    <SortIcon column="targetType" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('product')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>المنتج</span>
                    <SortIcon column="product" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>الحالة</span>
                    <SortIcon column="status" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>المبلغ</span>
                    <SortIcon column="amount" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('paidAt')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>تاريخ السداد</span>
                    <SortIcon column="paidAt" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  المدة (يوم)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  المتبقي
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('expireAt')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>تاريخ الانتهاء</span>
                    <SortIcon column="expireAt" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  الإجراءات
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>تاريخ الإنشاء</span>
                    <SortIcon column="createdAt" sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">جارٍ تحميل الفواتير</h3>
                          <p className="text-sm text-gray-500">يرجى الانتظار...</p>
                        </div>
                      </div>
                    </td>
                  </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <XCircle className="w-12 h-12 text-red-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">خطأ في تحميل البيانات</h3>
                        <p className="text-sm text-gray-500 mb-3">{error}</p>
                        <button
                          onClick={() => fetchPayments()}
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
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                      <CreditCard className="w-12 h-12 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">لا توجد فواتير</h3>
                          <p className="text-sm text-gray-500">
                            {statusServer !== 'all' || productServer !== 'all' 
                              ? 'لا توجد نتائج مطابقة للفلاتر المحددة' 
                              : 'لم يتم العثور على أي فواتير في النظام'
                            }
                          </p>
                        {(statusServer !== 'all' || productServer !== 'all') && (
                            <button
                              onClick={() => {
                                setStatusServer('all');
                                setProductServer('all');
                                setPage(1);
                              }}
                            className="text-sm text-blue-600 hover:text-blue-700 underline mt-2"
                            >
                              مسح الفلاتر
                            </button>
                        )}
                      </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                sorted.map((invoice) => (
                  <PaymentRow
                    key={invoice._id}
                    invoice={invoice}
                    userMap={userMap}
                    loadingUsers={loadingUsers}
                    onLoadUser={loadUser}
                    onCopyInvoice={copyInvoiceId}
                    onSendEmail={sendEmail}
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
              <span className="font-medium">{total}</span> فاتورة
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
  );
}