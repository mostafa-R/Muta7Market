"use client";
import Link from "next/link";
import { Users } from "lucide-react";
import PlayerCard from "../component/PlayerCard";
import { mockPlayers } from "../data/mockPlayer";


const featuredPlayers = mockPlayers.slice(0, 6);


const PlayerSection = () => {
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
        {/* //grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 */}
        <div className="flex flex-wrap justify-center gap-6">
          {featuredPlayers.map((player) => (
            // تأكد أن PlayerCard معرف عندك
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
        <div className="text-center my-12">
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
