import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import SportsSection from '@/components/SportsSection';
import PlayerCard from '@/components/PlayerCard';
import { Button } from '@/components/ui/button';
import { mockPlayers } from '@/data/mockPlayers';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Target, 
  Star,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  // Get featured players (first 6)
  const featuredPlayers = mockPlayers.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSlider />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">1000+</h3>
              <p className="text-muted-foreground">لاعب مسجل</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">15+</h3>
              <p className="text-muted-foreground">رياضة مختلفة</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">500+</h3>
              <p className="text-muted-foreground">فرصة وظيفية</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">95%</h3>
              <p className="text-muted-foreground">معدل النجاح</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <SportsSection />

      {/* Featured Players */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              اللاعبون المميزون
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              تعرف على أبرز المواهب الرياضية المسجلة في منصتنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/players">
              <Button variant="hero" size="lg">
                <Users className="w-5 h-5 ml-2" />
                عرض جميع اللاعبين
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ابدأ رحلتك الرياضية معنا
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              انضم إلى آلاف اللاعبين والمدربين الذين وجدوا فرصهم المثالية من خلال منصتنا
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register-profile">
                <Button variant="secondary" size="xl" className="shadow-glow hover:shadow-glow">
                  <Star className="w-5 h-5 ml-2" />
                  سجل كلاعب
                </Button>
              </Link>
              <Link to="/sports">
                <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  استكشف الرياضات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <div className="w-8 h-8 gradient-sports rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold hero-text">سوق الرياضة العربي</span>
            </div>
            <p className="text-muted-foreground">
              منصة شاملة لربط المواهب الرياضية بالفرص المناسبة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
