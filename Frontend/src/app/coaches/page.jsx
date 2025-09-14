"use client";
import PlayerCard from "@/app/component/PlayerCard";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import {
  Filter,
  Search,
  SlidersHorizontal,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../component/LoadingSpinner";
import CTA from "./CTA";

const transformApiDataToPlayer = (apiPlayer) => ({
  id: apiPlayer._id,
  name: apiPlayer.name,
  age: apiPlayer.age,
  status: apiPlayer.status === "available" ? "Free Agent" : "Contracted",
  gender: apiPlayer.gender === "male" ? "Male" : "Female",
  nationality: apiPlayer.nationality, // String from backend
  birthCountry: apiPlayer.birthCountry, // String from backend
  category: apiPlayer.category,
  monthlySalary: apiPlayer.monthlySalary?.amount,
  contractConditions: undefined,
  transferDeadline: apiPlayer.contractEndDate,
  game: apiPlayer.game, // Object with {ar, en, slug} from backend
  sport: apiPlayer.game, // Deprecated, use game instead
  position: apiPlayer.position, // Object with {ar, en, slug} from backend
  roleType: apiPlayer.roleType, // Object with {ar, en, slug} from backend
  profilePicture: undefined,
  rating: undefined,
  experience: apiPlayer.experience || apiPlayer.expreiance, // Fixed typo
  profileImage: apiPlayer.media?.profileImage?.url || undefined,
  annualContractValue: apiPlayer.yearSalary?.amount,
  jop: apiPlayer.jop,
  isPromoted: apiPlayer.isPromoted || { status: false },
});

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players?jop=coach`;

export default function CoachesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const fetchedPlayers = response.data.data.players.map(
          transformApiDataToPlayer
        );
        setPlayers(fetchedPlayers);
        setLoading(false);
      } catch (err) {
        setError(t("errors.fetchPlayersFailed"));
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [t]);

  // Helper function to extract string value for comparison and filtering
  const getStringValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.slug) return value.slug;
      if (value.en) return value.en;
      if (value.ar) return value.ar;
    }
    return String(value);
  };

  // Helper function to extract searchable text from multilingual objects
  const getSearchableValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const values = [];
      if (value.ar) values.push(value.ar);
      if (value.en) values.push(value.en);
      if (value.slug) values.push(value.slug);
      return values.join(" ");
    }
    return String(value);
  };

  // Get unique values for filters
  const uniqueSports = [
    ...new Set(
      players.map((player) => getStringValue(player.game || player.sport))
    ),
  ].sort((a, b) => a.localeCompare(b, language));

  const uniqueNationalities = [
    ...new Set(players.map((player) => getStringValue(player.nationality))),
  ].sort((a, b) => a.localeCompare(b, language));

  // Filter players
  const filteredPlayers = players.filter((player) => {
    const searchableNationality = getSearchableValue(
      player.nationality
    ).toLowerCase();
    const searchableSport = getSearchableValue(
      player.game || player.sport
    ).toLowerCase();
    const searchTerm_lower = searchTerm.toLowerCase();

    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm_lower) ||
      searchableNationality.includes(searchTerm_lower) ||
      searchableSport.includes(searchTerm_lower);

    // For filters, extract string values to compare
    const sportValue = player.game || player.sport;
    const sportString = getStringValue(sportValue);
    const nationalityString = getStringValue(player.nationality);

    const matchesSport = sportFilter === "all" || sportString === sportFilter;
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.category === categoryFilter;
    const matchesNationality =
      nationalityFilter === "all" || nationalityString === nationalityFilter;

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

  const statusOptions = [
    { value: "all", label: t("coaches.statusOptions.all") },
    { value: "Free Agent", label: t("coaches.statusOptions.freeAgent") },
    { value: "Contracted", label: t("coaches.statusOptions.contracted") },
    { value: "Transferred", label: t("coaches.statusOptions.transferred") },
  ];

  const categoryOptions = [
    { value: "all", label: t("coaches.allCategories") },
    { value: "Elite", label: t("coaches.category.elite") },
    { value: "Professional", label: t("coaches.category.professional") },
    { value: "Amateur", label: t("coaches.category.amateur") },
  ];

  const isRTL = language === "ar";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("coaches.allCoaches")}
            </h1>
            <div>
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("coaches.allCoaches")}
            </h1>
            <p className="text-xl text-red-500 max-w-3xl mx-auto mb-6">
              {error}
            </p>
            <Link href="/">
              <button className="bg-primary text-white rounded px-4 py-2 text-sm flex items-center hover:bg-primary/90 transition">
                {t("common.backToHome")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("coaches.allCoaches")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            {t("coaches.discoverTalents")}
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center bg-muted-foreground  rounded-full px-3 py-1 text-sm font-semibold ">
              <Users className="w-4 h-4 mr-2" />
              <span>
                {players.length} {t("coaches.registeredCoaches")}
              </span>
            </span>
            <span className="inline-flex items-center border border-border text-foreground rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className="w-4 h-4 mr-2" />
              <span>
                {uniqueSports.length} {t("coaches.sports")}
              </span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {t("coaches.filterAndSearch")}
            </h3>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {/* Search */}
            <div className="xl:col-span-2 relative">
              <Search
                className={`absolute ${
                  isRTL ? "left-3" : "right-3"
                } top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
              />
              <input
                type="text"
                placeholder={t("coaches.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                  isRTL ? "text-right pr-4 pl-10" : "text-left pl-4 pr-10"
                }`}
              />
            </div>

            {/* Sport Filter */}
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("coaches.allSports")}</option>
              {uniqueSports.map((sport) => (
                <option key={sport} value={sport}>
                  {t(`sports.${sport.toLowerCase()}`)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Nationality Filter */}
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("coaches.allNationalities")}</option>
              {uniqueNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {t(`nationalities.${nationality.toLowerCase()}`)}
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
              <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("coaches.clearAllFilters")}
            </button>
            <Link href="/register-profile">
              <button className="bg-primary text-white rounded px-4 py-2 text-sm flex items-center hover:bg-primary/90 transition">
                <UserPlus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("user.registerAsCoach")}
              </button>
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {t("coaches.showingResults", {
              filtered: filteredPlayers.length,
              total: players.length,
            })}
          </p>
          {filteredPlayers.length !== players.length && (
            <span className="inline-flex items-center bg-muted-foreground text-white rounded-full px-3 py-1 text-sm font-semibold">
              {t("coaches.filtersApplied")}
            </span>
          )}
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("sports.results.noResultsTitle")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("coaches.tryChangingFilters")}
            </p>
            <button
              type="button"
              className="border rounded px-4 py-2 text-sm flex items-center hover:bg-primary/10 transition mx-auto"
              onClick={clearAllFilters}
            >
              <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("coaches.clearAllFilters")}
            </button>
          </div>
        )}

        {/* CTA Section */}
        <CTA />
      </div>
    </div>
  );
}
