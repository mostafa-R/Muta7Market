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
  ADD_OFFER: 55, // SAR
  PROMOTE_OFFER_PER_DAY: 55, // SAR
  UNLOCK_CONTACT: 55, // SAR
  ACTIVATE_USER: 55, // SAR - one-time activation to view all players' contacts
  PROMOTE_PLAYER: 55, // USD - for player registration
  PROMOTE_COACH: 55, // USD - for coach registration
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
