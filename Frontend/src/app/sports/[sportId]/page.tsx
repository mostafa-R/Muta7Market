"use client";
import PlayerCard from "@/app/component/PlayerCard";
import axios from "axios";
import { ArrowRight, Filter, Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CTA from "./CTA";

const sportNames: { [key: string]: string } = {
  football: "كرة القدم",
  handball: "كرة اليد",
  basketball: "كرة السلة",
  volleyball: "الكرة الطائرة",
  badminton: "الريشة الطائرة",
  athletics: "ألعاب القوى",
  tennis: "التنس",
  tabletennis: "كرة الطاولة",
  karate: "الكاراتيه",
  taekwondo: "التايكوندو",
  archery: "السهام",
  esports: "الرياضات الإلكترونية",
  swimming: "السباحة",
  judo: "الجودو",
  fencing: "المبارزة",
  cycling: "الدراجات الهوائية",
  squash: "الإسكواش",
  weightlifting: "رفع الأثقال",
  futsal: "كرة قدم الصالات",
  boxing: "الملاكمة",
  gymnastics: "الجمباز",
  billiards: "البلياردو والسنوكر",
  wrestling: "المصارعة",
};

const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "Free Agent", label: "حر" },
  { value: "Contracted", label: "متعاقد" },
  { value: "Transferred", label: "منتقل" },
];

const categoryOptions = [
  { value: "all", label: "جميع الفئات" },
  { value: "player", label: "لاعب" },
  { value: "coach", label: "مدرب" },
];

// واجهة Player (مطابقة لـ PlayerCard)
interface Player {
  id: string;
  name: string;
  age: number;
  status: "Free Agent" | "Contracted" | "Transferred";
  gender: "Male" | "Female";
  nationality: string;
  jop: "player" | "coach";
  category: string; // Added category field
  monthlySalary?: number;
  annualContractValue?: number;
  contractConditions?: string;
  transferDeadline?: string;
  sport: string;
  position?: string;
  profilePicture?: string;
  rating?: number;
  experience?: number;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
  };
  isPromoted?: {
    status: boolean;
    startDate?: string;
    endDate?: string;
    type?: "featured" | "premium";
  };
  transferredTo?: {
    club: string;
    date: string;
    amount: number;
  };
}

// واجهة لبيانات الـ API الخام
interface ApiPlayer {
  _id: string;
  user: string;
  name: string;
  age: number;
  gender: string;
  nationality: string;
  jop: string;
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
  contractEndDate?: string;
  game: string;
  views: number;
  isActive: boolean;
  media?: {
    profileImage?: {
      url: string;
      publicId?: string;
    };
    videos?: Array<{
      url: string;
      publicId: string;
      title: string;
      duration: number;
      uploadedAt: string;
    }>;
    documents?: Array<{
      url: string;
      publicId: string;
      title: string;
      type: string;
      uploadedAt: string;
    }>;
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
  };
  isPromoted?: {
    status: boolean;
    startDate?: string;
    endDate?: string;
    type?: "featured" | "premium";
  };
  contactInfo?: {
    isHidden: boolean;
    email?: string;
    phone?: string;
    agent?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  transferredTo?: {
    club: string;
    date: string;
    amount: number;
  };
}

// دالة لتحويل بيانات الـ API إلى واجهة Player
const transformApiDataToPlayer = (apiPlayer: ApiPlayer): Player => ({
  id: apiPlayer._id,
  name: apiPlayer.name,
  age: apiPlayer.age,
  status:
    apiPlayer.status === "available"
      ? "Free Agent"
      : apiPlayer.status === "transferred"
      ? "Transferred"
      : "Contracted",
  gender: apiPlayer.gender === "male" ? "Male" : "Female",
  nationality: apiPlayer.nationality,
  jop:
    apiPlayer.jop === "player" || apiPlayer.jop === "coach"
      ? apiPlayer.jop
      : "player", // Type-safe conversion
  category: apiPlayer.jop === "coach" ? "مدرب" : "لاعب", // Added category field
  monthlySalary: apiPlayer.monthlySalary?.amount,
  annualContractValue: apiPlayer.yearSalary?.amount,
  contractConditions: undefined, // Fixed syntax error
  transferDeadline: apiPlayer.contractEndDate,
  sport: apiPlayer.game,
  position: apiPlayer.position,
  profilePicture: apiPlayer.media?.profileImage?.url || undefined,
  rating: undefined,
  experience: apiPlayer.expreiance,
  socialLinks: apiPlayer.socialLinks,
  isPromoted: apiPlayer.isPromoted,
  transferredTo: apiPlayer.transferredTo,
});

// عنوان الـ API الأساسي
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SportDetailPage = () => {
  const params = useParams();
  const sportId = Array.isArray(params?.sportId)
    ? params?.sportId[0]
    : (params?.sportId as string);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sportName = sportId ? sportNames[sportId.toLowerCase()] : "";
  const apiSportName = sportName
    ? Object.keys(sportNames)
        .find((key) => sportNames[key] === sportName)
        ?.toLowerCase()
    : "";

  // جلب البيانات باستخدام Axios
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/players?game=${apiSportName}`
        );
        console.log("API Response"); // تسجيل استجابة الـ API الكاملة

        // التحقق من هيكلية الاستجابة
        if (!response.data?.data?.players) {
          console.error("Unexpected API response structure");
          throw new Error("هيكلية استجابة الـ API غير متوقعة");
        }

        // تحويل بيانات اللاعبين إلى تنسيق Player
        const fetchedPlayers: Player[] = response.data.data.players.map(
          transformApiDataToPlayer
        );

        setPlayers(fetchedPlayers);
        console.log("Fetched Players:", fetchedPlayers); // تسجيل اللاعبين بعد التحويل

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching players");
        setError(
          err.response?.data?.message ||
            "فشل في جلب بيانات اللاعبين. حاول مرة أخرى لاحقًا."
        );
        setLoading(false);
      }
    };

    if (apiSportName) {
      fetchPlayers();
    } else {
      setLoading(false);
      setError("الرياضة غير موجودة");
    }
  }, [apiSportName]);
  // تصفية اللاعبين
  const filteredPlayers = players.filter((player) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      player.name.toLowerCase().includes(search) ||
      player.nationality.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || player.jop === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
              جارٍ تحميل {sportName || "الرياضة"}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              جارٍ تحميل البيانات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ أو الرياضة غير موجودة
  if (error || !sportName) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
            {error || "الرياضة غير موجودة"}
          </h1>
          <Link href="/sports">
            <button className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-6 py-3 text-lg font-semibold hover:bg-[hsl(var(--primary)/0.95)] transition">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرياضات
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-[hsl(var(--muted-foreground))] mb-6">
          <Link
            href="/sports"
            className="hover:text-[hsl(var(--primary))] transition-colors"
          >
            الرياضات
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-[hsl(var(--foreground))] font-medium">
            {sportName}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            لاعبو {sportName}
          </h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="inline-flex items-center bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Users className="w-4 h-4 ml-2" />
              {players.length} لاعب مسجل
            </span>
            <span className="inline-flex items-center border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy className="w-4 h-4 ml-2" />
              {sportName}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[hsl(var(--card))] rounded-xl p-6 mb-8 border border-[hsl(var(--border))] shadow-card">
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <Filter className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold">فلترة النتائج</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث باسم اللاعب أو الجنسية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white text-right focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white text-right focus:outline-none"
            >
              {categoryOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Clear Filters */}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-4 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground)/0.06)] transition"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[hsl(var(--muted-foreground))]">
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
            <Search className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
              لم يتم العثور على لاعبين
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-6 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground)/0.06)] transition"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}

        <CTA sportName={sportName} />
      </div>
    </div>
  );
};

export default SportDetailPage;
