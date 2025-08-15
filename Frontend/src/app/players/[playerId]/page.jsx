"use client";
import LoadingSpinner from "@/app/component/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import axios from "axios";
import {
  ArrowRight,
  ArrowRightLeft,
  Award,
  Banknote,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Play,
  Share2,
  Star,
  TrendingUp,
  Trophy,
  Video,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

  const getFirstVideoUrl = () => {
    // Based on player model structure, videos are stored in player.media.video
    const video = player?.media?.video;

    // Handle video object directly
    if (video && video.url) return video.url;

    // Fallback to legacy structure if needed
    const vids = player?.media?.videos;
    if (Array.isArray(vids) && vids.length > 0) return vids[0]?.url || null;
    if (vids && typeof vids === "object" && !Array.isArray(vids))
      return vids.url || null;

    return null;
  };

  const getFirstDocument = () => {
    // Based on player model structure, documents are stored in player.media.document
    const doc = player?.media?.document;

    // Handle document object directly
    if (doc && doc.url) return doc;

    // Fallback to legacy structure if needed
    const docs = player?.media?.documents;
    if (Array.isArray(docs) && docs.length > 0) return docs[0] || null;
    if (docs && typeof docs === "object" && !Array.isArray(docs)) return docs;

    return null;
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    const phoneNumber = player?.user?.phone;
    if (phoneNumber) {
      const formattedNumber = phoneNumber.replace(/^0/, "");
      window.open(`https://wa.me/${formattedNumber}`, "_blank");
    } else {
      toast.error("لا يوجد رقم هاتف متاح لهذا اللاعب");
    }
  };

  const handleRequestPhone = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    const phone = player?.user?.phone;
    if (phone) {
      navigator.clipboard
        .writeText(phone)
        .then(() => {
          toast.success("تم نسخ رقم الهاتف");
        })
        .catch(() => {
          toast.error("فشل في نسخ رقم الهاتف");
        });
    } else {
      toast.error("رقم الهاتف غير متاح حالياً");
    }
  };

  const handleSendEmail = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    const email = player?.user?.email;
    if (email) {
      window.open(`mailto:${email}`, "_blank");
      toast.success("تم ارسال البريد الإلكتروني");
    } else {
      toast.error("البريد الإلكتروني غير متاح");
    }
  };

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

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setError("معرف اللاعب غير متوفر");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/${playerId}`);
        setPlayer(response.data.data);
      } catch (err) {
        setError("فشل في جلب بيانات اللاعب. حاول مرة أخرى لاحقًا.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
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
    );
  }

  const VideoPopup = ({ videoUrl, onClose }) => {
    const popupRef = useRef();

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">فيديو اللاعب</h2>
                  <p className="text-sm text-gray-300">
                    مشاهدة الأداء والمهارات
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative bg-black aspect-video">
              <video controls className="w-full h-full">
                <source src={videoUrl} type="video/mp4" />
                <p className="text-white text-center p-4">
                  عذراً، متصفحك لا يدعم تشغيل الفيديو.
                  <a
                    href={videoUrl}
                    download
                    className="text-blue-400 underline mr-2"
                  >
                    حمل الفيديو
                  </a>
                </p>
              </video>
            </div>

            {/* Footer with controls */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Volume2 className="w-4 h-4" />
                  <span>تأكد من تشغيل الصوت للحصول على أفضل تجربة</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        popupRef.current?.requestFullscreen();
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    aria-label="ملء الشاشة"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleWatchVideo = () => {
    const url = getFirstVideoUrl();
    console.log("Video URL:", url);
    console.log("Player media:", player?.media);

    if (!url) {
      toast.error("لا يوجد فيديو متاح لهذا اللاعب");
      return;
    }
    setCurrentVideoUrl(url);
    setIsVideoPopupOpen(true);
  };

  const handleDownloadFile = () => {
    const doc = getFirstDocument();
    console.log("Document:", doc);

    const fileUrl = doc?.url;
    console.log("Document URL:", fileUrl);

    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;

      // Extract original filename and extension
      let filename = doc?.title || "";
      let extension = "";

      // Try to get extension from title if available
      if (filename) {
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          extension = filename.substring(lastDotIndex);
        }
      }

      // If no extension found, try to determine from file type or URL
      if (!extension) {
        if (doc?.type === "application/pdf") {
          extension = ".pdf";
        } else if (doc?.type === "application/msword") {
          extension = ".doc";
        } else if (
          doc?.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          extension = ".docx";
        } else if (fileUrl.includes(".pdf")) {
          extension = ".pdf";
        } else if (fileUrl.includes(".doc")) {
          extension = ".doc";
        } else if (fileUrl.includes(".docx")) {
          extension = ".docx";
        }
      }

      // Set final filename with extension
      const defaultName =
        filename && !filename.includes(".")
          ? `${filename}${extension}`
          : filename || `player-file${extension}`;

      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("لا يوجد ملف لتحميله.");
    }
  };

  const closeVideoPopup = () => {
    setIsVideoPopupOpen(false);
    setCurrentVideoUrl(null);
  };

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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
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
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
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
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {player.name}
                    </h1>
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge
                        className={`${getStatusColor(
                          player.status
                        )} text-white`}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">العمر:</span>
                        <span className="font-medium">{player.age} سنة</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">الجنسية:</span>
                        <span className="font-medium">
                          {player.nationality}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">الرياضة:</span>
                        <span className="font-medium">{player.game}</span>
                      </div>
                      {player.position && (
                        <div className="flex items-center space-x-2">
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
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>المعلومات المالية والانتقالات</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {player.monthlySalary && (
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700 font-medium">
                        الراتب الشهري
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">
                      {player.monthlySalary.currency}{" "}
                      {player.monthlySalary.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {player.yearSalary && (
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700 font-medium">
                        قيمة العقد السنوي
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">
                      {player.yearSalary.currency}{" "}
                      {player.yearSalary.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {player.transferredTo && player.transferredTo.club && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                        تفاصيل الانتقال
                      </h4>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">
                          النادي المنتقل إليه
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {player.transferredTo.club}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">
                          تاريخ الانتقال
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {new Date(player.transferredTo.date).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">
                          مبلغ الانتقال
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-800">
                        {player.transferredTo.amount.toLocaleString()} $
                      </span>
                    </div>
                  </>
                )}
                {player.contractEndDate && (
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700 font-medium">
                        موعد انتهاء العقد
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {new Date(player.contractEndDate).toLocaleDateString(
                        "ar-EG",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Information */}
            {player.contractEndDate && (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>تفاصيل العقد</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      موعد انتهاء العقد:{" "}
                      {new Date(player.contractEndDate).toLocaleDateString(
                        "ar-EG",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
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
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle>تواصل مع اللاعب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleSendMessage}
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  إرسال رسالة
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRequestPhone}
                >
                  <Phone className="w-4 h-4 ml-2" />
                  طلب رقم الهاتف
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
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
                  className="w-full"
                  onClick={handleWatchVideo}
                >
                  <Video className="w-4 h-4 ml-2" />
                  فديو اللاعب
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadFile}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الملف (أول مستند)
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShareProfile}
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة الملف
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
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

      {/* Video Popup */}
      {isVideoPopupOpen && (
        <VideoPopup videoUrl={currentVideoUrl} onClose={closeVideoPopup} />
      )}
    </div>
  );
};

export default PlayerProfile;
