'use client';

import React from 'react';
import {
  Search,
  Edit3,
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
  Filter,
  MoreVertical
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  email: string;
  gender: string;
  nationality: string;
  game: string;
  age: number;
  image?: string;
  isActive: boolean;
  joinDate: string;
}

export default function PlayersDashboardTable() {
  const [players, setPlayers] = React.useState<Player[]>([
    { id: 1, name: 'محمد علي', email: 'mohamed@example.com', gender: 'ذكر', nationality: 'مصر', game: 'كرة قدم', age: 25, isActive: true, joinDate: '2023-01-15' },
    { id: 2, name: 'سارة أحمد', email: 'sara@example.com', gender: 'أنثى', nationality: 'السعودية', game: 'تنس', age: 22, isActive: true, joinDate: '2023-02-20' },
    { id: 3, name: 'خالد محمد', email: 'khaled@example.com', gender: 'ذكر', nationality: 'الإمارات', game: 'كرة سلة', age: 28, isActive: false, joinDate: '2023-03-10' },
    { id: 4, name: 'نورا سعيد', email: 'nora@example.com', gender: 'أنثى', nationality: 'الكويت', game: 'سباحة', age: 20, isActive: true, joinDate: '2023-04-05' },
    { id: 5, name: 'أحمد محمود', email: 'ahmed@example.com', gender: 'ذكر', nationality: 'قطر', game: 'ألعاب قوى', age: 23, isActive: true, joinDate: '2023-05-12' },
    { id: 6, name: 'ريم خالد', email: 'reem@example.com', gender: 'أنثى', nationality: 'عمان', game: 'جمباز', age: 19, isActive: false, joinDate: '2023-06-18' },
    { id: 7, name: 'ياسر وليد', email: 'yasser@example.com', gender: 'ذكر', nationality: 'البحرين', game: 'كرة يد', age: 27, isActive: true, joinDate: '2023-07-22' },
  ]);

  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<keyof Player | null>('name');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Helpers
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter(p =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.game.toLowerCase().includes(q)
    );
  }, [players, query]);

  const sorted = React.useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const A = (a[sortBy] ?? '') as any;
      const B = (b[sortBy] ?? '') as any;
      if (typeof A === 'string' && typeof B === 'string') {
        return sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
      }
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (A > B ? -1 : 1);
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const pageData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // Actions
  const toggleSort = (col: keyof Player) => {
    if (sortBy === col) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleDelete = (id: number) => {
    if (!confirm('هل أنت متأكد من حذف اللاعب؟')) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (id: number) => {
    alert(`تعديل اللاعب ${id}`);
  };

  const exportCSV = () => {
    const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الجنس', 'الجنسية', 'اللعبة', 'السن', 'الحالة', 'تاريخ الانضمام'];
    const rows = sorted.map(p => [
      p.id, p.name, p.email, p.gender, p.nationality, p.game, 
      p.age, p.isActive ? 'نشط' : 'غير نشط', p.joinDate
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `المدربين_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // UI helpers
  const Avatar = ({ name, src }: { name: string, src?: string }) => {
    const initials = name.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();
    const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-pink-500 to-rose-600'];
    const colorIndex = name.length % colors.length;
    return src ? (
      <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shadow-md" />
    ) : (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
        {initials}
      </div>
    );
  };

  const SortIcon = ({ column }: { column: keyof Player }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المدربين</h1>
          </div>
          <p className="text-gray-600">إدارة وتتبع جميع المدربين في النظام</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المدربين</p>
                <p className="text-2xl font-bold text-gray-900">{players.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">اللاعبون النشطون</p>
                <p className="text-2xl font-bold text-green-600">{players.filter(p => p.isActive).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">لاعبين كرة القدم</p>
                <p className="text-2xl font-bold text-indigo-600">{players.filter(p => p.game === 'كرة قدم').length}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط السن</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(players.reduce((sum, p) => sum + p.age, 0) / players.length)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="ابحث بالاسم، الإيميل، الجنسية أو اللعبة..."
                    className="pr-10 pl-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-80"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>عدد الصفوف:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">تصدير CSV</span>
                </button>
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
                      <span>اللاعب</span>
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
                  
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('gender')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الجنس</span>
                      <SortIcon column="gender" />
                    </div>
                  </th>
                  
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('nationality')}
                  >
                    <div className="flex items-center gap-2">
                      <span>الجنسية</span>
                      <SortIcon column="nationality" />
                    </div>
                  </th>
                  
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('game')}
                  >
                    <div className="flex items-center gap-2">
                      <span>اللعبة</span>
                      <SortIcon column="game" />
                    </div>
                  </th>
                  
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort('age')}
                  >
                    <div className="flex items-center gap-2">
                      <span>السن</span>
                      <SortIcon column="age" />
                    </div>
                  </th>
                  
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-100">
                {pageData.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* اللاعب */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={player.name} src={player.image} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{player.name}</div>
                          <div className="text-xs text-gray-500">انضم في {player.joinDate}</div>
                        </div>
                      </div>
                    </td>

                    {/* البريد الإلكتروني */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{player.email}</div>
                    </td>

                    {/* الجنس */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{player.gender}</div>
                    </td>

                    {/* الجنسية */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          player.nationality === 'مصر'
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200'
                            : player.nationality === 'السعودية'
                            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {player.nationality}
                      </span>
                    </td>

                    {/* اللعبة */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          player.game === 'كرة قدم'
                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200'
                            : player.game === 'تنس'
                            ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {player.game}
                      </span>
                    </td>

                    {/* السن */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-medium">{player.age}</div>
                    </td>

                    {/* الحالة */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${player.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">{player.isActive ? 'نشط' : 'غير نشط'}</span>
                      </div>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(player.id)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors duration-200 hover:scale-110"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200 hover:scale-110"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                عرض <span className="font-semibold text-gray-900">{(page-1)*rowsPerPage + 1}</span> - 
                <span className="font-semibold text-gray-900"> {Math.min(page*rowsPerPage, sorted.length)}</span> من 
                <span className="font-semibold text-gray-900"> {sorted.length}</span> لاعب
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  className="p-2 rounded-lg hover:bg-white border border-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  disabled={page === 1}
                  title="السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({length: Math.min(totalPages, 7)}).map((_, i) => {
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
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
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