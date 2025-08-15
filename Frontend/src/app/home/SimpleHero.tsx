// import { Trophy, Users, Play } from "lucide-react";

// const SimpleHero = () => {
//   return (
//     <section className="pt-12  text-[hsl(var(--foreground))] mb-10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-5xl md:text-7xl font-bold text-[hsl(var(--foreground))] mb-8">
//             منصة تسويق الرياضيين
//           </h1>
//           <p className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] mb-10 leading-relaxed max-w-3xl mx-auto">
//             منصة شاملة لعرض وتسويق اللاعبين والمدربين من جميع الرياضات. انضم
//             لمجتمع الرياضيين وشارك موهبتك مع العالم واحتفل بإنجازاتك الرياضية.
//           </p>

//           {/* <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
//             <button
//               type="button"
//               className="flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary)/0.9)] transition"
//             >
//               <Play className="w-5 h-5 ml-2" />
//               ابدأ الآن
//             </button>
//             <button
//               type="button"
//               className="flex items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-transparent rounded-lg text-lg px-8 py-3 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition"
//             >
//               تعرف على المزيد
//             </button>
//           </div> */}

//         </div>
//       </div>
//     </section>
//   );
// };

// export default SimpleHero;

"use client";

import { useTranslation } from "react-i18next";

const SimpleHero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-12 text-white mb-10 overflow-hidden">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.7) 100%),
            url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Additional transparent layer for visual enhancement */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
            {t("hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;
