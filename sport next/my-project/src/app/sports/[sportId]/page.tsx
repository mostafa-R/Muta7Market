"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Filter, Users, Trophy, Star } from "lucide-react";
import { mockPlayers } from "@/app/data/mockPlayer";
import PlayerCard from "@/app/component/PlayerCard";
import CTA from "./CTA";

const sportNames: { [key: string]: string } = {
  football: "كرة القدم",
  basketball: "كرة السلة",
  tennis: "التنس",
  swimming: "السباحة",
  athletics: "ألعاب القوى",
  cycling: "ركوب الدراجات",
  weightlifting: "رفع الأثقال",
  volleyball: "الكرة الطائرة",
};

const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "Free Agent", label: "حر" },
  { value: "Contracted", label: "متعاقد" },
  { value: "Transferred", label: "منتقل" },
];

const categoryOptions = [
  { value: "all", label: "جميع الفئات" },
  { value: "Elite", label: "نخبة" },
  { value: "Professional", label: "محترف" },
  { value: "Amateur", label: "هاوي" },
];

// دالة وهمية لجلب اللاعبين حسب الرياضة (عدلها لـ fetch API/DB لو عندك)
function getPlayersBySport(sportId: string) {
  return mockPlayers.filter((p) => p.sportId === sportId);
}

const SportDetailPage = () => {
  const params = useParams();
  const sportId = Array.isArray(params?.sportId)
    ? params?.sportId[0]
    : (params?.sportId as string);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const players = sportId ? getPlayersBySport(sportId) : [];
  const sportName = sportId ? sportNames[sportId] : "";

  const filteredPlayers = players.filter((player) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      player.name.toLowerCase().includes(search) ||
      player.nationality.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!sportId || !sportName) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
            الرياضة غير موجودة
          </h1>
          <Link href="/sports">
            <button className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-6 py-3 text-lg font-semibold hover:bg-[hsl(var(--primary)/0.95)] transition">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرياضات
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-[hsl(var(--muted-foreground))] mb-6">
          <Link
            href="/sports"
            className="hover:text-[hsl(var(--primary))] transition-colors"
          >
            الرياضات
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-[hsl(var(--foreground))] font-medium">
            {sportName}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            لاعبو {sportName}
          </h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="inline-flex items-center bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Users className="w-4 h-4 ml-2" />
              {players.length} لاعب مسجل
            </span>
            <span className="inline-flex items-center border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className="w-4 h-4 ml-2" />
              {sportName}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[hsl(var(--card))] rounded-xl p-6 mb-8 border border-[hsl(var(--border))] shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <Filter className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold">فلترة النتائج</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث باسم اللاعب أو الجنسية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white text-right focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white text-right focus:outline-none"
            >
              {categoryOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Clear Filters */}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-4 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground)/0.06)] transition"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[hsl(var(--muted-foreground))]">
            عرض {filteredPlayers.length} من أصل {players.length} لاعب
          </p>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
              لم يتم العثور على لاعبين
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-6 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground)/0.06)] transition"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}

        <CTA sportName={sportName} />
      </div>
    </div>
  );
};

export default SportDetailPage;
