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
import PaymentBtn from "@/app/register-profile/components/PaymentBtn";
import DynamicSocialMeta from "@/components/SEO/DynamicSocialMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import {
  ArrowRight,
  ArrowRightLeft,
  Award,
  Building,
  DollarSign,
  Download,
  Image as ImageIcon,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Play,
  Share2,
  Star,
  Trophy,
  Video,
  Volume2,
  X,
  ZoomIn,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  translateNationality,
  translateSport,
} from "../../../utils/translationFallback";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`;

const getSportText = (sport, t) => {
  return translateSport(t, sport);
};

const getNationalityText = (nationality, t) => {
  return translateNationality(t, nationality);
};

const getPositionText = (position, sport, t) => {
  if (!position) return null;

  const sportKey = sport?.toLowerCase();
  const positionKey = position.toLowerCase().replace(/\s+/g, "");

  
  const fullKey = `positions.${sportKey}.${positionKey}`;
  let translatedPosition = t(fullKey);

  if (translatedPosition === fullKey) {
    const generalKey = `positions.${positionKey}`;
    translatedPosition = t(generalKey);

    if (translatedPosition === generalKey) {
      return formatPositionText(position);
    }
  }

  return translatedPosition;
};

const formatPositionText = (text) => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase()) 
    .trim();
};

const PlayerProfile = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const params = useParams();
  const playerId = Array.isArray(params?.playerId)
    ? params?.playerId[0]
    : (params?.playerId || "").toString();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [isUserActive, setIsUserActive] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sportText = useMemo(
    () => player && getSportText(player.game, t),
    [player?.game, t]
  );
  const nationalityText = useMemo(
    () => player && getNationalityText(player.nationality, t),
    [player?.nationality, t]
  );
  const positionText = useMemo(
    () => player && getPositionText(player.position, player.game, t),
    [player?.position, player?.game, t]
  );

  const getFirstVideoUrl = () => {
    const video = player?.media?.video;

    if (video && video.url) return video.url;

    const vids = player?.media?.videos;
    if (Array.isArray(vids) && vids.length > 0) return vids[0]?.url || null;
    if (vids && typeof vids === "object" && !Array.isArray(vids))
      return vids.url || null;

    return null;
  };

  const getFirstDocument = () => {
    const doc = player?.media?.document;

    if (doc && doc.url) return doc;

    const docs = player?.media?.documents;
    if (Array.isArray(docs) && docs.length > 0) return docs[0] || null;
    if (docs && typeof docs === "object" && !Array.isArray(docs)) return docs;

    return null;
  };

  const getPlayerImages = () => {
    const images = player?.media?.images || [];
    const profileImage = player?.media?.profileImage;

    let allImages = [];

    if (profileImage && profileImage.url) {
      allImages.push({
        url: profileImage.url,
        type: "profile",
        alt: `${player.name} - Profile Photo`,
      });
    }

    if (Array.isArray(images)) {
      images.forEach((img, index) => {
        if (img && img.url) {
          allImages.push({
            url: img.url,
            type: "sports",
            alt: `${player.name} - Sports Photo ${index + 1}`,
          });
        }
      });
    }

    return allImages;
  };

  const handleSendMessage = async () => {
    if (!isUserActive) {
      toast.error(t("playerDetail.availableForPaidUsers"));
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(t("playerDetail.loginRequired"));
      return;
    }

    const phoneNumber = player?.contactInfo?.phone;
    if (phoneNumber) {
      const formattedNumber = phoneNumber.replace(/^0/, "");
      window.open(`https://wa.me/${formattedNumber}`, "_blank");
    } else {
      toast.error(t("playerDetail.noPhoneAvailable"));
    }
  };

  const handleRequestPhone = () => {
    if (!isUserActive) {
      toast.error(t("playerDetail.availableForPaidUsers"));
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(t("playerDetail.loginRequired"));
      return;
    }

    const phone = player?.contactInfo?.phone;
    if (phone) {
      navigator.clipboard
        .writeText(phone)
        .then(() => {
          toast.success(t("playerDetail.phoneCopied"));
        })
        .catch(() => {
          toast.error(t("playerDetail.failedToCopyPhone"));
        });
    } else {
      toast.error(t("playerDetail.phoneNotAvailable"));
    }
  };

  const handleSendEmail = () => {
    if (!isUserActive) {
      toast.error(t("playerDetail.availableForPaidUsers"));
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(t("playerDetail.loginRequired"));
      return;
    }
    const email = player?.contactInfo?.email;
    if (email) {
      window.open(`mailto:${email}`, "_blank");
      toast.success(t("playerDetail.emailSent"));
    } else {
      toast.error(t("playerDetail.emailNotAvailable"));
    }
  };

  const handleShareProfile = async () => {
    const shareUrl = window.location.href;
    const shareText = t("playerDetail.checkProfile", { name: player.name });

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("playerDetail.profileOf", { name: player.name }),
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(t("playerDetail.profileLinkCopied"));
      });
    }
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setError(t("playerDetail.playerIdNotAvailable"));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/${playerId}`);
        setPlayer(response.data.data);
      } catch (err) {
        setError(t("playerDetail.failedToFetchPlayer"));
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId, t]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsUserActive(false);
        return;
      }
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      fetch(`${base}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((j) => {
          const active = Boolean(j?.user?.isActive);
          setIsUserActive(active);
        })
        .catch(() => setIsUserActive(false));
    } catch {
      setIsUserActive(false);
    }
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !player) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {error || t("playerDetail.playerNotFound")}
          </h1>
          <Link href="/players">
            <Button variant="default">
              <ArrowRight className="w-4 h-4 ml-2" />
              {t("playerDetail.backToPlayers")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const VideoPopup = ({ videoUrl, onClose }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();
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
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {t("playerDetail.playerVideo")}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {t("playerDetail.watchPerformanceAndSkills")}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label={t("common.closeMenu")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative bg-black aspect-video">
              <video controls className="w-full h-full">
                <source src={videoUrl} type="video/mp4" />
                <p className="text-white text-center p-4">
                  {t("playerDetail.browserDoesNotSupportVideo")}
                  <a
                    href={videoUrl}
                    download
                    className="text-blue-400 underline mr-2"
                  >
                    {t("playerDetail.downloadVideo")}
                  </a>
                </p>
              </video>
            </div>

            {/* Footer with controls */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Volume2 className="w-4 h-4" />
                  <span>{t("playerDetail.ensureSoundOn")}</span>
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
                    aria-label={t("playerDetail.fullscreen")}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Image Modal Component
  const ImageModal = ({
    imageUrl,
    onClose,
    onNext,
    onPrev,
    currentIndex,
    totalImages,
  }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const modalRef = useRef();

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      const handleKeyPress = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") onPrev();
        if (e.key === "ArrowRight") onNext();
      };
      document.addEventListener("keydown", handleKeyPress);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyPress);
      };
    }, [onClose, onNext, onPrev]);

    return (
      <>
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={onClose}
        />

        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {t("playerDetail.playerImages")}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {currentIndex + 1} {t("common.of")} {totalImages}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label={t("common.close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`${player?.name} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />

              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200"
                    aria-label={t("common.previous")}
                  >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200"
                    aria-label={t("common.next")}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ZoomIn className="w-4 h-4" />
                  <span>{t("playerDetail.clickToZoom")}</span>
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleWatchVideo = () => {
    if (!isUserActive) {
      toast.info(t("playerDetail.activateToWatchVideos"));
      return;
    }

    const url = getFirstVideoUrl();

    if (!url) {
      toast.error(t("playerDetail.noVideoAvailable"));
      return;
    }
    setCurrentVideoUrl(url);
    setIsVideoPopupOpen(true);
  };

  const handleDownloadFile = () => {
    if (!isUserActive) {
      toast.info(t("playerDetail.activateToDownloadFiles"));
      return;
    }

    const doc = getFirstDocument();

    const fileUrl = doc?.url;

    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;

      let filename = doc?.title || "";
      let extension = "";

      if (filename) {
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          extension = filename.substring(lastDotIndex);
        }
      }

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

      const defaultName =
        filename && !filename.includes(".")
          ? `${filename}${extension}`
          : filename || `player-file${extension}`;

      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error(t("playerDetail.noFileToDownload"));
    }
  };

  const closeVideoPopup = () => {
    setIsVideoPopupOpen(false);
    setCurrentVideoUrl(null);
  };

  const handleImageClick = (imageUrl, index) => {
    setCurrentImageUrl(imageUrl);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageUrl(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const images = getPlayerImages();
    if (!images.length) return;

    let newIndex;
    if (direction === "next") {
      newIndex =
        currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    } else {
      newIndex =
        currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    }

    setCurrentImageIndex(newIndex);
    setCurrentImageUrl(images[newIndex].url);
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
    <div
      className="min-h-screen bg-gray-100"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Dynamic Social Media Meta Tags for Enhanced Sharing */}
      <DynamicSocialMeta
        title={`${player.name} - ${
          player.jop === "coach" ? "مدرب" : "لاعب"
        } ${getSportText(player.game, t)} | ${
          player.jop === "coach" ? "Coach" : "Player"
        } Profile`}
        description={
          player.jop === "coach"
            ? `Professional ${player.game} coach from ${player.nationality}. View coaching profile and connect directly.`
            : `${player.category || ""} ${player.game} player from ${
                player.nationality
              }${
                player.age ? `, age ${player.age}` : ""
              }. View full profile with videos and stats.`
        }
        image={player.media?.profileImage?.url}
        type="profile"
        playerData={{
          name: player.name,
          sport: player.game || "Sports",
          nationality: player.nationality || "International",
          age: player.age,
          category: player.category,
          status: player.status,
          isCoach: player.jop === "coach",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/players"
            className="hover:text-primary transition-colors"
          >
            {t("players.allPlayers")}
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{player.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Profile Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <Avatar className="w-40 h-40 border-4 border-white shadow-xl">
                      <AvatarImage
                        src={player.media?.profileImage?.url}
                        alt={player.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                          {player.name}
                        </h1>
                        {player.isPromoted?.status && (
                          <div className="flex items-center gap-2 bg-[#cd9834] text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                            <Trophy className="w-4 h-4" />
                            <span>{t("player.promoted")}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Badge
                          className={`${getStatusColor(
                            player.status
                          )} text-white px-4 py-2 text-sm font-medium`}
                        >
                          {player.status === "available"
                            ? t("player.status.freeAgent")
                            : player.status === "contracted"
                            ? t("player.status.contracted")
                            : t("player.status.transferred")}
                        </Badge>
                        <Badge
                          className={`${getCategoryColor(
                            player.category || player.jop
                          )} text-white px-4 py-2 text-sm font-medium`}
                        >
                          {player.category === "Elite"
                            ? t("players.category.elite")
                            : player.category === "Professional"
                            ? t("players.category.professional")
                            : player.category === "Amateur"
                            ? t("players.category.amateur")
                            : player.jop === "player"
                            ? t("common.player")
                            : player.jop === "coach"
                            ? t("common.coach")
                            : t("common.player")}
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          {player.age}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("player.years")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          {player.experience !== undefined &&
                          player.experience !== null
                            ? player.experience
                            : "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("playerDetail.yearsOfExperience")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          {player.views?.toLocaleString(
                            language === "ar" ? "ar-EG" : "en-US"
                          ) || "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("playerDetail.views")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div
                          className={`text-2xl font-bold ${
                            player.isActive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {player.isActive
                            ? t("profile.active")
                            : t("profile.inactive")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("profile.accountStatus")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Player Details */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>
                    {player.jop === "coach"
                      ? t("playerDetail.coachInformation")
                      : t("playerDetail.playerInformation")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("playerDetail.nationality")}
                      </div>
                      <div className="font-medium">{nationalityText}</div>
                    </div>
                  </div>
                  {player.birthCountry && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-gray-500">
                          {t("playerDetail.birthCountry")}
                        </div>
                        <div className="font-medium">
                          {getNationalityText(player.birthCountry, t)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("player.sport")}
                      </div>
                      <div className="font-medium">{sportText}</div>
                    </div>
                  </div>
                  {positionText && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-gray-500">
                          {t("player.position")}
                        </div>
                        <div className="font-medium">{positionText}</div>
                      </div>
                    </div>
                  )}
                  {player.roleType && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-gray-500">
                          {t("playerDetail.roleType")}
                        </div>
                        <div className="font-medium">
                          {player.jop === "player"
                            ? t(`playerRoles.${player.roleType}`, {
                                defaultValue: player.roleType,
                              })
                            : t(`coachRoles.${player.roleType}`, {
                                defaultValue: player.roleType,
                              })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>{t("playerDetail.mediaGallery")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isUserActive && (
                  <>
                    <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-sm">
                      {player.jop === "coach"
                        ? t("playerDetail.activateToViewGalleryForCoaches")
                        : t("playerDetail.activateToViewGallery")}
                    </div>
                    <div className="pt-2">
                      <PaymentBtn type="unlock_contacts" />
                    </div>
                  </>
                )}
                {isUserActive &&
                  (() => {
                    const images = getPlayerImages();

                    if (images.length === 0) {
                      return (
                        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm">
                            {t("playerDetail.noImagesAvailable")}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                            onClick={() => handleImageClick(image.url, index)}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white/90 rounded-full p-2">
                                  <ZoomIn className="w-5 h-5 text-gray-800" />
                                </div>
                              </div>
                            </div>

                            {/* Image Type Badge */}
                            {image.type === "profile" && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  {t("playerDetail.profilePhoto")}
                                </span>
                              </div>
                            )}

                            {/* Image Number */}
                            <div className="absolute bottom-2 right-2">
                              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-primary" />
                  <span>{t("playerDetail.quickActions")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Button
                    variant="default"
                    className={`w-full bg-red-600 hover:bg-red-700 text-white ${
                      !isUserActive ? "opacity-60" : ""
                    }`}
                    onClick={handleWatchVideo}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {t("playerDetail.playerVideo")}
                  </Button>
                  {!isUserActive && (
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        💎
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShareProfile}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("playerDetail.shareProfile")}
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    className={`w-full ${!isUserActive ? "opacity-60" : ""}`}
                    onClick={handleDownloadFile}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("playerDetail.downloadFile")}
                  </Button>
                  {!isUserActive && (
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        💎
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Communication */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>{t("playerDetail.contactCommunication")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isUserActive && (
                  <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-sm">
                    {t("playerDetail.activateToViewContacts")}
                  </div>
                )}
                {!isUserActive && (
                  <div className="pt-2">
                    <PaymentBtn type="unlock_contacts" />
                  </div>
                )}
                <div className="relative">
                  <Button
                    variant="default"
                    className={`w-full ${!isUserActive ? "opacity-60" : ""}`}
                    onClick={handleSendMessage}
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    {t("playerDetail.sendMessage")}
                  </Button>
                  {!isUserActive && (
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        💎
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    className={`w-full ${!isUserActive ? "opacity-60" : ""}`}
                    onClick={handleRequestPhone}
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    {t("playerDetail.requestPhone")}
                  </Button>
                  {!isUserActive && (
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        💎
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    className={`w-full ${!isUserActive ? "opacity-60" : ""}`}
                    onClick={handleSendEmail}
                  >
                    <Mail className="w-4 h-4 ml-2" />
                    {t("playerDetail.sendEmail")}
                  </Button>
                  {!isUserActive && (
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        💎
                      </span>
                    </div>
                  )}
                </div>
                {isUserActive &&
                  (player?.contactInfo?.phone ||
                    player?.contactInfo?.email) && (
                    <div className="pt-2 text-sm text-gray-600">
                      {player?.contactInfo?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">
                            {player.contactInfo.phone}
                          </span>
                        </div>
                      )}
                      {player?.contactInfo?.email && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="font-medium">
                            {player.contactInfo.email}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {/* Social Links Section */}
                {isUserActive &&
                  (player.socialLinks?.instagram ||
                    player.socialLinks?.twitter ||
                    player.socialLinks?.whatsapp ||
                    player.socialLinks?.youtube) && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        {t("playerDetail.socialLinks")}
                      </h4>
                      <div className="space-y-2">
                        {player.socialLinks?.instagram && (
                          <a
                            href={player.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 hover:border-pink-300 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  IG
                                </span>
                              </div>
                              <span className="text-gray-700">Instagram</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                          </a>
                        )}
                        {player.socialLinks?.twitter && (
                          <a
                            href={player.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  X
                                </span>
                              </div>
                              <span className="text-gray-700">X (Twitter)</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                          </a>
                        )}
                        {player.socialLinks?.whatsapp && (
                          <a
                            href={`https://wa.me/${player.socialLinks.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-gray-700">WhatsApp</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                          </a>
                        )}
                        {player.socialLinks?.youtube && (
                          <a
                            href={player.socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <Video className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-gray-700">YouTube</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-0 shadow-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-primary" />
                  <span>{t("playerDetail.professionalInfo")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isUserActive && (
                  <>
                    <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-sm">
                      {t("playerDetail.activateToViewFinancials")}
                    </div>
                    <div className="pt-2">
                      <PaymentBtn type="unlock_contacts" />
                    </div>
                  </>
                )}
                {isUserActive && (
                  <div className="space-y-3">
                    {/* Financial Information */}
                    {(player.monthlySalary || player.yearSalary) && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          {t("playerDetail.financialInfo")}
                        </h4>
                        {player.monthlySalary && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {t("player.monthlySalary")}
                            </span>
                            <span className="font-medium">
                              {player.monthlySalary.amount.toLocaleString()}{" "}
                              {player.monthlySalary.currency}
                            </span>
                          </div>
                        )}
                        {player.yearSalary && (
                          <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-600">
                              {t("player.annualContract")}
                            </span>
                            <span className="font-medium">
                              {player.yearSalary.amount.toLocaleString()}{" "}
                              {player.yearSalary.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transfer Information */}
                    {player.transferredTo?.club && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4" />
                          {t("playerDetail.transferDetails")}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {t("playerDetail.transferredToClub")}
                            </span>
                            <span className="font-medium">
                              {player.transferredTo.club}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {t("playerDetail.transferAmount")}
                            </span>
                            <span className="font-medium">
                              {player.transferredTo.amount.toLocaleString()}{" "}
                              {t("common.sar")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Agent Information */}
                    {player.contactInfo?.agent && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {t("playerDetail.agentInformation")}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {t("playerDetail.agentName")}
                            </span>
                            <span className="font-medium">
                              {player.contactInfo.agent.name}
                            </span>
                          </div>
                          {player.contactInfo.agent.phone && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                {t("playerDetail.agentPhone")}
                              </span>
                              <span className="font-medium">
                                {player.contactInfo.agent.phone}
                              </span>
                            </div>
                          )}
                          {player.contactInfo.agent.email && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                {t("playerDetail.agentEmail")}
                              </span>
                              <span className="font-medium text-xs">
                                {player.contactInfo.agent.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Popup */}
      {isVideoPopupOpen && (
        <VideoPopup videoUrl={currentVideoUrl} onClose={closeVideoPopup} />
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          imageUrl={currentImageUrl}
          onClose={closeImageModal}
          onNext={() => navigateImage("next")}
          onPrev={() => navigateImage("prev")}
          currentIndex={currentImageIndex}
          totalImages={getPlayerImages().length}
        />
      )}
    </div>
  );
};

export default PlayerProfile;
