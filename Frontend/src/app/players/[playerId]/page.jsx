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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`;

const PlayerProfile = () => {
  const params = useParams();
  const playerId = Array.isArray(params?.playerId)
    ? params?.playerId[0]
    : (params?.playerId || "").toString();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);



  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      // التأكد من وجود بيانات الاتصال والرقم
      const phoneNumber = player.user?.phone; // استخدام optional chaining
      if (phoneNumber) {
        // صيغة رقم الهاتف في واتساب (إزالة الصفر في البداية)
        const formattedNumber = phoneNumber.replace(/^0/, "");
        // فتح رابط واتساب
        window.open(`https://wa.me/${formattedNumber}`, "_blank");
      } else {
        toast.error("لا يوجد رقم هاتف متاح لهذا اللاعب");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء محاولة الاتصال باللاعب");
      console.error(error);
    }
  };

  // طلب رقم الهاتف
  const handleRequestPhone = () => {
    const phone = player.user?.phone; // استخدام optional chaining
    if (phone) {
      navigator.clipboard
        .writeText(phone)
        .then(() => {
          alert("تم نسخ رقم الهاتف: " + phone);
          toast.success(`تم نسخ رقم الهاتف: ${phone}`);
        })
        .catch(() => {
          toast.error("فشل في نسخ رقم الهاتف");
        });
    } else {
      toast.error("رقم الهاتف غير متاح حالياً");
    }
  };

  // إرسال بريد إلكتروني
  const handleSendEmail = () => {
    const email = player?.user?.email;
    console.log("Email:", email);

    if (email) {
      // فتح في نافذة جديدة لتجنب حظر المتصفح
      window.open(`mailto:${email}`, "_blank");
    } else {
      toast.error("البريد الإلكتروني غير متاح");
    }
  };


  // إضافة للمفضلة
  const handleAddToFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      // محاكاة API
      await fetch(`/api/players/${player._id}/favorite`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "تم الإزالة من المفضلة" : "تمت الإضافة للمفضلة"
      );
    } catch (error) {
      toast.error("حدث خطأ أثناء تعديل المفضلة");
    }
  };

  // مشاركة الملف الشخصي
  const handleShareProfile = async () => {
    const shareUrl = window.location.href;
    const shareText = `تحقق من ملف اللاعب ${player.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ملف ${player.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // تجاهل الإلغاء
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("تم نسخ رابط الملف الشخصي");
      });
    }
  };

  // متابعة اللاعب
  const handleFollowPlayer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      // محاكاة API
      await fetch(`/api/players/${player._id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "تم إلغاء المتابعة" : "تمت متابعة اللاعب");
    } catch (error) {
      toast.error("حدث خطأ أثناء تعديل المتابعة");
    }
  };

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
        const fetchedPlayer = response.data.data; // استخدم البيانات مباشرة
        setPlayer(fetchedPlayer);
        setLoading(false);
      } catch (err) {
        setError("فشل في جلب بيانات اللاعب. حاول مرة أخرى لاحقًا.");
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "contracted":
        return "bg-blue-500";
      case "transferred":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category) => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-card">
              <CardContent className="p-8 bg-white rounded-xl">
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 md:space-x-reverse">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg ml-3 mr-3">
                    <AvatarImage
                      src={player.media?.profileImage?.url}
                      alt={player.name}
                    />
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
                          {player.status === "available"
                            ? "حر"
                            : player.status === "contracted"
                            ? "متعاقد"
                            : "منتقل"}
                        </Badge>
                        <Badge
                          className={`${getCategoryColor(
                            player.category
                          )} text-white`}
                        >
                          {player.category === "player" ? "محترف" : "نخبة"}
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
                        <span className="font-medium">{player.game}</span>
                      </div>
                      {player.position && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">المركز:</span>
                          <span className="font-medium">{player.position}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            {(player.monthlySalary || player.yearSalary) && (
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
                        ${player.monthlySalary.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {player.yearSalary && (
                    <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                      <span className="text-muted-foreground">
                        قيمة العقد السنوي
                      </span>
                      <span className="text-2xl font-bold text-secondary">
                        ${player.yearSalary.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contract Information */}
            {player.contractEndDate && (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>تفاصيل العقد</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 space-x-reverse text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      موعد انتهاء العقد:{" "}
                      {new Date(player.contractEndDate).toLocaleDateString(
                        "ar-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            {/* Contact Actions */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle>تواصل مع اللاعب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="default"
                  className="w-full cursor-pointer"
                  onClick={handleSendMessage}
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  إرسال رسالة
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleRequestPhone}
                >
                  <Phone className="w-4 h-4 ml-2" />
                  طلب رقم الهاتف
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleSendEmail}
                >
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
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleAddToFavorites}
                >
                  <Heart className="w-4 h-4 ml-2" />
                  إضافة للمفضلة
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleShareProfile}
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة الملف
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleFollowPlayer}
                >
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
                    {player.expreiance || "غير محدد"}
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
