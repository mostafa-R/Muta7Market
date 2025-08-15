import { ArrowRight, Search } from "lucide-react";

import {
  FaBasketballBall,
  FaBiking,
  FaChessKnight,
  FaDumbbell,
  FaFistRaised,
  FaFootballBall,
  FaRunning,
  FaSwimmer,
  FaTableTennis,
  FaVolleyballBall,
} from "react-icons/fa";
import {
  GiArcheryTarget,
  GiBoxingGlove,
  GiGoalKeeper,
  GiKimono,
  GiMuscleUp,
  GiSwordman,
  GiTennisRacket,
} from "react-icons/gi";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdSportsGymnastics, MdSportsTennis } from "react-icons/md";

import Link from "next/link";

interface SportCardProps {
  searchTerm: string;
}

function SportCard({ searchTerm }: SportCardProps) {
  const sports = [
    {
      id: "handball",
      name: "كرة اليد",
      icon: FaFootballBall,
    },
    {
      id: "basketball",
      name: "كرة السلة",
      icon: FaBasketballBall,
    },
    {
      id: "volleyball",
      name: "الكرة الطائرة",
      icon: FaVolleyballBall,
    },
    {
      id: "badminton",
      name: "الريشة الطائرة",
      icon: GiTennisRacket,
    },
    {
      id: "athletics",
      name: "ألعاب القوى",
      icon: FaRunning,
    },
    {
      id: "tennis",
      name: "التنس",
      icon: MdSportsTennis,
    },
    {
      id: "tabletennis",
      name: "كرة الطاولة",
      icon: FaTableTennis,
    },
    {
      id: "karate",
      name: "الكاراتيه",
      icon: GiKimono,
    },
    {
      id: "taekwondo",
      name: "التايكوندو",
      icon: FaFistRaised,
    },
    {
      id: "archery",
      name: "الرماية",
      icon: GiArcheryTarget,
    },
    {
      id: "esports",
      name: "الألعاب الإلكترونية",
      icon: IoGameControllerOutline,
    },
    {
      id: "judo",
      name: "الجودو",
      icon: GiKimono,
    },
    {
      id: "fencing",
      name: "المبارزة",
      icon: GiSwordman,
    },
    {
      id: "cycling",
      name: "الدراجات",
      icon: FaBiking,
    },
    {
      id: "squash",
      name: "الإسكواش",
      icon: GiTennisRacket,
    },
    {
      id: "weightlifting",
      name: "رفع الأثقال",
      icon: FaDumbbell,
    },
    {
      id: "futsal",
      name: "كرة قدم الصالات",
      icon: GiGoalKeeper,
    },
    {
      id: "boxing",
      name: "الملاكمة",
      icon: GiBoxingGlove,
    },
    {
      id: "gymnastics",
      name: "الجمباز",
      icon: MdSportsGymnastics,
    },
    {
      id: "billiards",
      name: "البلياردو",
      icon: FaChessKnight,
    },
    {
      id: "wrestling",
      name: "المصارعة",
      icon: GiMuscleUp,
    },
    {
      id: "swimming",
      name: "السباحة",
      icon: FaSwimmer,
    },
  ];

  // إزالة التكرار بناءً على id باستخدام reduce
  const uniqueSports = sports.reduce<typeof sports>((unique, sport) => {
    return unique.find((item) => item.id === sport.id)
      ? unique
      : [...unique, sport];
  }, []);

  // فلترة الرياضات بناءً على مصطلح البحث
  const filteredSports = uniqueSports.filter((sport) =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredSports.map((sport) => {
          const Icon = sport.icon;
          return (
            <Link key={sport.id} href={`/sports/${sport.id}`}>
              <div className="h-full relative overflow-hidden group transition-all duration-300 ease-in-out border border-gray-200 rounded-2xl bg-[hsl(var(--card))] shadow-sm hover:shadow-lg hover:border-[hsl(var(--primary))] transform hover:-translate-y-1">
                <div className="p-6">
                  {/* Icon Container with improved styling */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>

                  {/* Sport Name with better typography */}
                  <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))] mb-4 group-hover:text-[hsl(var(--primary))] transition-colors duration-300 text-center leading-tight">
                    {sport.name}
                  </h3>

                  {/* Action Button with enhanced styling */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] rounded-lg px-4 py-3 bg-transparent hover:bg-[hsl(var(--primary)/0.1)] group-hover:shadow-md transition-all duration-300 ease-in-out font-medium"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    استكشف اللاعبين
                  </button>
                </div>

                {/* Subtle background pattern for visual interest */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[hsl(var(--primary)/0.02)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* No Results with improved styling */}
      {filteredSports.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
            لم يتم العثور على نتائج
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed">
            جرب البحث بكلمات مفتاحية أخرى أو تصفح جميع الرياضات المتاحة
          </p>
        </div>
      )}
    </>
  );
}

export default SportCard;
