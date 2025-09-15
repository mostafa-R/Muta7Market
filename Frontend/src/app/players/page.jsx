"use client";
import PlayerCard from "@/app/component/PlayerCard";
import PromoteNowButton from "@/app/profile/components/PromoteNowButton";
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

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players?jop=player`;

export default function PlayersPage() {
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
  const [myProfile, setMyProfile] = useState(null);

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
  }, []);

  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
      fetch(`${API_BASE}/players/playerprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.data) setMyProfile(j.data);
        })
        .catch(() => {});
    } catch {}
  }, []);

  // Helper function to extract string value from multilingual objects or strings
  const getStringValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && (value.ar || value.en || value.slug)) {
      return value.slug || value.en || value.ar;
    }
    return String(value);
  };

  // Helper function to extract searchable text from multilingual objects
  const getSearchableValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && (value.ar || value.en || value.slug)) {
      const values = [];
      if (value.ar) values.push(value.ar);
      if (value.en) values.push(value.en);
      if (value.slug) values.push(value.slug);
      return values.join(" ");
    }
    return String(value);
  };

  // Create unique arrays using string extraction to avoid duplicate keys
  const uniqueSportsKeys = [
    ...new Set(
      players.map((player) => getStringValue(player.game || player.sport))
    ),
  ];
  const uniqueNationalityKeys = [
    ...new Set(players.map((player) => getStringValue(player.nationality))),
  ];

  // For rendering, we need the original objects for proper translation
  const uniqueSports = uniqueSportsKeys.map((key) => {
    const player = players.find(
      (p) => getStringValue(p.game || p.sport) === key
    );
    return player?.game || player?.sport || key;
  });

  const uniqueNationalities = uniqueNationalityKeys.map((key) => {
    const player = players.find((p) => getStringValue(p.nationality) === key);
    return player?.nationality || key;
  });

  const filteredPlayers = players.filter((player) => {
    const searchTerm_lower = searchTerm.toLowerCase();

    // For search, use searchable values that include all language variants
    const searchableName = player.name.toLowerCase();
    const searchableNationality = getSearchableValue(
      player.nationality
    ).toLowerCase();
    const searchableSport = getSearchableValue(
      player.game || player.sport
    ).toLowerCase();

    const matchesSearch =
      searchableName.includes(searchTerm_lower) ||
      searchableNationality.includes(searchTerm_lower) ||
      searchableSport.includes(searchTerm_lower);

    // For filters, use string values for comparison
    const sportKey = getStringValue(player.game || player.sport);
    const nationalityKey = getStringValue(player.nationality);

    const matchesSport = sportFilter === "all" || sportKey === sportFilter;
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.category === categoryFilter;
    const matchesNationality =
      nationalityFilter === "all" || nationalityKey === nationalityFilter;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-background"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("players.allPlayers")}
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

  const isRTL = language === "ar";

  return (
    <div
      className="min-h-screen bg-background"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="py-8 bg-muted max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("players.allPlayers")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            {t("players.discoverTalents")}
          </p>

          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <span className="inline-flex items-center bg-muted-foreground  rounded-full px-3 py-1 text-sm font-semibold text-foreground">
              <Users className="w-4 h-4" />
              <span>
                {players.length} {t("players.registeredPlayers")}
              </span>
            </span>
            <span className="inline-flex items-center border border-border text-foreground rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className="w-4 h-4" />
              <span>
                {uniqueSports.length} {t("players.sports")}
              </span>
            </span>
          </div>
        </div>

        {myProfile?.isActive && !myProfile?.isPromoted?.status && (
          <div className="mt-4 flex justify-center w-full m-5">
            <PromoteNowButton profileId={myProfile?._id} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-6">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {t("players.filterAndSearch")}
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
                placeholder={t("players.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pr-10 w-full py-2 px-4 rounded-lg border border-border bg-white ${
                  isRTL ? "text-right" : "text-left"
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
              <option value="all">{t("players.allSports")}</option>
              {uniqueSports.map((sport) => {
                const sportKey = getStringValue(sport);
                const sportDisplay =
                  typeof sport === "object" && sport.ar
                    ? sport.ar
                    : typeof sport === "object" && sport.en
                    ? sport.en
                    : sportKey;
                return (
                  <option key={sportKey} value={sportKey}>
                    {t(`sports.${sportKey.toLowerCase()}`, {
                      defaultValue: sportDisplay,
                    })}
                  </option>
                );
              })}
            </select>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("players.allStatuses")}</option>
              <option value="Free Agent">{t("player.status.freeAgent")}</option>
              <option value="Contracted">
                {t("player.status.contracted")}
              </option>
              <option value="Transferred">
                {t("player.status.transferred")}
              </option>
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("players.allCategories")}</option>
              <option value="Elite">{t("players.category.elite")}</option>
              <option value="Professional">
                {t("players.category.professional")}
              </option>
              <option value="Amateur">{t("players.category.amateur")}</option>
            </select>
            {/* Nationality Filter */}
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className={`w-full py-2 px-4 rounded-lg border border-border bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("players.allNationalities")}</option>
              {uniqueNationalities.map((nationality) => {
                const nationalityKey = getStringValue(nationality);
                const nationalityDisplay =
                  typeof nationality === "object" && nationality.ar
                    ? nationality.ar
                    : typeof nationality === "object" && nationality.en
                    ? nationality.en
                    : nationalityKey;
                return (
                  <option key={nationalityKey} value={nationalityKey}>
                    {t(`nationalities.${nationalityKey.toLowerCase()}`, {
                      defaultValue: nationalityDisplay,
                    })}
                  </option>
                );
              })}
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
              {t("players.clearAllFilters")}
            </button>
            <Link href="/register-profile">
              <button className="bg-primary text-white rounded px-4 py-2 text-sm flex items-center hover:bg-primary/90 transition">
                <UserPlus className="w-4 h-4 ml-2" />
                {t("user.registerAsPlayer")}
              </button>
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {t("players.showingResults", {
              filtered: filteredPlayers.length,
              total: players.length,
            })}
          </p>
          {filteredPlayers.length !== players.length && (
            <span className="inline-flex items-center bg-muted-foreground  rounded-full px-3 py-1 text-sm font-semibold text-foreground">
              {t("players.filtersApplied")}
            </span>
          )}
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
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("errors.noResults")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("players.tryChangingFilters")}
            </p>
            <button
              type="button"
              className="border rounded px-4 py-2 text-sm flex items-center hover:bg-primary/10 transition"
              onClick={clearAllFilters}
            >
              <Filter className="w-4 h-4 ml-2" />
              {t("players.clearAllFilters")}
            </button>
          </div>
        )}

        {/* CTA Section */}
        <CTA />
      </div>
    </div>
  );
}
