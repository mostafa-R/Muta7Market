import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import PlayerCard from '@/components/PlayerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getPlayersBySport } from '@/data/mockPlayers';
import { ArrowRight, Search, Filter, Users, Trophy, Star } from 'lucide-react';

const SportDetail = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const players = sportId ? getPlayersBySport(sportId) : [];

  const sportNames: { [key: string]: string } = {
    'football': 'كرة القدم',
    'basketball': 'كرة السلة',
    'tennis': 'التنس',
    'swimming': 'السباحة',
    'athletics': 'ألعاب القوى',
    'cycling': 'ركوب الدراجات',
    'weightlifting': 'رفع الأثقال',
    'volleyball': 'الكرة الطائرة'
  };

  const sportName = sportId ? sportNames[sportId] : '';

  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || player.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Free Agent': return 'حر';
      case 'Contracted': return 'متعاقد';
      case 'Transferred': return 'منتقل';
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

  if (!sportId || !sportName) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">الرياضة غير موجودة</h1>
            <Link to="/sports">
              <Button variant="default">
                <ArrowRight className="w-4 h-4 mr-2" />
                العودة للرياضات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6">
          <Link to="/sports" className="hover:text-primary transition-colors">
            الرياضات
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{sportName}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            لاعبو {sportName}
          </h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Badge variant="secondary" className="flex items-center space-x-2 space-x-reverse">
              <Users className="w-4 h-4" />
              <span>{players.length} لاعب مسجل</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 space-x-reverse">
              <Trophy className="w-4 h-4" />
              <span>{sportName}</span>
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">فلترة النتائج</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث باسم اللاعب أو الجنسية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة اللاعب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="Free Agent">حر</SelectItem>
                <SelectItem value="Contracted">متعاقد</SelectItem>
                <SelectItem value="Transferred">منتقل</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="فئة اللاعب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="Elite">نخبة</SelectItem>
                <SelectItem value="Professional">محترف</SelectItem>
                <SelectItem value="Amateur">هاوي</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            عرض {filteredPlayers.length} من أصل {players.length} لاعب
          </p>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              لم يتم العثور على لاعبين
            </h3>
            <p className="text-muted-foreground mb-6">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              مسح جميع الفلاتر
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            هل أنت لاعب {sportName}؟
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            انضم إلى مجتمعنا وأعرض مهاراتك للعالم
          </p>
          <Link to="/register-profile">
            <Button variant="default" size="lg">
              <Star className="w-5 h-5 ml-2" />
              سجل بياناتك الآن
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SportDetail;