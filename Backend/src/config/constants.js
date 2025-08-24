export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
};

export const PROFILE_STATUS = {
  AVAILABLE: "available",
  TRANSFERRED: "transferred",
  RECENLYTRANSFARRED: "recently transferred",
  CONTRACTED: "contracted",
};

export const GENDER = {
  MALE: "male",
  FEMALE: "female",
};

export const CATEGORY = {
  PLAYER: "player",
  COACH: "coach",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const OFFER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  PENDING: "pending",
};

export const NOTIFICATION_TYPES = {
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
};

// كل الأسعار لسنة كاملة
export const PRICING = {
  // يوزر يدفع سنة ليفتح وسائل التواصل
  contacts_access_year: Number(process.env.PRICE_CONTACTS_ACCESS_YEAR || 5),

  // اشتراك الظهور في الليست لسنة
  listing_year: {
    player: Number(process.env.PRICE_LISTING_PLAYER_YEAR || 5),
    coach: Number(process.env.PRICE_LISTING_COACH_YEAR || 5),
  },

  // ترقية التوب ليست لسنة
  promotion_year: {
    player: Number(process.env.PRICE_PROMO_PLAYER_YEAR || 5),
    coach: Number(process.env.PRICE_PROMO_COACH_YEAR || 5),
  },

  // سعر الترقية باليوم (افتراضي لو مش سنوي)
  promotion_per_day: {
    player: Number(process.env.PRICE_PROMO_PLAYER_PER_DAY || 5),
    coach: Number(process.env.PRICE_PROMO_COACH_PER_DAY || 5),
  },

  // مدة الاشتراكات: 365 يوم
  ONE_YEAR_DAYS: 365,
  // مدة ترقية التوب ليست الافتراضية بالأيام (قابلة للتهيئة من env)
  PROMOTION_DEFAULT_DAYS: Number(process.env.PROMOTION_DEFAULT_DAYS || 5),
  
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
