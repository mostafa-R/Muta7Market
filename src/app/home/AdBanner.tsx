const AdBanner = () => {
  return (
    <section className="py-8 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="
            bg-gradient-to-r
            from-[hsl(var(--primary)/0.10)]
            to-[hsl(var(--accent)/0.10)]
            rounded-2xl
            p-8
            text-center
            border
            border-[hsl(var(--primary)/0.20)]
          "
        >
          <div className="text-[hsl(var(--muted-foreground))] text-sm mb-2">
            مساحة إعلانية
          </div>
          <div className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            اعلن هنا عن خدماتك الرياضية
          </div>
          <div className="text-[hsl(var(--muted-foreground))] text-sm">
            تواصل معنا لعرض إعلانك في هذه المساحة
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;
