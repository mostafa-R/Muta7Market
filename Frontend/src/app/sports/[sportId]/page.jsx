"use client";
import PlayerCard from "@/app/component/PlayerCard";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { ArrowRight, Filter, Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CTA from "./CTA";

// دالة لتحويل بيانات الـ API إلى واجهة Player
const transformApiDataToPlayer = (apiPlayer) => ({
  id: apiPlayer._id,
  name: apiPlayer.name,
  age: apiPlayer.age,
  status: apiPlayer.status === "available" ? "Free Agent" : "Contracted",
  gender: apiPlayer.gender === "male" ? "Male" : "Female",
  nationality: apiPlayer.nationality,
  category: apiPlayer.category === "player" ? "Professional" : "Elite",
  monthlySalary: apiPlayer.monthlySalary?.amount,
  annualContractValue: apiPlayer.yearSalary?.amount,
  contractConditions: undefined,
  transferDeadline: apiPlayer.contractEndDate,
  sport: apiPlayer.game,
  position: apiPlayer.position,
  profileImage: apiPlayer.media?.profileImage?.url || undefined,
  rating: undefined,
  experience: apiPlayer.expreiance,
  jop: apiPlayer.jop,
  isPromoted: apiPlayer.isPromoted || { status: false },
});

// عنوان الـ API الأساسي
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SportDetailPage = () => {
  const params = useParams();
  const sportId = Array.isArray(params?.sportId)
    ? params?.sportId[0]
    : params?.sportId;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const statusOptions = [
    { value: "all", label: t("sports.statusOptions.all") },
    { value: "Free Agent", label: t("sports.statusOptions.freeAgent") },
    { value: "Contracted", label: t("sports.statusOptions.contracted") },
    { value: "Transferred", label: t("sports.statusOptions.transferred") },
  ];

  const categoryOptions = [
    { value: "all", label: t("sports.categoryOptions.all") },
    { value: "player", label: t("sports.categoryOptions.player") },
    { value: "coach", label: t("sports.categoryOptions.coach") },
  ];

  // Get sport name from translations
  const sportName = sportId ? t(`sports.${sportId.toLowerCase()}`) : "";
  const apiSportName = sportId?.toLowerCase() || "";

  // جلب البيانات باستخدام Axios
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/players?game=${apiSportName}`
        );
        console.log("API Response"); // تسجيل استجابة الـ API الكاملة

        // التحقق من هيكلية الاستجابة
        if (!response.data?.data?.players) {
          console.error("Unexpected API response structure");
          throw new Error("هيكلية استجابة الـ API غير متوقعة");
        }

        // تحويل بيانات اللاعبين إلى تنسيق Player
        const fetchedPlayers = response.data.data.players.map(
          transformApiDataToPlayer
        );

        setPlayers(fetchedPlayers);
        console.log("Fetched Players:", fetchedPlayers); // تسجيل اللاعبين بعد التحويل

        setLoading(false);
      } catch (err) {
        console.error("Error fetching players");
        setError(
          err.response?.data?.message ||
            "فشل في جلب بيانات اللاعبين. حاول مرة أخرى لاحقًا."
        );
        setLoading(false);
      }
    };

    if (apiSportName) {
      fetchPlayers();
    } else {
      setLoading(false);
      setError("الرياضة غير موجودة");
    }
  }, [apiSportName]);

  // تصفية اللاعبين
  const filteredPlayers = players.filter((player) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      player.name.toLowerCase().includes(search) ||
      player.nationality.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.jop === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
              {t("sports.loadingTitle", {
                sportName: sportName || t("sports.notFoundTitle"),
              })}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              {t("sports.loadingDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ أو الرياضة غير موجودة
  if (error || !sportName) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
            {error || t("sports.notFoundTitle")}
          </h1>
          <Link href="/sports">
            <button className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-6 py-3 text-lg font-semibold hover:bg-[hsl(var(--primary)/0.95)] transition">
              <ArrowRight className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("sports.backToSports")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`flex items-center space-x-2 ${
            isRTL ? "space-x-reverse" : ""
          } text-sm text-[hsl(var(--muted-foreground))] mb-6`}
        >
          <Link
            href="/sports"
            className="hover:text-[hsl(var(--primary))] transition-colors"
          >
            {t("sports.allSports")}
          </Link>
          <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          <span className="text-[hsl(var(--foreground))] font-medium">
            {sportName}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            {t("sports.explorePlayers")} {sportName}
          </h1>
          <div
            className={`flex items-center space-x-4 ${
              isRTL ? "space-x-reverse" : ""
            }`}
          >
            <span className="inline-flex items-center bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Users className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("sports.playersCount", { count: players.length })}
            </span>
            <span className="inline-flex items-center border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {sportName}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[hsl(var(--card))] rounded-xl p-6 mb-8 border border-[hsl(var(--border))] shadow-card">
          <div
            className={`flex items-center space-x-4 ${
              isRTL ? "space-x-reverse" : ""
            } mb-4`}
          >
            <Filter className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold">
              {t("sports.filters.title")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4`}
              />
              <input
                type="text"
                placeholder={t("sports.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${
                  isRTL ? "pr-10" : "pl-10"
                } text-right w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition`}
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
              {t("sports.filters.clearFilters")}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[hsl(var(--muted-foreground))]">
            {t("sports.results.showing", {
              filtered: filteredPlayers.length,
              total: players.length,
            })}
          </p>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
              {t("sports.results.noResultsTitle")}
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              {t("sports.results.noResultsDescription")}
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
              {t("sports.results.clearAllFilters")}
            </button>
          </div>
        )}

        <CTA sportName={sportName} />
      </div>
    </div>
  );
};

export default SportDetailPage;
