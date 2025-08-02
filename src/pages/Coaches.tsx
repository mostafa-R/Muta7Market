import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Calendar, Trophy, Star, Users, Medal } from 'lucide-react';

// Mock coaches data
const mockCoaches = [
  {
    id: '1',
    name: 'أحمد محمد السعيد',
    sport: 'كرة القدم',
    age: 45,
    nationality: 'مصري',
    category: 'Professional',
    status: 'Available',
    experience: '15 سنة',
    rating: 5,
    specialization: 'تدريب الناشئين',
    certifications: ['UEFA Pro License', 'FIFA Coaching'],
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'فاطمة علي حسن',
    sport: 'التنس',
    age: 38,
    nationality: 'سعودية',
    category: 'Elite',
    status: 'Contracted',
    experience: '12 سنة',
    rating: 5,
    specialization: 'تدريب المبتدئين والمحترفين',
    certifications: ['ITF Coaching', 'Tennis Pro'],
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'خالد عبدالله المنصوري',
    sport: 'كرة السلة',
    age: 42,
    nationality: 'إماراتي',
    category: 'Professional',
    status: 'Available',
    experience: '10 سنوات',
    rating: 4,
    specialization: 'تطوير المهارات الفردية',
    certifications: ['FIBA Coaching', 'Basketball Pro'],
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'نورا سالم الشامي',
    sport: 'السباحة',
    age: 35,
    nationality: 'لبنانية',
    category: 'Elite',
    status: 'Available',
    experience: '8 سنوات',
    rating: 5,
    specialization: 'تقنيات السباحة المتقدمة',
    certifications: ['Swimming Coach Level 3', 'Aquatic Safety'],
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

const Coaches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Contracted': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Elite': return 'bg-yellow-500';
      case 'Professional': return 'bg-purple-500';
      case 'Amateur': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available': return 'متاح';
      case 'Contracted': return 'متعاقد';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'Elite': return 'نخبة';
      case 'Professional': return 'محترف';
      case 'Amateur': return 'هاوي';
      default: return category;
    }
  };

  const filteredCoaches = mockCoaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || coach.sport === selectedSport;
    const matchesCategory = selectedCategory === 'all' || coach.category === selectedCategory;
    
    return matchesSearch && matchesSport && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            المدربين المحترفين
          </h1>
          <p className="text-xl text-muted-foreground">
            تواصل مع أفضل المدربين في مختلف الرياضات
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl p-6 mb-8 shadow-card border-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ابحث عن مدرب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الرياضة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الرياضات</SelectItem>
                <SelectItem value="كرة القدم">كرة القدم</SelectItem>
                <SelectItem value="التنس">التنس</SelectItem>
                <SelectItem value="كرة السلة">كرة السلة</SelectItem>
                <SelectItem value="السباحة">السباحة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="Elite">نخبة</SelectItem>
                <SelectItem value="Professional">محترف</SelectItem>
                <SelectItem value="Amateur">هاوي</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-4 h-4" />
              <span>فلاتر متقدمة</span>
            </Button>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <Link key={coach.id} to={`/coach/${coach.id}`}>
              <Card className="h-full border-0 gradient-card overflow-hidden transition-smooth hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <Avatar className="w-20 h-20 border-4 border-primary/20">
                      <AvatarImage src={coach.profilePicture} alt={coach.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-2">
                      <Badge className={`${getStatusColor(coach.status)} text-white text-xs`}>
                        {getStatusText(coach.status)}
                      </Badge>
                      <Badge className={`${getCategoryColor(coach.category)} text-white text-xs`}>
                        {getCategoryText(coach.category)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors mb-1">
                      {coach.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{coach.specialization}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">الرياضة:</span>
                      <span className="font-medium text-card-foreground">{coach.sport}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">العمر:</span>
                      <span className="font-medium text-card-foreground">{coach.age} سنة</span>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">الجنسية:</span>
                      <span className="font-medium text-card-foreground">{coach.nationality}</span>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Medal className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">الخبرة:</span>
                      <span className="font-medium text-card-foreground">{coach.experience}</span>
                    </div>
                  </div>

                  {coach.rating && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-muted-foreground text-sm">التقييم:</span>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < coach.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold mr-1">{coach.rating}/5</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Users className="w-4 h-4 ml-2" />
                      عرض الملف الشخصي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCoaches.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coaches;