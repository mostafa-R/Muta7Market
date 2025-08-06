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
function SportCard() {
  const sports = [
    {
      id: "football",
      name: "كرة القدم",
      icon: Trophy,
      playersCount: 450,
      description:
        "أشهر رياضة في العالم العربي مع أكبر عدد من اللاعبين المسجلين",
      featured: true,
    },
    {
      id: "basketball",
      name: "كرة السلة",
      icon: Target,
      playersCount: 280,
      description: "رياضة سريعة ومثيرة تتطلب مهارات فنية عالية",
    },
    {
      id: "tennis",
      name: "التنس",
      icon: Zap,
      playersCount: 150,
      description: "رياضة فردية راقية تتطلب دقة وتحمل عالي",
    },
    {
      id: "swimming",
      name: "السباحة",
      icon: Waves,
      playersCount: 200,
      description: "رياضة مائية شاملة تطور جميع عضلات الجسم",
    },
    {
      id: "athletics",
      name: "ألعاب القوى",
      icon: Timer,
      playersCount: 320,
      description: "أم الرياضات تشمل الجري والقفز والرمي",
      featured: true,
    },
    {
      id: "cycling",
      name: "ركوب الدراجات",
      icon: Bike,
      playersCount: 180,
      description: "رياضة التحمل والسرعة في الهواء الطلق",
    },
    {
      id: "weightlifting",
      name: "رفع الأثقال",
      icon: Dumbbell,
      playersCount: 120,
      description: "رياضة القوة والعزيمة لبناء العضلات",
    },
    {
      id: "volleyball",
      name: "الكرة الطائرة",
      icon: Users,
      playersCount: 220,
      description: "رياضة جماعية ممتعة تتطلب التنسيق والتعاون",
    },
  ];

  const filteredSports = sports;

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
                  ${
                    sport.featured
                      ? "ring-2 ring-[hsl(var(--primary)/0.5)]"
                      : ""
                  }
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
                  <p className="text-sm text-[hsl(var(--muted-foreground))]  h-12 line-clamp-2  mb-4 text-center leading-relaxed">
                    {sport.description}
                  </p>
                  <div className="flex items-center justify-center space-x-2 space-x-reverse text-[hsl(var(--primary))] mb-4">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">
                      {sport.playersCount} لاعب
                    </span>
                  </div>
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
