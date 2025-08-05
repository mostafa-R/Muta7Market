import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Calendar, MapPin, DollarSign, Clock, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Player {
  id: string;
  name: string;
  age: number;
  status: 'Free Agent' | 'Contracted' | 'Transferred';
  gender: 'Male' | 'Female';
  nationality: string;
  category: 'Amateur' | 'Professional' | 'Elite';
  monthlySalary?: number;
  annualContractValue?: number;
  contractConditions?: string;
  transferDeadline?: string;
  sport: string;
  position?: string;
  profilePicture?: string;
  rating?: number;
  experience?: number;
}

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'Free Agent': return 'bg-green-500';
      case 'Contracted': return 'bg-blue-500';
      case 'Transferred': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: Player['category']) => {
    switch (category) {
      case 'Elite': return 'bg-yellow-500';
      case 'Professional': return 'bg-purple-500';
      case 'Amateur': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Player['status']) => {
    switch (status) {
      case 'Free Agent': return 'حر';
      case 'Contracted': return 'متعاقد';
      case 'Transferred': return 'منتقل';
      default: return status;
    }
  };

  const getCategoryText = (category: Player['category']) => {
    switch (category) {
      case 'Elite': return 'نخبة';
      case 'Professional': return 'محترف';
      case 'Amateur': return 'هاوي';
      default: return category;
    }
  };

  return (
    <Card className="border-0 overflow-hidden group transition-smooth">
      <CardContent className="p-0">
        {/* Header with Avatar and Status */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start space-x-4 space-x-reverse">
            <Avatar className="w-16 h-16 border-4 border-white shadow-card">
              <AvatarImage src={player.profilePicture} alt={player.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-card-foreground truncate group-hover:text-primary transition-colors">
                    {player.name}
                  </h3>
                  <div className="flex items-center space-x-2 space-x-reverse mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{player.nationality}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Badge className={`${getStatusColor(player.status)} text-white text-xs px-2 py-1`}>
                    {getStatusText(player.status)}
                  </Badge>
                  <Badge className={`${getCategoryColor(player.category)} text-white text-xs px-2 py-1`}>
                    {getCategoryText(player.category)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="px-6 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">العمر:</span>
              <span className="font-medium">{player.age} سنة</span>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">الرياضة:</span>
              <span className="font-medium">{player.sport}</span>
            </div>
          </div>

          {player.position && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">المركز:</span>
              <span className="font-medium">{player.position}</span>
            </div>
          )}

          {player.rating && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < player.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{player.rating}/5</span>
            </div>
          )}

          {/* Financial Info */}
          {(player.monthlySalary || player.annualContractValue) && (
            <div className="bg-primary/5 rounded-lg p-3 space-y-2">
              {player.monthlySalary && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">الراتب الشهري:</span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${player.monthlySalary.toLocaleString()}
                  </span>
                </div>
              )}
              
              {player.annualContractValue && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">قيمة العقد السنوي:</span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${player.annualContractValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {player.transferDeadline && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-orange-600">
              <Clock className="w-4 h-4" />
              <span>موعد انتهاء الانتقال:</span>
              <span className="font-medium">{player.transferDeadline}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6">
          <Link to={`/player/${player.id}`}>
            <Button variant="outline" className="w-full group">
              <Eye className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
              عرض الملف الشخصي
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;