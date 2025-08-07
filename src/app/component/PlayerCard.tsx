"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";

export interface Player {
  id: string;
  name: string;
  age: number;
  status: "Free Agent" | "Contracted" | "Transferred";
  gender: "Male" | "Female";
  nationality: string;
  category: "Amateur" | "Professional" | "Elite";
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

const getStatusColor = (status: Player["status"]) => {
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

const getCategoryColor = (category: Player["category"]) => {
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

const getStatusText = (status: Player["status"]) => {
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

const getCategoryText = (category: Player["category"]) => {
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

const PlayerCard = ({ player : player  }: PlayerCardProps) => {
  return (
    <div className="border border-gray-300 overflow-hidden group rounded-2xl transition-smooth bg-[hsl(var(--card))] shadow-card h-full ">
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
                    player.category
                  )}`}
                >
                  {getCategoryText(player.category)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mr-auto ml-auto flex items-center justify-center flex-col">
          <div className="w-24 h-24 rounded-full border-1 border-white shadow-card overflow-hidden flex items-center justify-center bg-[hsl(var(--primary)/0.15)] mb-2">
            {player.profilePicture ? (
              <Image
                src={player.profilePicture}
                alt={player.name}
                width={64}
                height={64}
                className="w-20 h-20 object-cover rounded-full"
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
      <div className="px-6 pb-4 space-y-3 h-54 mt-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))] " />
            <span className="text-[hsl(var(--muted-foreground))]">العمر:</span>
            <span className="font-medium ml-1 mr-1">{player.age} سنة</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Trophy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-[hsl(var(--muted-foreground))] ">
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

        {player.rating && (
          <div className="flex items-center space-x-2 space-x-reverse text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < player.rating!
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium ml-1 mr-1">{player.rating}/5</span>
          </div>
        )}

        {(player.monthlySalary || player.annualContractValue) && (
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
            {player.annualContractValue && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <DollarSign className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span className="text-[hsl(var(--muted-foreground))] ml-1 mr-1">
                    قيمة العقد السنوي:
                  </span>
                </div>
                <span className="font-semibold text-[hsl(var(--primary))]">
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
