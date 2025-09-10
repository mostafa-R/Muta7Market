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

  // Offer pricing
  ADD_OFFER: Number(process.env.PRICE_ADD_OFFER) || 50,
  PROMOTE_OFFER_PER_DAY: Number(process.env.PRICE_PROMOTE_OFFER_PER_DAY) || 10,
  UNLOCK_CONTACT: Number(process.env.PRICE_UNLOCK_CONTACT) || 25,

  ONE_YEAR_DAYS: 365,
  PROMOTION_DEFAULT_DAYS: Number(process.env.PROMOTION_DEFAULT_DAYS),
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
