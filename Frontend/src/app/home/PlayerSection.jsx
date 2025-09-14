"use client";
import axios from "axios";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../component/LoadingSpinner";
import Pagination from "../component/Pagination";
import PlayerCard from "../component/PlayerCard";

// Function to transform API data to Player object
const transformApiDataToPlayer = (apiPlayer) => ({
  id: apiPlayer._id,
  name: apiPlayer.name,
  age: apiPlayer.age,
  status: apiPlayer.status === "available" ? "Free Agent" : "Contracted",
  gender: apiPlayer.gender === "male" ? "Male" : "Female",
  nationality: apiPlayer.nationality, // String from backend
  birthCountry: apiPlayer.birthCountry, // String from backend
  category: apiPlayer.category === "player" ? "Professional" : "Elite",
  monthlySalary: apiPlayer.monthlySalary?.amount,
  annualContractValue: apiPlayer.yearSalary?.amount,
  contractConditions: undefined,
  transferDeadline: apiPlayer.contractEndDate,
  game: apiPlayer.game, // Object with {ar, en, slug} from backend
  sport: apiPlayer.game, // Deprecated, use game instead
  position: apiPlayer.position, // Object with {ar, en, slug} from backend
  roleType: apiPlayer.roleType, // Object with {ar, en, slug} from backend
  profileImage: apiPlayer.media?.profileImage?.url || undefined,
  rating: undefined,
  experience: apiPlayer.experience || apiPlayer.expreiance, // Fixed typo
  jop: apiPlayer.jop,
  isPromoted: apiPlayer.isPromoted || { status: false },
});

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`;

const PlayerSection = () => {
  const { t } = useTranslation();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const playersPerPage = 10;

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}?limit=${playersPerPage}&page=${currentPage}`
        );

        const responseData = response.data.data;

        const fetchedPlayers = responseData.players.map(
          transformApiDataToPlayer
        );

        setPlayers(fetchedPlayers);

        const total = responseData.pagination?.total || 0;
        const pages =
          responseData.pagination?.pages || Math.ceil(total / playersPerPage);

        setTotalPlayers(total);
        setTotalPages(pages);
        setLoading(false);
      } catch (err) {
        setError(t("errors.fetchPlayersFailed"));
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [currentPage, playersPerPage, t]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <section className="py-8 bg-[hsl(var(--muted))]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              {t("home.featuredPlayers")}
            </h2>
            <div>
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 bg-[hsl(var(--muted))]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              {t("home.featuredPlayers")}
            </h2>
            <p className="text-xl text-red-500 max-w-2xl mx-auto">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1  bg-[hsl(var(--muted))] mt-4">
      <div className="onesignal-customlink-container"></div>
      <div className="max-w-full mx-auto px-1 sm:px-1 lg:px-1">
        <div className="flex flex-wrap justify-center gap-2">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPages={5}
            showInfo={true}
            totalItems={totalPlayers}
            itemsPerPage={playersPerPage}
            loading={loading}
          />
        </div>

        <div className="text-center mt-8">
          <Link href="/players">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
            >
              <Users className="w-5 h-5 ml-2" />
              {t("home.viewAllPlayers")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlayerSection;
