"use client";
import axios from "axios";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import PlayerCard from "../component/PlayerCard";

// واجهة Player المستخدمة في PlayerCard
interface Player {
  id: string;
  name: string;
  age: number;
  status: "Free Agent" | "Contracted" | "Transferred";
  gender: "Male" | "Female";
  nationality: string;
  category: "Amateur" | "Professional" | "Elite";
  monthlySalary?: number;
  yearSalary?: number;
  annualContractValue?: number;
  contractConditions?: string;
  transferDeadline?: string;
  sport: string;
  position?: string;
  profileImage?: string;
  rating?: number;
  experience?: number;
}

// واجهة لبيانات الـ API الخام
interface ApiPlayer {
  _id: string;
  user: null | string;
  name: string;
  age: number;
  gender: string;
  nationality: string;
  category: string;
  position: string;
  status: string;
  expreiance: number;
  monthlySalary: {
    amount: number;
    currency: string;
  };
  yearSalary: {
    amount: number;
    currency: string;
  };
  game: string;
  views: number;
  isActive: boolean;
  contractEndDate?: string;
  media?: {
    profileImage?: {
      url: string;
      publicId: string;
    };
  };
}

// دالة لتحويل بيانات الـ API إلى واجهة Player
const transformApiDataToPlayer = (apiPlayer: ApiPlayer): Player => ({
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
});

// عنوان الـ API
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`;

const PlayerSection = () => {
  // إعداد الحالات
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات باستخدام Axios
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        // تحويل بيانات الـ API إلى واجهة Player
        const fetchedPlayers = response.data.data.players
          .slice(0, 10)
          .map(transformApiDataToPlayer);
        setPlayers(fetchedPlayers);
        setLoading(false);
      } catch (err) {
        setError("فشل في جلب بيانات اللاعبين. حاول مرة أخرى لاحقًا.");
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // عرض حالة التحميل
  if (loading) {
    return (
      <section className="py-16 bg-[hsl(var(--muted))]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              اللاعبون المميزون
            </h2>
            <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              جارٍ تحميل البيانات...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <section className="py-16 bg-[hsl(var(--muted))]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              اللاعبون المميزون
            </h2>
            <p className="text-xl text-red-500 max-w-2xl mx-auto">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[hsl(var(--muted))]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            اللاعبون المميزون
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            تعرف على أبرز المواهب الرياضية المسجلة في منصتنا
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/players">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
            >
              <Users className="w-5 h-5 ml-2" />
              عرض جميع اللاعبين
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlayerSection;
