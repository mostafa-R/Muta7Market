import React from "react";
import {
  Trophy,
  Users,
  Dumbbell,
  Waves,
  Bike,
  Target,
  Zap,
  Timer,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface SportCardProps {
  searchTerm: string;
}

function SportCard({ searchTerm }: SportCardProps) {
  const sports = [
    {
      id: "football",
      name: "كرة القدم",
      icon: Trophy,
      featured: true,
    },
    {
      id: "basketball",
      name: "كرة السلة",
      icon: Target,
    },
    {
      id: "tennis",
      name: "التنس",
      icon: Zap,
    },
    {
      id: "swimming",
      name: "السباحة",
      icon: Waves,
    },
    {
      id: "athletics",
      name: "ألعاب القوى",
      icon: Timer,
      featured: true,
    },
    {
      id: "cycling",
      name: "ركوب الدراجات",
      icon: Bike,
    },
    {
      id: "weightlifting",
      name: "رفع الأثقال",
      icon: Dumbbell,
    },
    {
      id: "volleyball",
      name: "الكرة الطائرة",
      icon: Users,
    },
    {
      id: "handball",
      name: "كرة اليد",
      icon: Users,
    },
    {
      id: "badminton",
      name: "الريشة الطائرة",
      icon: Zap,
    },
    {
      id: "karate",
      name: "الكاراتيه",
      icon: Dumbbell,
    },
    {
      id: "taekwondo",
      name: "التايكوندو",
      icon: Dumbbell,
    },
    {
      id: "archery",
      name: "السهام",
      icon: Target,
    },
    {
      id: "esports",
      name: "الرياضات الإلكترونية",
      icon: Zap,
    },
    {
      id: "judo",
      name: "الجودو",
      icon: Dumbbell,
    },
    {
      id: "fencing",
      name: "المبارزة",
      icon: Zap,
    },
    {
      id: "squash",
      name: "الإسكواش",
      icon: Target,
    },
    {
      id: "futsal",
      name: "كرة قدم الصالات",
      icon: Trophy,
    },
    {
      id: "boxing",
      name: "الملاكمة",
      icon: Dumbbell,
    },
    {
      id: "gymnastics",
      name: "الجمباز",
      icon: Timer,
    },
    {
      id: "billiards",
      name: "البلياردو والسنوكر",
      icon: Target,
    },
    {
      id: "wrestling",
      name: "المصارعة",
      icon: Dumbbell,
    },
  ];

  // إزالة التكرار بناءً على id باستخدام reduce
  const uniqueSports = sports.reduce<typeof sports>((unique, sport) => {
    return unique.find((item) => item.id === sport.id) ? unique : [...unique, sport];
  }, []);

  // فلترة الرياضات بناءً على مصطلح البحث
  const filteredSports = uniqueSports.filter((sport) =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 ">
        {filteredSports.map((sport) => {
          const Icon = sport.icon;
          return (
            <Link key={sport.id} href={`/sports/${sport.id}`}>
              <div
                className={`
                  h-full relative overflow-hidden group transition-smooth border border-gray-200 rounded-2xl bg-[hsl(var(--card))] shadow-card
                  ${sport.featured ? "ring-2 ring-[hsl(var(--primary)/0.5)]" : ""}
                `}
              >
                {sport.featured && (
                  <div className="absolute top-4 left-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs px-2 py-1 rounded-full font-semibold">
                    مميز
                  </div>
                )}
                <div className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg line-clamp-1 font-bold text-[hsl(var(--card-foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors text-center">
                    {sport.name}
                  </h3>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] rounded-lg px-4 py-2 bg-transparent hover:bg-[hsl(var(--primary)/0.1)] group transition"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    استكشف اللاعبين
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSports.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
            لم يتم العثور على نتائج
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            جرب البحث بكلمات مفتاحية أخرى
          </p>
        </div>
      )}
    </>
  );
}

export default SportCard;