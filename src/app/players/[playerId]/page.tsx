"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Separator } from "@/app/component/ui/separator";
import axios from "axios";
import {
  ArrowRight,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// واجهة Player المستخدمة في المكون
interface Player {
  id: string;
  name: string;
  age: number;
  status: "Free Agent" | "Contracted" | "Transferred";
  gender: "Male" | "Female";
  nationality: string;
  category: "Amateur" | "Professional" | "Elite";
  monthlySalary?: number;
  yearSalary?: number;
  annualContractValue?: number;
  contractConditions?: string;
  transferDeadline?: string;
  sport: string;
  position?: string;
  profileImage?: string;
  rating?: number;
  experience?: number;
  views?: number;
}

// واجهة لبيانات الـ API الخام
interface ApiPlayer {
  _id: string;
  user: null | string;
  name: string;
  age: number;
  gender: string;
  nationality: string;
  category: string;
  position: string;
  status: string;
  expreiance: number;
  monthlySalary: {
    amount: number;
    currency: string;
  };
  yearSalary: {
    amount: number;
    currency: string;
  };
  game: string;
  views: number;
  isActive: boolean;
  contractEndDate?: string;
  media?: {
    profileImage?: {
      url: string;
      publicId: string;
    };
  };
}

// دالة لتحويل بيانات الـ API إلى واجهة Player
const transformApiDataToPlayer = (apiPlayer: ApiPlayer): Player => ({
  id: apiPlayer._id,
  name: apiPlayer.name,
  age: apiPlayer.age,
  status: apiPlayer.status === "available" ? "Free Agent" : "Contracted",
  gender: apiPlayer.gender === "male" ? "Male" : "Female",
  nationality: apiPlayer.nationality,
  category: apiPlayer.category === "player" ? "Professional" : "Elite",
  monthlySalary: apiPlayer.monthlySalary?.amount,
  annualContractValue: apiPlayer.yearSalary?.amount,
  contractConditions: undefined,
  transferDeadline: apiPlayer.contractEndDate,
  sport: apiPlayer.game,
  position: apiPlayer.position,
  profileImage: apiPlayer.media?.profileImage?.url || undefined,
  rating: undefined,
  experience: apiPlayer.expreiance,
});

// عنوان الـ API
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`;

const PlayerProfile = () => {
  const params = useParams();
  const playerId = Array.isArray(params?.playerId)
    ? params?.playerId[0]
    : (params?.playerId as string);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات اللاعب باستخدام Axios
  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setError("معرف اللاعب غير متوفر");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${playerId}`);
        const fetchedPlayer = transformApiDataToPlayer(response.data.data);
        setPlayer(fetchedPlayer);
        setLoading(false);
      } catch (err) {
        setError("فشل في جلب بيانات اللاعب. حاول مرة أخرى لاحقًا.");
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              جارٍ تحميل بيانات اللاعب...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ أو اللاعب غير موجود
  if (error || !player) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || "اللاعب غير موجود"}
            </h1>
            <Link href="/players">
              <Button variant="default">
                <ArrowRight className="w-4 h-4 ml-2" />
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
      case "Free Agent":
        return "bg-green-500";
      case "Contracted":
        return "bg-blue-500";
      case "Transferred":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Elite":
        return "bg-yellow-500";
      case "Professional":
        return "bg-purple-500";
      case "Amateur":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Free Agent":
        return "حر";
      case "Contracted":
        return "متعاقد";
      case "Transferred":
        return "منتقل";
      default:
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "Elite":
        return "نخبة";
      case "Professional":
        return "محترف";
      case "Amateur":
        return "هاوي";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6">
          <Link
            href="/players"
            className="hover:text-primary transition-colors"
          >
            اللاعبين
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{player.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border-0 shadow-card">
              <CardContent className="p-8 bg-white rounded-xl">
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 md:space-x-reverse">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg ml-3 mr-3">
                    <AvatarImage src={player.profileImage} alt={player.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {player.name}
                      </h1>
                      <div className="flex items-center space-x-3 space-x-reverse mb-4">
                        <Badge
                          className={`${getStatusColor(
                            player.status
                          )} text-white ml-2 mr-2`}
                        >
                          {getStatusText(player.status)}
                        </Badge>
                        <Badge
                          className={`${getCategoryColor(
                            player.category
                          )} text-white`}
                        >
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
                        <span className="font-medium">
                          {player.nationality}
                        </span>
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

                    {/* {player.rating && (
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className="text-muted-foreground">التقييم:</span>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <span className="font-semibold text-lg mr-2">
                            {player.rating}/5
                          </span>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            {(player.monthlySalary || player.annualContractValue) && (
              <Card className="border-0 shadow-card bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span>المعلومات المالية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {player.monthlySalary && (
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                      <span className="text-muted-foreground">
                        الراتب الشهري
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ${player.monthlySalary.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {player.annualContractValue !== null &&
                    player.annualContractValue !== undefined && (
                      <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                        <span className="text-muted-foreground">
                          قيمة العقد السنوي
                        </span>
                        <span className="text-2xl font-bold text-secondary">
                          {player.annualContractValue === 0
                            ? "غير محدد"
                            : player.annualContractValue.toLocaleString()}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Contract Information */}
            {(player.contractConditions || player.transferDeadline) && (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>تفاصيل العقد</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {player.contractConditions && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        شروط العقد
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {player.contractConditions}
                      </p>
                    </div>
                  )}
                  {player.transferDeadline && (
                    <div className="flex items-center space-x-2 space-x-reverse text-orange-600 bg-orange-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        موعد انتهاء الانتقال:{" "}
                        {new Date(player.transferDeadline).toLocaleDateString(
                          "ar-us",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle>تواصل مع اللاعب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" className="w-full">
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
            <Card className="border-0 shadow-card bg-white">
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
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Award className="w-5 h-5 text-primary" />
                  <span>إحصائيات</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">سنوات الخبرة</span>
                  <span className="font-semibold">
                    {player.experience || "غير محدد"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">عدد المتابعين</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">مرات المشاهدة</span>
                  <span className="font-semibold">
                    {player.views || "15,678"}
                  </span>
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
