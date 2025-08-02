import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getPlayerById } from '@/data/mockPlayers';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Trophy, 
  Star, 
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Heart,
  User,
  Award,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const player = playerId ? getPlayerById(playerId) : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data for videos and images
  const playerVideos = [
    { id: 1, title: 'أفضل اللحظات 2024', thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop', duration: '3:45' },
    { id: 2, title: 'مهارات فردية', thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop', duration: '2:30' },
    { id: 3, title: 'تدريبات خاصة', thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop', duration: '5:20' },
  ];

  const playerImages = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
  ];

  if (!player) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">اللاعب غير موجود</h1>
            <Link to="/players">
              <Button variant="hero">
                <ArrowRight className="w-4 h-4 mr-2" />
                العودة للاعبين
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Free Agent': return 'bg-green-500';
      case 'Contracted': return 'bg-blue-500';
      case 'Transferred': return 'bg-orange-500';
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6">
          <Link to="/players" className="hover:text-primary transition-colors">
            اللاعبين
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{player.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="gradient-card border-0 shadow-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 md:space-x-reverse">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={player.profilePicture} alt={player.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {player.name}
                      </h1>
                      <div className="flex items-center space-x-3 space-x-reverse mb-4">
                        <Badge className={`${getStatusColor(player.status)} text-white`}>
                          {getStatusText(player.status)}
                        </Badge>
                        <Badge className={`${getCategoryColor(player.category)} text-white`}>
                          {getCategoryText(player.category)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">العمر:</span>
                        <span className="font-medium">{player.age} سنة</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">الجنسية:</span>
                        <span className="font-medium">{player.nationality}</span>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">الرياضة:</span>
                        <span className="font-medium">{player.sport}</span>
                      </div>

                      {player.position && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">المركز:</span>
                          <span className="font-medium">{player.position}</span>
                        </div>
                      )}
                    </div>

                    {player.rating && (
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className="text-muted-foreground">التقييم:</span>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < player.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="font-semibold text-lg mr-2">{player.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            {(player.monthlySalary || player.annualContractValue) && (
              <Card className="gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span>المعلومات المالية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {player.monthlySalary && (
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                      <span className="text-muted-foreground">الراتب الشهري</span>
                      <span className="text-2xl font-bold text-primary">
                        ${player.monthlySalary.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {player.annualContractValue && (
                    <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                      <span className="text-muted-foreground">قيمة العقد السنوي</span>
                      <span className="text-2xl font-bold text-secondary">
                        ${player.annualContractValue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contract Information */}
            {(player.contractConditions || player.transferDeadline) && (
              <Card className="gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>تفاصيل العقد</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {player.contractConditions && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">شروط العقد</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {player.contractConditions}
                      </p>
                    </div>
                  )}
                  
                  {player.transferDeadline && (
                    <div className="flex items-center space-x-2 space-x-reverse text-orange-600 bg-orange-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">موعد انتهاء الانتقال: {player.transferDeadline}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Videos Section */}
            <Card className="gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Play className="w-5 h-5 text-primary" />
                  <span>مقاطع الفيديو</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {playerVideos.map((video) => (
                    <div key={video.id} className="relative group cursor-pointer rounded-lg overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-sm font-medium">{video.title}</p>
                        <p className="text-white/80 text-xs">{video.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images Gallery */}
            <Card className="gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>معرض الصور</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img 
                      src={playerImages[currentImageIndex]} 
                      alt={`صورة ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev === 0 ? playerImages.length - 1 : prev - 1)}
                      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {currentImageIndex + 1} من {playerImages.length}
                    </span>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev === playerImages.length - 1 ? 0 : prev + 1)}
                      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
                    {playerImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-primary shadow-md' 
                            : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`صورة مصغرة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            <Card className="gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>تواصل مع اللاعب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="hero" className="w-full">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  إرسال رسالة
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 ml-2" />
                  طلب رقم الهاتف
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال إيميل
                </Button>
              </CardContent>
            </Card>

            {/* Profile Actions */}
            <Card className="gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 ml-2" />
                  إضافة للمفضلة
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة الملف
                </Button>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 ml-2" />
                  متابعة اللاعب
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Award className="w-5 h-5 text-primary" />
                  <span>إحصائيات</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">سنوات الخبرة</span>
                  <span className="font-semibold">{player.experience || 'غير محدد'}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">عدد المتابعين</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">مرات المشاهدة</span>
                  <span className="font-semibold">15,678</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;