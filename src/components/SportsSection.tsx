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
      description: 'أشهر رياضة في العالم العربي - تطوير المهارات الفنية والجسدية للاعبين',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'basketball',
      name: 'كرة السلة',
      icon: Target,
      playersCount: 280,
      description: 'رياضة سريعة ومثيرة تتطلب مهارات عالية في التصويب والتحكم بالكرة',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'tennis',
      name: 'التنس',
      icon: Zap,
      playersCount: 150,
      description: 'رياضة فردية راقية تعتمد على التركيز والدقة والتحمل البدني',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'swimming',
      name: 'السباحة',
      icon: Waves,
      playersCount: 200,
      description: 'رياضة مائية شاملة تطور جميع عضلات الجسم وتحسن اللياقة البدنية',
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
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            استكشف الألعاب الرياضية
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين المحترفين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <Link key={sport.id} to={`/sports/${sport.id}`}>
                <Card className="h-full border-0 gradient-card overflow-hidden group transition-smooth hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${sport.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                      {sport.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {sport.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 space-x-reverse text-primary">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{sport.playersCount} لاعب</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/sports">
            <Button variant="hero" size="lg">
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