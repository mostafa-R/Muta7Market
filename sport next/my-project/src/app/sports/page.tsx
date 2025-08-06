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

const SportsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

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

        <SportCard searchTerm={searchTerm} />

        {/* CTA Section */}
        <CTA />
      </div>
    </div>
  );
};

export default SportsPage;