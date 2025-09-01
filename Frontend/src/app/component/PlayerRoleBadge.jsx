import { Star } from "lucide-react";

const normalizeKey = (key) =>
  key
    .trim()
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();

const getRoleTypeText = (roleType, sport, t) => {
  if (!roleType) return null;

  const rawKey = roleType.includes(".") ? roleType.split(".").pop() : roleType;

  const normalized = normalizeKey(rawKey);

  const translatedNormalized = t(`coachRoles.${normalized}`, {
    defaultValue: null,
  });

  if (
    translatedNormalized &&
    translatedNormalized !== `coachRoles.${normalized}`
  ) {
    return translatedNormalized;
  }

  const translatedRaw = t(`coachRoles.${rawKey}`, {
    defaultValue: null,
  });

  if (translatedRaw && translatedRaw !== `coachRoles.${rawKey}`) {
    return translatedRaw;
  }

  const withoutUnderscore = rawKey.replace(/_/g, "");
  const translatedNoUnderscore = t(`coachRoles.${withoutUnderscore}`, {
    defaultValue: null,
  });

  if (
    translatedNoUnderscore &&
    translatedNoUnderscore !== `coachRoles.${withoutUnderscore}`
  ) {
    return translatedNoUnderscore;
  }

  if (rawKey.toLowerCase().includes("coach")) {
    const coachTranslation = t(`coachRoles.coach`, {
      defaultValue: null,
    });
    if (coachTranslation && coachTranslation !== "coachRoles.coach") {
      return coachTranslation;
    }
  }

  return rawKey.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
};

/**

 * @param {Object} player 
 * @param {Function} t 
 * @param {string} positionText
 */
const PlayerRoleBadge = ({ player, t, positionText }) => {
  const isCoach = player.jop === "coach";
  const isPlayer = player.jop === "player";

  const displayText = isCoach
    ? getRoleTypeText(player.roleType, player.sport, t)
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
