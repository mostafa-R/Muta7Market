"use client";
import { useState } from "react";
import Link from "next/link";
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
import SportCard from "./SportCard";
import CTA from "./CTA";

// const sports = [
//   {
//     id: "football",
//     name: "كرة القدم",
//     icon: Trophy,
//     playersCount: 450,
//     description: "أشهر رياضة في العالم العربي مع أكبر عدد من اللاعبين المسجلين",
//     featured: true,
//   },
//   {
//     id: "basketball",
//     name: "كرة السلة",
//     icon: Target,
//     playersCount: 280,
//     description: "رياضة سريعة ومثيرة تتطلب مهارات فنية عالية",
//   },
//   {
//     id: "tennis",
//     name: "التنس",
//     icon: Zap,
//     playersCount: 150,
//     description: "رياضة فردية راقية تتطلب دقة وتحمل عالي",
//   },
//   {
//     id: "swimming",
//     name: "السباحة",
//     icon: Waves,
//     playersCount: 200,
//     description: "رياضة مائية شاملة تطور جميع عضلات الجسم",
//   },
//   {
//     id: "athletics",
//     name: "ألعاب القوى",
//     icon: Timer,
//     playersCount: 320,
//     description: "أم الرياضات تشمل الجري والقفز والرمي",
//     featured: true,
//   },
//   {
//     id: "cycling",
//     name: "ركوب الدراجات",
//     icon: Bike,
//     playersCount: 180,
//     description: "رياضة التحمل والسرعة في الهواء الطلق",
//   },
//   {
//     id: "weightlifting",
//     name: "رفع الأثقال",
//     icon: Dumbbell,
//     playersCount: 120,
//     description: "رياضة القوة والعزيمة لبناء العضلات",
//   },
//   {
//     id: "volleyball",
//     name: "الكرة الطائرة",
//     icon: Users,
//     playersCount: 220,
//     description: "رياضة جماعية ممتعة تتطلب التنسيق والتعاون",
//   },
// ];

const SportsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // const filteredSports = sports.filter((sport) =>
  //   sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[hsl(var(--muted))]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            استكشف جميع الرياضات
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto mb-8">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين
            المحترفين من جميع أنحاء العالم العربي
          </p>
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن رياضة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
            />
          </div>
        </div>

        <SportCard  />

        {/* CTA Section */}
        <CTA />
      </div>
    </div>
  );
};

export default SportsPage;
