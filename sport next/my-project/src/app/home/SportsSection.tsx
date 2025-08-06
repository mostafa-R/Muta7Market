"use client";
import {
  Trophy,
  Users,
  Dumbbell,
  Waves,
  Bike,
  Target,
  Zap,
  Timer,
} from "lucide-react";
import Link from "next/link";

const sports = [
  {
    id: "football",
    name: "كرة القدم",
    icon: Trophy,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "basketball",
    name: "كرة السلة",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "tennis",
    name: "التنس",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "swimming",
    name: "السباحة",
    icon: Waves,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "athletics",
    name: "ألعاب القوى",
    icon: Timer,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "cycling",
    name: "ركوب الدراجات",
    icon: Bike,
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "weightlifting",
    name: "رفع الأثقال",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "volleyball",
    name: "الكرة الطائرة",
    icon: Users,
    gradient: "from-teal-500 to-green-600",
  },
];

const SportsSection = () => {
  return (
    <section className="py-16 bg-[hsl(var(--muted))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            استكشف الألعاب الرياضية
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين
            المحترفين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <Link key={sport.id} href={`/sports/${sport.id}`}>
                <div
                  className="
                  h-full overflow-hidden group transition-smooth hover:shadow-lg 
                  border border-[hsl(var(--border))]
                  bg-[hsl(var(--card))]
                  rounded-2xl
                "
                >
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--primary)/0.15)] rounded-3xl flex items-center justify-center">
                      <Icon className="w-10 h-10 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="text-xl font-bold text-[hsl(var(--card-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                      {sport.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/sports">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
            >
              <Trophy className="w-5 h-5 ml-2" />
              عرض جميع الرياضات
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
