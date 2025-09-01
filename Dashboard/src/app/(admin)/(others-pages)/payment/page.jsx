// app/payments/invoices/page.jsx
'use client';

import React from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Mail, CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
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
  // server pagination + filters
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [statusServer, setStatusServer] = React.useState('all'); // all | paid | notpaid
  const [productServer, setProductServer] = React.useState('all'); // all | listing | promotion | contacts_access
  const [userIdServer, setUserIdServer]   = React.useState('');
  const [orderServer, setOrderServer]     = React.useState('');

  // client sort
  const [sortBy, setSortBy]   = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState('desc');

  // data
  const [rows, setRows]   = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // user cache { userId: {name, email, phone} | null }
  const [userMap, setUserMap] = React.useState({});

  // dedupe in-flight user requests
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

  // Effect A: fetch invoices (controls "loading")
  React.useEffect(() => {
    const q = buildServerQuery();
    const ac = new AbortController();
    let canceled = false;

    (async () => {
      setLoading(true);
      try {
        const url = ENDPOINTS.list(q);
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store', signal: ac.signal });
        if (!res.ok) {
          const msg = await extractBackendError(res);
          await Toast.fire({ icon: 'error', html: msg });
          setRows([]); setTotal(0);
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
            paidAtLabel:    fmtDateTime(it.paidAt),
            expireAtLabel:  fmtDateTime(expireAt),
            amountLabel:    money(it.amount, it.currency),
          };
        });

        if (!canceled) {
          setRows(mapped);
          setTotal(Number(json?.data?.total ?? mapped.length));
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          await Toast.fire({ icon: 'error', title: 'تعذر جلب الفواتير' });
          if (!canceled) { setRows([]); setTotal(0); }
        }
      } finally {
        // Always clear loading, even if the first (aborted) invocation finishes later
        if (!canceled) setLoading(false);
        else setLoading(false);
      }
    })();

    return () => { canceled = true; ac.abort(); };
  }, [buildServerQuery, authHeaders]);

  // Effect B: fetch users for current rows (never touches "loading")
  React.useEffect(() => {
    const idsAll = [...new Set(rows.map(x => x.userId).filter(Boolean))];
    const ids = idsAll.filter(id =>
      !Object.prototype.hasOwnProperty.call(userMap, id) &&
      !inFlightUsersRef.current.has(id)
    );
    if (!ids.length) return;

    ids.forEach(id => inFlightUsersRef.current.add(id));

    (async () => {
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
            next[id] = val; // cache even if null
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      ids.forEach(id => inFlightUsersRef.current.delete(id));
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

  return (
    <div className="min-h-screen p-4 sm:p-6" dir="rtl">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">كل الفواتير</h1>
          <p className="text-gray-600">فلترة بالمنتج/الحالة عبر رأس الجدول + ترقيم صفحات من الخادم.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Search line */}
              <div className="flex items-center gap-4">{/* reserved */}</div>

              {/* Right: server filters + page size */}
              <div className="flex items-center justify-start lg:justify-end gap-3">
                <select
                  value={statusServer}
                  onChange={(e) => { setStatusServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  title="الحالة (من الخادم)"
                >
                  <option value="all">الحالة: الكل</option>
                  <option value="paid">مدفوع</option>
                  <option value="notpaid">غير مدفوع</option>
                </select>

                <select
                  value={productServer}
                  onChange={(e) => { setProductServer(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  title="المنتج (من الخادم)"
                >
                  <option value="all">المنتج: الكل</option>
                  <option value="listing">listing</option>
                  <option value="promotion">promotion</option>
                  <option value="contacts_access">contacts_access</option>
                </select>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
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
                  <tr><td colSpan={12} className="px-6 py-10 text-center text-gray-500">جارٍ التحميل…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={12} className="px-6 py-10 text-center text-gray-500">لا توجد نتائج</td></tr>
                ) : (
                  sorted.map((r, index) => {
                    const st = statusBadge(r.status);
                    const u = userMap[r.userId] || null;
                    return (
                      <tr key={r._id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        {/* المستخدم */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex flex-col">
                            <span className="font-semibold">{u?.name || '—'}</span>
                            <span className="text-xs text-gray-600 inline-flex items-center gap-1">
                              <Mail className="w-4 h-4" /> {u?.email || '—'}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">ID: <code className="font-mono">{r.userId || '—'}</code></span>
                          </div>
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

                        {/* رقم فاتورة المزود */}
                        <td className="px-6 py-4 w-1/2">
                          <div className="w-full truncate">
                            <span className="text-sm text-gray-900 font-mono">{r.providerInvoiceId || '—'}</span>
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

                        {/* روابط */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {r.paymentUrl ? (
                              <a
                                href={r.paymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
                                title="رابط الدفع"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> دفع
                              </a>
                            ) : null}
                            {r.receiptUrl ? (
                              <a
                                href={r.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-nowrap"
                                title="إيصال"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> إيصال
                              </a>
                            ) : null}
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
  );
}

function Th({ label, onClick, sort, className = '' }) {
  return (
    <th
      className={`px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors ${className}`}
      onClick={onClick}
      title="اضغط للفرز/التبديل"
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sort}
      </div>
    </th>
  );
}
