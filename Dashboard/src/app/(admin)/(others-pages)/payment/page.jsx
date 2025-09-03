// app/payments/invoices/page.jsx
'use client';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft, ChevronRight,
  Copy,
  ExternalLink, Loader2,
  Mail,
  RefreshCw,
  Users,
  XCircle
} from 'lucide-react';
import React from 'react';
import Swal from 'sweetalert2';

const API_ROOT  = (process.env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '');
const PAY_BASE  = `${API_ROOT}/payments/admin`;
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

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('ar-EG') : '—';
const money = (amt, cur='SAR') => (amt || amt === 0) ? `${Number(amt).toLocaleString('ar-EG')} ${cur}` : '—';

const targetBadgeCls = (t) => ({
  player: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  coach:  'bg-blue-50 text-blue-700 border-blue-200',
  user:   'bg-purple-50 text-purple-700 border-purple-200',
}[String(t || '').toLowerCase()] || 'bg-purple-50 text-purple-700 border-purple-200');

const productBadgeCls = (p) => ({
  listing:         'bg-indigo-50 text-indigo-700 border-indigo-200',
  promotion:       'bg-yellow-50 text-yellow-700 border-yellow-200',
  contact_access:  'bg-rose-50 text-rose-700 border-rose-200',
  contacts_access: 'bg-rose-50 text-rose-700 border-rose-200',
}[String(p || '').toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200');

const statusBadge = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'paid')   return { label: 'مدفوع',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap w-fit', icon: <CheckCircle className="w-4 h-4" /> };
  if (v === 'pending' || v === 'unpaid' || v === 'notpaid') return { label: 'غير مدفوع', cls: 'bg-red-50 text-red-700 border-red-200 whitespace-nowrap w-fit', icon: <XCircle className="w-4 h-4" /> };
  return { label: v || 'غير معروف', cls: 'bg-gray-50 text-gray-700 border-gray-200 whitespace-nowrap w-fit', icon: null };
};

export default function InvoicesPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [statusServer, setStatusServer] = React.useState('all');
  const [productServer, setProductServer] = React.useState('all');
  const [userIdServer, setUserIdServer] = React.useState('');
  const [orderServer, setOrderServer] = React.useState('');

  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState('desc');

  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const [userMap, setUserMap] = React.useState({});
  const [loadingUsers, setLoadingUsers] = React.useState(new Set());

  const inFlightUsersRef = React.useRef(new Set());

  const authHeaders = React.useCallback(() => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
    }
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const productToServer = (p) => (p === 'contacts_access' ? 'contact_access' : p);

  const buildServerQuery = React.useCallback(() => {
    const q = { page, pageSize };
    if (statusServer !== 'all') q.status = statusServer === 'notpaid' ? 'pending' : 'paid';
    if (productServer !== 'all') q.product = productToServer(productServer);
    if (userIdServer.trim()) q.userId = userIdServer.trim();
    if (orderServer.trim()) q.orderNumber = orderServer.trim();
    return q;
  }, [page, pageSize, statusServer, productServer, userIdServer, orderServer]);

  const refreshData = React.useCallback(async () => {
    setRefreshing(true);
    const q = buildServerQuery();
    
    try {
      const url = ENDPOINTS.list(q);
      const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        return;
      }
      const json = await res.json();
      const items = json?.data?.items ?? [];

      const mapped = items.map((it) => {
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

      setRows(mapped);
      setTotal(Number(json?.data?.total ?? mapped.length));
      setError('');
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر تحديث البيانات' });
    } finally {
      setRefreshing(false);
    }
  }, [buildServerQuery, authHeaders]);

  React.useEffect(() => {
    const q = buildServerQuery();
    const ac = new AbortController();
    let canceled = false;

    (async () => {
      setLoading(true);
      setError('');
      
      try {
        const url = ENDPOINTS.list(q);
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store', signal: ac.signal });
        if (!res.ok) {
          const msg = await extractBackendError(res);
          await Toast.fire({ icon: 'error', html: msg });
          if (!canceled) {
            setRows([]);
            setTotal(0);
            setError('فشل في جلب الفواتير. تأكد من الاتصال بالإنترنت والصلاحيات.');
          }
          return;
        }
        const json = await res.json();
        const items = json?.data?.items ?? [];

        const mapped = items.map((it) => {
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

        if (!canceled) {
          setRows(mapped);
          setTotal(Number(json?.data?.total ?? mapped.length));
          setError('');
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          await Toast.fire({ icon: 'error', title: 'تعذر جلب الفواتير' });
          if (!canceled) {
            setRows([]);
            setTotal(0);
            setError('حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.');
          }
        }
      } finally {
        if (!canceled) setLoading(false);
        else setLoading(false);
      }
    })();

    return () => { canceled = true; ac.abort(); };
  }, [buildServerQuery, authHeaders]);

  React.useEffect(() => {
    const idsAll = [...new Set(rows.map(x => x.userId).filter(Boolean))];
    const ids = idsAll.filter(id =>
      !Object.prototype.hasOwnProperty.call(userMap, id) &&
      !inFlightUsersRef.current.has(id)
    );
    if (!ids.length) return;

    ids.forEach(id => {
      inFlightUsersRef.current.add(id);
      setLoadingUsers(prev => new Set([...prev, id]));
    });

    (async () => {
      try {
        const results = await Promise.allSettled(
          ids.map(id => fetch(ENDPOINTS.user(id), { headers: authHeaders(), cache: 'no-store' }))
        );
        const entries = await Promise.all(results.map(async (r, i) => {
          const id = ids[i];
          if (r.status !== 'fulfilled' || !r.value.ok) return [id, null];
          const data = await r.value.json().catch(() => null);
          const u = data?.data?.user ?? data?.data ?? null;
          if (!u) return [id, null];
          return [id, { name: u.name || '-', email: u.email || '-', phone: u.phone || null }];
        }));

        setUserMap(prev => {
          let changed = false;
          const next = { ...prev };
          for (const [id, val] of entries) {
            if (!Object.prototype.hasOwnProperty.call(next, id)) {
              next[id] = val;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        ids.forEach(id => {
          inFlightUsersRef.current.delete(id);
          setLoadingUsers(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
      }
    })();
  }, [rows, authHeaders, userMap]);

  // header click filter/sort
  const cycle = (val, arr) => arr[(arr.indexOf(val) + 1) % arr.length];
  const onHeaderClick = (col) => {
    if (col === 'product') {
      setProductServer(v => cycle(v, ['all', 'listing', 'promotion', 'contacts_access']));
      setPage(1);
      return;
    }
    if (col === 'status') {
      setStatusServer(v => cycle(v, ['all', 'paid', 'notpaid']));
      setPage(1);
      return;
    }
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  // client sort
  const sorted = React.useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let A, B;
      switch (sortBy) {
        case 'amount':    A = Number(a.amount ?? 0); B = Number(b.amount ?? 0); break;
        case 'orderNumber':
        case 'product':
        case 'targetType':
        case 'status':
          A = String(a[sortBy] || ''); B = String(b[sortBy] || ''); break;
        case 'providerInvoiceId':
          A = String(a.providerInvoiceId || '');
          B = String(b.providerInvoiceId || '');
          break;
        case 'createdAt': A = new Date(a.createdAt || 0).getTime(); B = new Date(b.createdAt || 0).getTime(); break;
        case 'paidAt':    A = new Date(a.paidAt || 0).getTime();    B = new Date(b.paidAt || 0).getTime(); break;
        case 'expireAt':  A = new Date(a.expireAt || 0).getTime();  B = new Date(b.expireAt || 0).getTime(); break;
        case 'remainingDays': A = Number(a.remainingDays ?? -99999); B = Number(b.remainingDays ?? -99999); break;
        default:          A = String(a[sortBy] || ''); B = String(b[sortBy] || '');
      }
      if (typeof A === 'string' && typeof B === 'string') {
        const cmp = A.localeCompare(B, 'ar');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = A > B ? 1 : (A < B ? -1 : 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-70" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const remainingBadge = (days) => {
    if (days === null || typeof days === 'undefined') return <span className="text-sm text-gray-500">—</span>;
    if (days <= 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200 whitespace-nowrap w-fit">منتهي</span>;
    if (days <= 7) return <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap w-fit">{days} يوم</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap w-fit">{days} يوم</span>;
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      Toast.fire({ icon: 'success', title: `تم نسخ ${label}` });
    } catch (err) {
      console.error('Failed to copy:', err);
      Toast.fire({ icon: 'error', title: 'فشل في النسخ' });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: lineClampStyles }} />
      <div className="min-h-screen p-4 sm:p-6 bg-gray-50" dir="rtl">
        <div className="mx-auto max-w-full">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الفواتير</h1>
                <p className="text-gray-600 mt-1">إدارة ومراقبة جميع الفواتير والمدفوعات في النظام</p>
              </div>
              <div className="flex items-center gap-3">
                {(loading || refreshing) && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{refreshing ? 'جاري التحديث...' : 'جاري التحميل...'}</span>
                  </div>
                )}
                <button
                  onClick={refreshData}
                  disabled={loading || refreshing}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المدفوعة</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {rows.filter(r => String(r.status || '').toLowerCase() === 'paid').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">غير مدفوعة</p>
                    <p className="text-2xl font-bold text-red-600">
                      {rows.filter(r => {
                        const s = String(r.status || '').toLowerCase();
                        return s === 'pending' || s === 'unpaid' || s === 'notpaid';
                      }).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">آخر تحديث</p>
                    <p className="text-lg font-bold text-indigo-600">{new Date().toLocaleTimeString('ar-EG')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100">
                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Search line */}
              <div className="flex items-center gap-4">{/* reserved */}</div>

              <div className="flex items-center justify-start lg:justify-end gap-3 flex-wrap">
                <select
                  value={statusServer}
                  onChange={(e) => { setStatusServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="فلترة حسب حالة الدفع"
                  disabled={loading}
                  aria-label="فلترة حسب حالة الدفع"
                >
                  <option value="all">الحالة: الكل</option>
                  <option value="paid">مدفوع</option>
                  <option value="notpaid">غير مدفوع</option>
                </select>

                <select
                  value={productServer}
                  onChange={(e) => { setProductServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="فلترة حسب نوع المنتج"
                  disabled={loading}
                  aria-label="فلترة حسب نوع المنتج"
                >
                  <option value="all">المنتج: الكل</option>
                  <option value="listing">إعلان</option>
                  <option value="promotion">ترويج</option>
                  <option value="contacts_access">الوصول للجهات</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="عدد العناصر في كل صفحة"
                  >
                    {[5,10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <Th label="المستخدم" />
                  <Th label="الفئة" onClick={() => onHeaderClick('targetType')} sort={<SortIcon column="targetType" />} />
                  <Th label="المنتج" onClick={() => onHeaderClick('product')} sort={<SortIcon column="product" />} />
                  <Th label="الحالة" onClick={() => onHeaderClick('status')} sort={<SortIcon column="status" />} />
                  <Th label="المبلغ" onClick={() => onHeaderClick('amount')} sort={<SortIcon column="amount" />} />
                  <Th label="رقم فاتورة المزود" onClick={() => onHeaderClick('providerInvoiceId')} sort={<SortIcon column="providerInvoiceId" />} />
                  <Th label="تاريخ السداد" onClick={() => onHeaderClick('paidAt')} sort={<SortIcon column="paidAt" />} />
                  <Th label="أيام المدة" onClick={() => onHeaderClick('durationDays')} sort={<SortIcon column="durationDays" />} />
                  <Th label="المتبقي (يوم)" onClick={() => onHeaderClick('remainingDays')} sort={<SortIcon column="remainingDays" />} />
                  <Th label="تاريخ الانتهاء" onClick={() => onHeaderClick('expireAt')} sort={<SortIcon column="expireAt" />} />
                  <Th label="روابط" />
                  <Th label="تاريخ الإنشاء" onClick={() => onHeaderClick('createdAt')} sort={<SortIcon column="createdAt" />} />
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
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-300" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">لا توجد فواتير</h3>
                          <p className="text-sm text-gray-500">
                            {statusServer !== 'all' || productServer !== 'all' 
                              ? 'لا توجد نتائج مطابقة للفلاتر المحددة' 
                              : 'لم يتم العثور على أي فواتير في النظام'
                            }
                          </p>
                        </div>
                        {(statusServer !== 'all' || productServer !== 'all') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setStatusServer('all');
                                setProductServer('all');
                                setPage(1);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                              مسح الفلاتر
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, index) => {
                    const st = statusBadge(r.status);
                    const u = userMap[r.userId] || null;
                    return (
                      <tr key={r._id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4">
                          {loadingUsers.has(r.userId) ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <div className="text-sm text-gray-500">جارٍ التحميل...</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 flex flex-col max-w-48">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold line-clamp-1" title={u?.name || 'غير متوفر'}>
                                  {u?.name || 'غير متوفر'}
                                </span>
                                {u && (
                                  <button
                                    onClick={() => copyToClipboard(u.name, 'اسم المستخدم')}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="نسخ الاسم"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 inline-flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="line-clamp-1" title={u?.email || 'غير متوفر'}>
                                  {u?.email || 'غير متوفر'}
                                </span>
                                {u?.email && (
                                  <button
                                    onClick={() => copyToClipboard(u.email, 'البريد الإلكتروني')}
                                    className="text-gray-400 hover:text-blue-600 transition-colors ml-1"
                                    title="نسخ البريد الإلكتروني"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                <span>ID:</span>
                                <code className="font-mono line-clamp-1" title={r.userId || 'غير متوفر'}>
                                  {r.userId || 'غير متوفر'}
                                </code>
                                {r.userId && (
                                  <button
                                    onClick={() => copyToClipboard(r.userId, 'معرف المستخدم')}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="نسخ معرف المستخدم"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* الفئة */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${targetBadgeCls(r.targetType)}`}>
                            {r.targetType === 'coach' ? 'مدرب' : r.targetType === 'player' ? 'لاعب' : 'مستخدم'}
                          </span>
                        </td>

                        {/* المنتج */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${productBadgeCls(r.product)}`}>
                            {r.product === 'contact_access' ? 'contacts_access' : r.product || '—'}
                          </span>
                        </td>

                        {/* الحالة */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}>
                            {st.icon}{st.label}
                          </span>
                        </td>

                        {/* المبلغ */}
                        <td className="px-6 py-4">
                          <div className="text-lg  text-gray-900">{r.amountLabel}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 max-w-48">
                            <div className="flex-1">
                              <div className="text-sm text-gray-900 font-mono line-clamp-1" title={r.providerInvoiceId || 'غير متوفر'}>
                                {r.providerInvoiceId || 'غير متوفر'}
                              </div>
                            </div>
                            {r.providerInvoiceId && (
                              <button
                                onClick={() => copyToClipboard(r.providerInvoiceId, 'رقم فاتورة المزود')}
                                className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                                title="نسخ رقم الفاتورة"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* السداد */}
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{r.paidAtLabel}</div></td>

                        {/* المدة بالأيام */}
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{r.durationDays ?? '—'}</div></td>

                        {/* المتبقي */}
                        <td className="px-6 py-4">{remainingBadge(r.remainingDays)}</td>

                        {/* تاريخ الانتهاء */}
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{r.expireAtLabel}</div></td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {r.paymentUrl ? (
                              <a
                                href={r.paymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-emerald-200"
                                title="فتح رابط الدفع في نافذة جديدة"
                                aria-label="رابط الدفع"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>دفع</span>
                              </a>
                            ) : null}
                            {r.receiptUrl ? (
                              <a
                                href={r.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-nowrap transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-200"
                                title="فتح الإيصال في نافذة جديدة"
                                aria-label="إيصال الدفع"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>إيصال</span>
                              </a>
                            ) : null}
                            {!r.paymentUrl && !r.receiptUrl && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* الإنشاء */}
                        <td className="px-6 py-4"><div className="text-sm text-gray-700">{r.createdAtLabel}</div></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (server-side) */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض
                <span className="font-semibold text-gray-900"> {rows.length ? (page - 1) * pageSize + 1 : 0}</span>
                -
                <span className="font-semibold text-gray-900"> {Math.min(page * pageSize, total)}</span>
                من
                <span className="font-semibold text-gray-900"> {total}</span> فاتورة
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
    </>
  );
}

function Th({ label, onClick, sort, className = '' }) {
  return (
    <th
      className={`px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider ${
        onClick ? 'cursor-pointer group hover:bg-gray-100 transition-colors' : ''
      } ${className}`}
      onClick={onClick}
      title={onClick ? 'اضغط للفرز أو التبديل' : label}
      role={onClick ? 'button' : 'columnheader'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `فرز حسب ${label}` : label}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sort}
      </div>
    </th>
  );
}
