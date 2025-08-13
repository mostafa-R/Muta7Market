"use client";
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// دالة للحصول على لون الحالة
const getStatusColor = (status) => {
  switch (status) {
    case "Free Agent":
      return "bg-gray-500";
    case "Contracted":
      return "bg-blue-500";
    case "Transferred":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// دالة للحصول على لون الفئة
const getCategoryColor = (jop) => {
  switch (jop) {
    case "player":
      return "bg-blue-500";
    case "coach":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

// دالة للحصول على نص الحالة (بالعربية)
const getStatusText = (status) => {
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

// دالة للحصول على نص الفئة
const getCategoryText = (jop) => {
  switch (jop) {
    case "player":
      return "player";
    case "coach":
      return "coach";
    default:
      return jop;
  }
};

// المكون الرئيسي
const PlayerCard = ({ player }) => {
  return (
    <div className="border border-gray-300 overflow-hidden group rounded-2xl transition-smooth bg-[hsl(var(--card))] shadow-card h-full min-h-[400px] w-[300px]">
      {/* Header with Avatar and Status */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-4 right-4 flex space-x-4 space-x-reverse">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <span
                  className={`text-white text-xs px-2 py-1 rounded-lg ${getStatusColor(
                    player.status
                  )}`}
                >
                  {getStatusText(player.status)}
                </span>
                <span
                  className={`text-white text-xs px-2 py-1 rounded-lg ${getCategoryColor(
                    player.jop
                  )}`}
                >
                  {getCategoryText(player.jop)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mr-auto ml-auto flex items-center justify-center flex-col">
          <div className="w-24 h-24 rounded-full border border-white shadow-card overflow-hidden flex items-center justify-center bg-[hsl(var(--primary)/0.15)] mb-2">
            {player.profileImage ? (
              <Image
                src={player.profileImage}
                alt={player.name}
                width={64}
                height={64}
                className="w-22 h-22 object-cover rounded-full"
                unoptimized
              />
            ) : (
              <span className="text-[hsl(var(--primary))] text-xl font-bold">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
              {player.name}
            </h3>
            <div className="flex justify-center items-center space-x-2 space-x-reverse mt-1">
              <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {player.nationality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="px-6 pb-4 space-y-3 mt-3">
        <div className="grid grid-cols-2 text-sm">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">العمر:</span>
            <span className="font-medium ml-1 mr-1">{player.age} سنة</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Trophy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              الرياضة:
            </span>
            <span className="font-medium ml-1 mr-1">{player.sport}</span>
            
          </div>
        </div>

   
{player.position && (
          <div className="flex items-center space-x-2 space-x-reverse text-sm">
            <Star className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))]">المركز:</span>
            <span className="font-medium ml-1 mr-1">{player.position}</span>
          </div>
        )}



        
        {(player.monthlySalary || player.annualContractValue != null) && (
          <div className="bg-[hsl(var(--muted))] rounded-lg p-3 space-y-2">
            {player.monthlySalary && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <DollarSign className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span className="text-[hsl(var(--muted-foreground))] ml-1 mr-1">
                    الراتب الشهري:
                  </span>
                </div>
                <span className="font-semibold text-[hsl(var(--primary))]">
                  ${player.monthlySalary.toLocaleString()}
                </span>
              </div>
            )}

            {player.annualContractValue != null && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <DollarSign className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span className="text-[hsl(var(--muted-foreground))] ml-1 mr-1">
                    قيمة العقد السنوي:
                  </span>
                </div>
                <span className="font-semibold text-[hsl(var(--primary))]">
                  {player.annualContractValue === 0
                    ? "غير محدد"
                    : player.annualContractValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {player.transferDeadline && (
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-orange-600">
            <Clock className="w-4 h-4" />
            <span>موعد انتهاء الانتقال:</span>
            <span className="font-medium ml-2 mr-2">
              {new Date(player.transferDeadline).toLocaleDateString("ar-EG", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="px-6 pb-6">
        <Link href={`/players/${player.id}`}>
          <button
            type="button"
            className="w-full group bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] 
            border border-[hsl(var(--primary))] rounded-lg px-4 py-2 hover:bg-[hsl(var(--primary)/0.9)] hover:text-white transition flex items-center justify-center"
          >
            <Eye className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
            عرض الملف الشخصي
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PlayerCard;
