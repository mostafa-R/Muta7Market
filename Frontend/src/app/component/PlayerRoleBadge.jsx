import { Star } from "lucide-react";

/**
 * نورماليز النص لجعله متوافق مع مفاتيح الترجمة
 */
const normalizeKey = (key) =>
  key
    .trim()
    .replace(/\s+/g, "_") // "Head Coach" => "Head_Coach"
    .replace(/([a-z])([A-Z])/g, "$1_$2") // camelCase => snake_case
    .toLowerCase(); // كله lowercase

/**
 * ترجمة نوع الدور للمدربين
 */
const getRoleTypeText = (roleType, sport, t) => {
  if (!roleType) return null;

  // لو كان جاي key كامل زي coachTypes.football.head_coach
  const rawKey = roleType.includes(".") ? roleType.split(".").pop() : roleType;

  const normalized = normalizeKey(rawKey);

  // جرّب ترجمته بالترتيب التالي:
  // 1. النسخة المعيارية المحسنة
  const translatedNormalized = t(`coachRoles.${normalized}`, {
    defaultValue: null,
  });

  if (
    translatedNormalized &&
    translatedNormalized !== `coachRoles.${normalized}`
  ) {
    return translatedNormalized;
  }

  // 2. النسخة الأصلية كما هي
  const translatedRaw = t(`coachRoles.${rawKey}`, {
    defaultValue: null,
  });

  if (translatedRaw && translatedRaw !== `coachRoles.${rawKey}`) {
    return translatedRaw;
  }

  // 3. جرّب بدون underscore
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

  // 4. كلمة "coach" فقط لو كانت موجودة
  if (rawKey.toLowerCase().includes("coach")) {
    const coachTranslation = t(`coachRoles.coach`, {
      defaultValue: null,
    });
    if (coachTranslation && coachTranslation !== "coachRoles.coach") {
      return coachTranslation;
    }
  }

  // Final fallback: إرجاع النص الأصلي مع تنسيق بسيط
  return rawKey.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
};

/**
 * مكوّن عرض شارة دور/مركز اللاعب أو المدرب
 * @param {Object} player - بيانات اللاعب/المدرب
 * @param {Function} t - دالة الترجمة
 * @param {string} positionText - النص المترجم للمركز (للاعبين)
 */
const PlayerRoleBadge = ({ player, t, positionText }) => {
  // للمدربين: نستخدم roleType
  // للاعبين: نستخدم positionText
  const isCoach = player.jop === "coach";
  const isPlayer = player.jop === "player";

  // نحدد النص المناسب للعرض
  const displayText = isCoach
    ? getRoleTypeText(player.roleType, player.sport, t)
    : isPlayer
    ? positionText
    : null;

  // إذا لم يكن هناك نص للعرض، لا نعرض شيئاً
  if (!displayText) return null;

  // نحدد التسمية المناسبة
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
