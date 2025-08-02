import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { 
  Trophy, 
  Users, 
  Dumbbell, 
  Waves, 
  Bike, 
  Target,
  Zap,
  Timer,
  Search,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

const Sports = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sports = [
    {
      id: 'football',
      name: 'كرة القدم',
      icon: Trophy,
      playersCount: 450,
      description: 'أشهر رياضة في العالم العربي مع أكبر عدد من اللاعبين المسجلين',
      gradient: 'from-green-500 to-emerald-600',
      featured: true
    },
    {
      id: 'basketball',
      name: 'كرة السلة',
      icon: Target,
      playersCount: 280,
      description: 'رياضة سريعة ومثيرة تتطلب مهارات فنية عالية',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'tennis',
      name: 'التنس',
      icon: Zap,
      playersCount: 150,
      description: 'رياضة فردية راقية تتطلب دقة وتحمل عالي',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'swimming',
      name: 'السباحة',
      icon: Waves,
      playersCount: 200,
      description: 'رياضة مائية شاملة تطور جميع عضلات الجسم',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'athletics',
      name: 'ألعاب القوى',
      icon: Timer,
      playersCount: 320,
      description: 'أم الرياضات تشمل الجري والقفز والرمي',
      gradient: 'from-purple-500 to-pink-600',
      featured: true
    },
    {
      id: 'cycling',
      name: 'ركوب الدراجات',
      icon: Bike,
      playersCount: 180,
      description: 'رياضة التحمل والسرعة في الهواء الطلق',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'weightlifting',
      name: 'رفع الأثقال',
      icon: Dumbbell,
      playersCount: 120,
      description: 'رياضة القوة والعزيمة لبناء العضلات',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: 'volleyball',
      name: 'الكرة الطائرة',
      icon: Users,
      playersCount: 220,
      description: 'رياضة جماعية ممتعة تتطلب التنسيق والتعاون',
      gradient: 'from-teal-500 to-green-600'
    }
  ];

  const filteredSports = sports.filter(sport =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            استكشف جميع الرياضات
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            اكتشف المواهب في مختلف الرياضات وتواصل مع اللاعبين والمدربين المحترفين من جميع أنحاء العالم العربي
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن رياضة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </div>

        {/* Sports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredSports.map((sport) => {
            const Icon = sport.icon;
            return (
              <Link key={sport.id} to={`/sports/${sport.id}`}>
                <Card className={`h-full card-hover border-0 gradient-card overflow-hidden group relative ${
                  sport.featured ? 'ring-2 ring-primary/50' : ''
                }`}>
                  {sport.featured && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                      مميز
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${sport.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors text-center">
                      {sport.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 text-center leading-relaxed">
                      {sport.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 space-x-reverse text-primary mb-4">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{sport.playersCount} لاعب</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      استكشف اللاعبين
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSports.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-muted-foreground">
              جرب البحث بكلمات مفتاحية أخرى
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            لا تجد رياضتك المفضلة؟
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            سجل بياناتك كلاعب وساعدنا في إضافة المزيد من الرياضات
          </p>
          <Link to="/register-profile">
            <Button variant="hero" size="lg">
              <Trophy className="w-5 h-5 ml-2" />
              سجل بياناتك الآن
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sports;