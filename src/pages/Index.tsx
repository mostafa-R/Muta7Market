import Navbar from '@/components/Navbar';
import SimpleHero from '@/components/SimpleHero';
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
      <SimpleHero />
      
      {/* مساحة إعلانية */}
      <section className="py-8 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center border border-primary/20">
            <div className="text-muted-foreground text-sm mb-2">مساحة إعلانية</div>
            <div className="text-lg font-semibold text-foreground mb-2">اعلن هنا عن خدماتك الرياضية</div>
            <div className="text-muted-foreground text-sm">تواصل معنا لعرض إعلانك في هذه المساحة</div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <SportsSection />

      {/* Featured Players */}
      <section className="py-16 bg-muted ">
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
              <Button variant="default" size="lg">
                <Users className="w-5 h-5 ml-2" />
                عرض جميع اللاعبين
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white">
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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
