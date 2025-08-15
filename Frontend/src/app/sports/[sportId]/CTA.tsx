import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

function CTA({ sportName }: { sportName: string }) {
  return (
    <div className="bg-muted mt-4 rounded-3xl p-8 md:p-10 text-center border border-[hsl(var(--primary)/0.1)] shadow-lg">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-4 md:mb-6">
        هل أنت لاعب {sportName}؟
      </h2>
      <p className="text-base md:text-lg text-[hsl(var(--muted-foreground))] mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
        انضم إلى مجتمعنا وأعرض مهاراتك للعالم
      </p>
      <Link href="/register-profile">
        <button
          type="button"
          className="inline-flex items-center justify-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary-foreground))] rounded-xl text-base md:text-lg px-8 py-4 md:px-10 md:py-5 hover:from-[hsl(var(--primary)/0.9)] hover:to-[hsl(var(--primary))] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.3)] font-semibold"
        >
          <Star className="w-5 h-5 md:w-6 md:h-6 ml-3" />
          سجل بياناتك الآن
        </button>
      </Link>
    </div>
  );
}

export default CTA;
