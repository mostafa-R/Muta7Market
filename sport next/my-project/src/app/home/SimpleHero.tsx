import { Trophy, Users, Play } from "lucide-react";

const SimpleHero = () => {
  return (
    <section className="pt-20  text-[hsl(var(--foreground))] mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-[hsl(var(--foreground))] mb-8">
            منصة تسويق الرياضيين
          </h1>
          <p className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] mb-12 leading-relaxed max-w-3xl mx-auto">
            منصة شاملة لعرض وتسويق اللاعبين والمدربين من جميع الرياضات. انضم
            لمجتمع الرياضيين وشارك موهبتك مع العالم واحتفل بإنجازاتك الرياضية.
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              type="button"
              className="flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary)/0.9)] transition"
            >
              <Play className="w-5 h-5 ml-2" />
              ابدأ الآن
            </button>
            <button
              type="button"
              className="flex items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-transparent rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition"
            >
              تعرف على المزيد
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;
