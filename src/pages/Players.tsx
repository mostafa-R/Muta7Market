import { useState } from 'react';
import Navbar from '@/components/Navbar';
import PlayerCard from '@/components/PlayerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockPlayers } from '@/data/mockPlayers';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Users, 
  Trophy, 
  Star,
  UserPlus,
  SlidersHorizontal 
} from 'lucide-react';

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [nationalityFilter, setNationalityFilter] = useState('all');

  // Get unique values for filters
  const uniqueSports = [...new Set(mockPlayers.map(player => player.sport))];
  const uniqueNationalities = [...new Set(mockPlayers.map(player => player.nationality))];

  // Filter players
  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || player.sport === sportFilter;
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || player.category === categoryFilter;
    const matchesNationality = nationalityFilter === 'all' || player.nationality === nationalityFilter;
    
    return matchesSearch && matchesSport && matchesStatus && matchesCategory && matchesNationality;
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSportFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setNationalityFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            جميع اللاعبين
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            اكتشف مواهب رياضية متنوعة من جميع أنحاء العالم العربي
          </p>
          
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <Badge variant="secondary" className="flex items-center space-x-2 space-x-reverse">
              <Users className="w-4 h-4" />
              <span>{mockPlayers.length} لاعب مسجل</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 space-x-reverse">
              <Trophy className="w-4 h-4" />
              <span>{uniqueSports.length} رياضة</span>
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-6">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">فلترة وبحث</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث باسم اللاعب، الجنسية أو الرياضة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>

            {/* Sport Filter */}
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الرياضة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الرياضات</SelectItem>
                {uniqueSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
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
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="Elite">نخبة</SelectItem>
                <SelectItem value="Professional">محترف</SelectItem>
                <SelectItem value="Amateur">هاوي</SelectItem>
              </SelectContent>
            </Select>

            {/* Nationality Filter */}
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الجنسية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الجنسيات</SelectItem>
                {uniqueNationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={clearAllFilters}>
              <Filter className="w-4 h-4 ml-2" />
              مسح جميع الفلاتر
            </Button>
            
            <Link to="/register-profile">
              <Button variant="default" size="sm">
                <UserPlus className="w-4 h-4 ml-2" />
                سجل كلاعب
              </Button>
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            عرض {filteredPlayers.length} من أصل {mockPlayers.length} لاعب
          </p>
          {filteredPlayers.length !== mockPlayers.length && (
            <Badge variant="secondary">
              تم تطبيق فلاتر
            </Badge>
          )}
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
              جرب تغيير معايير البحث أو الفلاتر للعثور على لاعبين
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              <Filter className="w-4 h-4 ml-2" />
              مسح جميع الفلاتر
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            هل أنت لاعب موهوب؟
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            انضم إلى مجتمعنا المتنامي من اللاعبين والمدربين المحترفين
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

export default Players;