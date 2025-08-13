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
    id: "handball",
    name: "كرة اليد",
    icon: Users,
    gradient: "from-teal-500 to-green-600",
  },
  {
    id: "basketball",
    name: "كرة السلة",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "volleyball",
    name: "الكرة الطائرة",
    icon: Users,
    gradient: "from-teal-500 to-green-600",
  },
  {
    id: "badminton",
    name: "الريشة الطائرة",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "athletics",
    name: "ألعاب القوى",
    icon: Timer,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "tennis",
    name: "التنس",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "tabletennis",
    name: "كرة الطاولة",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "karate",
    name: "الكاراتيه",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "taekwondo",
    name: "التايكوندو",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "archery",
    name: "السهام",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "esports",
    name: "الرياضات الإلكترونية",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "judo",
    name: "الجودو",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "fencing",
    name: "المبارزة",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "cycling",
    name: "الدراجات الهوائية",
    icon: Bike,
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "squash",
    name: "الإسكواش",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "weightlifting",
    name: "رفع الأثقال",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "futsal",
    name: "كرة قدم الصالات",
    icon: Trophy,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "boxing",
    name: "الملاكمة",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "gymnastics",
    name: "الجمباز",
    icon: Timer,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "billiards",
    name: "البلياردو والسنوكر",
    icon: Target,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "wrestling",
    name: "المصارعة",
    icon: Dumbbell,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "swimming",
    name: "السباحة",
    icon: Waves,
    gradient: "from-blue-500 to-cyan-600",
  },
];


const SportsSection = () => {
  // تقسيم الرياضات إلى صفين متساويين
  const half = Math.ceil(sports.length / 2);
  const firstRow = sports.slice(0, half);
  const secondRow = sports.slice(half);

  return (
    <section className="py-16 bg-[hsl(var(--muted))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            استكشف الألعاب الرياضية
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين المحترفين
          </p>
        </div>

       <div className="flex flex-col gap-4">
  {/* الصف الأول */}
  <div className="flex flex-wrap gap-2 justify-center">
    {firstRow.map((sport) => {
      const Icon = sport.icon;
      return (
        <Link key={sport.id} href={`/sports/${sport.id}`}>
          <div
            className={`
              flex flex-col items-center
              min-w-[100px] w-24 h-24
              overflow-hidden group transition-all duration-200
              border border-gray-200 hover:border-[hsl(var(--primary))]
              bg-white hover:bg-gray-50
              rounded-lg
              shadow-sm hover:shadow-md
              cursor-pointer
            `}
          >
            <div className="p-3 w-full h-full flex flex-col justify-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 px-1">
                {sport.name}
              </h3>
            </div>
          </div>
        </Link>
      );
    })}
  </div>

  {/* الصف الثاني */}
  <div className="flex flex-wrap gap-2 justify-center">
    {secondRow.map((sport) => {
      const Icon = sport.icon;
      return (
        <Link key={sport.id} href={`/sports/${sport.id}`}>
          <div
            className={`
              flex flex-col items-center
              min-w-[100px] w-24 h-24
              overflow-hidden group transition-all duration-200
              border border-gray-200 hover:border-[hsl(var(--primary))]
              bg-white hover:bg-gray-50
              rounded-lg
              shadow-sm hover:shadow-md
              cursor-pointer
            `}
          >
            <div className="p-2 w-full h-full flex flex-col justify-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 px-1">
                {sport.name}
              </h3>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
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