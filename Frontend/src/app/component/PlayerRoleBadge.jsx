import { Star } from "lucide-react";
import { translateCoachRole } from "../../utils/translationFallback";

/**
 * @param {Object} player 
 * @param {Function} t 
 * @param {string} positionText
 */
const PlayerRoleBadge = ({ player, t, positionText }) => {
  const isCoach = player.jop === "coach";
  const isPlayer = player.jop === "player";

  const displayText = isCoach
    ? translateCoachRole(t, player.roleType)
    : isPlayer
    ? positionText
    : null;

  if (!displayText) return null;

  const labelText = isCoach ? t("player.roleType") : t("player.position");

  return (
    <div className="flex items-center justify-center gap-1.5 p-2 bg-[hsl(var(--muted)/0.2)] rounded-lg mb-2">
      <Star className="w-3.5 h-3.5 text-[hsl(var(--primary))] flex-shrink-0" />
      <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
        {labelText}:
      </span>
      <span
        className="text-sm font-bold text-[hsl(var(--card-foreground))] truncate"
        title={displayText}
      >
        {displayText}
      </span>
    </div>
  );
};

export default PlayerRoleBadge;
