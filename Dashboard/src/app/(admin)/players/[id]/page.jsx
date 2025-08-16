'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ArrowRight, Mail, Phone, Globe, User2 } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1/admin';
const endpointOne = (id) => `${BASE}/players/${id}`;

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  customClass: { container: 'my-toast-under-navbar' }, // optional (push below navbar)
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

const RECENT_DAYS = 30;
function deriveStatus(p) {
  const raw = (p.status || '').toLowerCase(); // 'available' | 'transferred' | 'contracted'
  const tDate = p?.transferredTo?.date ? new Date(p.transferredTo.date) : null;
  if (tDate) {
    const days = (Date.now() - tDate.getTime()) / 86400000;
    return days <= RECENT_DAYS ? 'recently_transferred' : 'transferred';
  }
  if (raw) return raw;
  if (p.contractEndDate && new Date(p.contractEndDate) > new Date()) return 'contracted';
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

const Avatar = ({ name, src }) => {
  const initials = (name || '').split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();
  const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-pink-500 to-rose-600'];
  const colorIndex = (name || '').length % colors.length;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="w-20 h-20 rounded-full object-cover shadow-md" />
  ) : (
    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
      {initials || 'PL'}
    </div>
  );
};

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [player, setPlayer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const headers = React.useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const fetchPlayer = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpointOne(id), { headers: headers(), cache: 'no-store' });
      if (!res.ok) {
        const msg = await extractBackendError(res);
        await Toast.fire({ icon: 'error', html: msg });
        return;
      }
      const json = await res.json();
      const p = json?.data?.player ?? json?.data ?? null;
      setPlayer(p);
    } catch (e) {
      console.error(e);
      await Toast.fire({ icon: 'error', title: 'تعذر جلب بيانات اللاعب' });
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  React.useEffect(() => { fetchPlayer(); }, [fetchPlayer]);

  if (loading) {
    return <div className="p-6 text-blue-600">جارٍ التحميل…</div>;
  }
  if (!player) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">لا توجد بيانات لعرضها.</div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>
      </div>
    );
  }

  const st = deriveStatus(player);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={player?.name || player?.user?.name} src={player?.media?.profileImage?.url} />
            <div>
              <div className="text-xl font-bold text-gray-900">{player?.name || player?.user?.name}</div>
              <div className="text-sm text-gray-600">{player?.position || '—'} · {player?.game || '—'}</div>
              <div className="mt-1">
                <GenderBadge gender={player?.gender} />{' '}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass(st)}`}>
                  {statusLabel(st)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/players/update/${player._id}`)}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              تعديل البيانات
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <ArrowRight className="inline w-4 h-4" /> رجوع
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-t border-gray-100">
          <Info label="البريد" value={player?.user?.email || player?.contactInfo?.email || '—'} icon={<Mail className="w-4 h-4" />} />
          <Info label="الهاتف" value={player?.contactInfo?.phone || '—'} icon={<Phone className="w-4 h-4" />} />
          <Info label="الجنسية" value={player?.nationality || '—'} icon={<Globe className="w-4 h-4" />} />
          <Info label="العمر" value={player?.age ?? '—'} icon={<User2 className="w-4 h-4" />} />
          <Info label="الخبرة (سنوات)" value={player?.expreiance ?? '—'} />
          <Info label="نهاية العقد" value={player?.contractEndDate ? new Date(player.contractEndDate).toLocaleDateString() : '—'} />
          <Info label="الراتب الشهري" value={player?.monthlySalary ? `${player.monthlySalary.amount} ${player.monthlySalary.currency}` : '—'} />
          <Info label="الراتب السنوي" value={player?.yearSalary ? `${player.yearSalary.amount} ${player.yearSalary.currency}` : '—'} />
        </div>

        {/* Social / Media */}
        <div className="p-6 border-t border-gray-100">
          <div className="text-sm font-semibold text-gray-800 mb-2">روابط التواصل</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {player?.socialLinks?.instagram && <Chip label={`Instagram: @${player.socialLinks.instagram}`} />}
            {player?.socialLinks?.twitter && <Chip label={`Twitter: @${player.socialLinks.twitter}`} />}
            {player?.socialLinks?.youtube && <Chip label={`YouTube: ${player.socialLinks.youtube}`} />}
            {player?.socialLinks?.whatsapp && <Chip label={`WhatsApp: ${player.socialLinks.whatsapp}`} />}
            {!player?.socialLinks && <span className="text-gray-500">لا يوجد</span>}
          </div>

          <div className="text-sm font-semibold text-gray-800 mt-6 mb-2">وسائط</div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {(player?.media?.videos || []).map(v => (
              <li key={v.publicId}><a className="text-indigo-600 hover:underline" href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a></li>
            ))}
            {(player?.media?.documents || []).map(d => (
              <li key={d.publicId}><a className="text-indigo-600 hover:underline" href={d.url} target="_blank" rel="noreferrer">{d.title || d.url}</a></li>
            ))}
            {(!player?.media?.videos?.length && !player?.media?.documents?.length) && <li className="text-gray-500">لا يوجد</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-xs text-gray-500 flex items-center gap-1">{icon}{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-1 break-words">{value ?? '—'}</div>
    </div>
  );
}

function Chip({ label }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700">
      {label}
    </span>
  );
}
