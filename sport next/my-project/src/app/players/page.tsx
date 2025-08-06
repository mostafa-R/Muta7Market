"use client";
import { useState } from "react";
import PlayerCard from "@/app/component/PlayerCard";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Trophy,
  Star,
  UserPlus,
  SlidersHorizontal,
} from "lucide-react";
import { mockPlayers } from "../data/mockPlayer";
import CTA from "./CTA";

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");

  // Get unique values for filters
  const uniqueSports = [...new Set(mockPlayers.map((player) => player.sport))];
  const uniqueNationalities = [
    ...new Set(mockPlayers.map((player) => player.nationality)),
  ];

  // Filter players
  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "all" || player.sport === sportFilter;
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.category === categoryFilter;
    const matchesNationality =
      nationalityFilter === "all" || player.nationality === nationalityFilter;

    return (
      matchesSearch &&
      matchesSport &&
      matchesStatus &&
      matchesCategory &&
      matchesNationality
    );
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSportFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
    setNationalityFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            جميع اللاعبين
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            اكتشف مواهب رياضية متنوعة من جميع أنحاء العالم العربي
          </p>
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <span className="inline-flex items-center bg-muted-foreground text-white rounded-full px-3 py-1 text-sm font-semibold">
              <Users className="w-4 h-4" />
              <span>{mockPlayers.length} 8 لاعب مسجل</span>
            </span>
            <span className="inline-flex items-center border border-border text-foreground rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className="w-4 h-4" />
              <span>{uniqueSports.length} رياضة</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-6">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">فلترة وبحث</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث باسم اللاعب، الجنسية أو الرياضة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right w-full py-2 px-4 rounded-lg border border-border bg-white"
              />
            </div>
            {/* Sport Filter */}
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-border bg-white text-right"
            >
              <option value="all">جميع الرياضات</option>
              {uniqueSports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-border bg-white text-right"
            >
              <option value="all">جميع الحالات</option>
              <option value="Free Agent">حر</option>
              <option value="Contracted">متعاقد</option>
              <option value="Transferred">منتقل</option>
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-border bg-white text-right"
            >
              <option value="all">جميع الفئات</option>
              <option value="Elite">نخبة</option>
              <option value="Professional">محترف</option>
              <option value="Amateur">هاوي</option>
            </select>
            {/* Nationality Filter */}
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-border bg-white text-right"
            >
              <option value="all">جميع الجنسيات</option>
              {uniqueNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
          {/* Clear Filters Button */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <button
              type="button"
              className="border rounded px-4 py-2 text-sm flex items-center hover:bg-primary/10 transition"
              onClick={clearAllFilters}
            >
              <Filter className="w-4 h-4 ml-2" />
              مسح جميع الفلاتر
            </button>
            <Link href="/register-profile">
              <button className="bg-primary text-white rounded px-4 py-2 text-sm flex items-center hover:bg-primary/90 transition">
                <UserPlus className="w-4 h-4 ml-2" />
                سجل كلاعب
              </button>
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            عرض {filteredPlayers.length} من أصل {mockPlayers.length} لاعب
          </p>
          {filteredPlayers.length !== mockPlayers.length && (
            <span className="inline-flex items-center bg-muted-foreground text-white rounded-full px-3 py-1 text-sm font-semibold">
              تم تطبيق فلاتر
            </span>
          )}
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
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              لم يتم العثور على لاعبين
            </h3>
            <p className="text-muted-foreground mb-6">
              جرب تغيير معايير البحث أو الفلاتر للعثور على لاعبين
            </p>
            <button
              type="button"
              className="border rounded px-4 py-2 text-sm flex items-center hover:bg-primary/10 transition"
              onClick={clearAllFilters}
            >
              <Filter className="w-4 h-4 ml-2" />
              مسح جميع الفلاتر
            </button>
          </div>
        )}

        {/* CTA Section */}
        <CTA />

      </div>
    </div>
  );
}
