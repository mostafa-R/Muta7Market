import { Button } from '@/components/ui/button';
import { Trophy, Users, Play } from 'lucide-react';

const SimpleHero = () => {
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8">
            منصة تسويق الرياضيين
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            منصة شاملة لعرض وتسويق اللاعبين والمدربين من جميع الرياضات. 
            انضم لمجتمع الرياضيين وشارك موهبتك مع العالم واحتفل بإنجازاتك الرياضية.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 ml-2" />
              ابدأ الآن
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              تعرف على المزيد
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SimpleHero;