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

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm">لاعب ومدرب</div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-border hidden md:block"></div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">15+</div>
                <div className="text-sm">رياضة مختلفة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;