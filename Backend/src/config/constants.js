export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  PLAYER: "player",
  COACH: "coach",
  CLUB: "club",
  AGENT: "agent",
  SCOUT: "scout",
  USER: "user",
};

export const PUBLIC_REGISTERABLE_ROLES = [
  USER_ROLES.PLAYER,
  USER_ROLES.COACH,
  USER_ROLES.CLUB,
  USER_ROLES.AGENT,
  USER_ROLES.SCOUT,
];

export const STAFF_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];

export const CONTRACT_STATUS = {
  FREE_AGENT: "free_agent",
  CONTRACTED: "contracted",
  LOANED: "loaned",
};

export const KYC_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const OFFER_TYPE = {
  INTEREST: "interest",
  OFFICIAL: "official",
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

export const PLAN_TYPES = {
  FREE: "free",
  PRO: "pro",
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

export const PRICING = {
  contacts_access_year: Number(process.env.PRICE_CONTACTS_ACCESS_YEAR),

  listing_year: {
    player: Number(process.env.PRICE_LISTING_PLAYER_YEAR),
    coach: Number(process.env.PRICE_LISTING_COACH_YEAR),
  },

  promotion_year: {
    player: Number(process.env.PRICE_PROMO_PLAYER_YEAR),
    coach: Number(process.env.PRICE_PROMO_COACH_YEAR),
  },

  promotion_per_day: {
    player: Number(process.env.PRICE_PROMO_PLAYER_PER_DAY),
    coach: Number(process.env.PRICE_PROMO_COACH_PER_DAY),
  },

  promotion_premium_year: {
    player: Number(process.env.PRICE_PROMO_PLAYER_PREMIUM_YEAR) || 150,
    coach: Number(process.env.PRICE_PROMO_COACH_PREMIUM_YEAR) || 150,
  },

  promotion_premium_per_day: {
    player: Number(process.env.PRICE_PROMO_PLAYER_PREMIUM_PER_DAY) || 10,
    coach: Number(process.env.PRICE_PROMO_COACH_PREMIUM_PER_DAY) || 10,
  },

  promotion_premium_days: {
    player: Number(process.env.PROMOTION_PREMIUM_DEFAULT_DAYS) || 15,
    coach: Number(process.env.PROMOTION_PREMIUM_DEFAULT_DAYS) || 15,
  },

  // Offer pricing
  ADD_OFFER: Number(process.env.PRICE_ADD_OFFER) || 50,
  PROMOTE_OFFER_PER_DAY: Number(process.env.PRICE_PROMOTE_OFFER_PER_DAY) || 10,
  UNLOCK_CONTACT: Number(process.env.PRICE_UNLOCK_CONTACT) || 25,

  ONE_YEAR_DAYS: 365,
  PROMOTION_DEFAULT_DAYS: Number(process.env.PROMOTION_DEFAULT_DAYS),

  pro_player: {
    month: Number(process.env.PRICE_PRO_PLAYER_MONTH) || 49,
    year: Number(process.env.PRICE_PRO_PLAYER_YEAR) || 499,
  },
  PRO_DEFAULT_DAYS: Number(process.env.PRO_DEFAULT_DAYS) || 30,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
