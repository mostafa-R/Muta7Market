import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Users, 
  Dumbbell, 
  Waves, 
  Bike, 
  Target,
  Zap,
  Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SportsSection = () => {
  const sports = [
    {
      id: 'football',
      name: 'كرة القدم',
      icon: Trophy,
      playersCount: 450,
      description: 'أشهر رياضة في العالم العربي',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'basketball',
      name: 'كرة السلة',
      icon: Target,
      playersCount: 280,
      description: 'رياضة سريعة ومثيرة',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'tennis',
      name: 'التنس',
      icon: Zap,
      playersCount: 150,
      description: 'رياضة فردية راقية',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'swimming',
      name: 'السباحة',
      icon: Waves,
      playersCount: 200,
      description: 'رياضة مائية شاملة',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'athletics',
      name: 'ألعاب القوى',
      icon: Timer,
      playersCount: 320,
      description: 'أم الرياضات',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'cycling',
      name: 'ركوب الدراجات',
      icon: Bike,
      playersCount: 180,
      description: 'رياضة التحمل والسرعة',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'weightlifting',
      name: 'رفع الأثقال',
      icon: Dumbbell,
      playersCount: 120,
      description: 'رياضة القوة والعزيمة',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: 'volleyball',
      name: 'الكرة الطائرة',
      icon: Users,
      playersCount: 220,
      description: 'رياضة جماعية ممتعة',
      gradient: 'from-teal-500 to-green-600'
    }
  ];

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            استكشف الألعاب الرياضية
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين المحترفين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <Link key={sport.id} to={`/sports/${sport.id}`}>
                <Card className="h-full border-[muted] overflow-hidden group transition-smooth hover:shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary/15 rounded-3xl flex items-center justify-center">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {sport.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/sports">
            <Button variant="default" size="lg">
              <Trophy className="w-5 h-5 ml-2" />
              عرض جميع الرياضات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SportsSection;