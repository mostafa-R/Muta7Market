import { Trophy } from "lucide-react";
import Link from "next/link";
import React from "react";

function CTA() {
  return (
    <div className="bg-[hsl(var(--primary)/0.05)] rounded-3xl p-8 text-center">
      <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
        لا تجد رياضتك المفضلة؟
      </h2>
      <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
        سجل بياناتك كلاعب وساعدنا في إضافة المزيد من الرياضات
      </p>
      <Link href="/register-profile">
        <button
          type="button"
          className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
        >
          <Trophy className="w-5 h-5 ml-2" />
          سجل بياناتك الآن
        </button>
      </Link>
    </div>
  );
}

export default CTA;
