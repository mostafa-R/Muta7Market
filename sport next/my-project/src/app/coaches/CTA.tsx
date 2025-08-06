import { Link, Star } from "lucide-react";
import React from "react";

function CTA() {
  return (
    <div className="bg-primary rounded-3xl p-8 text-center ">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        هل أنت لاعب موهوب؟
      </h2>
      <p className="text-lg text-muted-foreground mb-6">
        انضم إلى مجتمعنا المتنامي من اللاعبين والمدربين المحترفين
      </p>
      <Link href="/register-profile">
        <button className="bg-primary text-white rounded px-6 py-3 text-lg flex items-center hover:bg-primary/90 transition">
          <Star className="w-5 h-5 ml-2" />
          سجل بياناتك الآن
        </button>
      </Link>
    </div>
  );
}

export default CTA;
