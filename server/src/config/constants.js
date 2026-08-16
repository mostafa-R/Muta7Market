export const ROLES = {
  PLAYER: 'player',
  COACH: 'coach',
  CLUB: 'club',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const ALL_ROLES = Object.values(ROLES);

export const LANGUAGES = ['en', 'ar'];
export const DEFAULT_LANGUAGE = 'ar';

export const PHYSICAL_STATUS = {
  AVAILABLE: 'available',
  INJURED: 'injured',
};

export const CONTRACT_STATUS = {
  FREE_AGENT: 'freeAgent',
  CONTRACTED: 'contracted',
  ON_LOAN: 'onLoan',
};

export const PREFERRED_FOOT = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTH: 'both',
};

export const PREFERRED_HAND = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTH: 'both',
};

export const OFFER_TYPE = {
  INTEREST: 'interest',
  OFFICIAL: 'official',
};

export const OFFER_STATUS = {
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
};

export const NEGOTIATION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
};

export const KYC_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const KYC_DOC_TYPES = {
  REGISTRATION: 'registration',
  LICENSE: 'license',
  IDENTITY: 'identity',
  OTHER: 'other',
};

export const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const SUBSCRIPTION_PERIOD = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const AD_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
};

export const AD_TYPE = {
  TRIAL: 'trial',
  BANNER: 'banner',
};

export const TRIAL_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RATING_TYPES = {
  TRIAL: 'trial',
  MEETING: 'meeting',
  TRANSFER: 'transfer',
};

export const VIDEO_CATEGORIES = ['goals', 'defending', 'saves', 'skills', 'passing', 'speed', 'other'];

export const NOTIFICATION_TYPES = [
  'offer',
  'interest',
  'message',
  'negotiation',
  'kyc',
  'subscription',
  'trial',
  'rating',
  'contact',
  'system',
];

export const FILE_LIMITS = {
  image: 5 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  document: 10 * 1024 * 1024,
};

export const ALLOWED_MIME = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: ['application/pdf'],
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

export const PLAN_CODES = {
  PLAYER_FREE: 'player_free',
  PLAYER_PRO: 'player_pro',
  CLUB_SCOUT: 'club_scout',
  AGENT_PRO: 'agent_pro',
};

export const FREE_PLAYER_VIDEO_LIMIT = 1;
export const OFFER_DEFAULT_EXPIRY_DAYS = 14;

export const CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'GBP'];
export const DEFAULT_CURRENCY = 'USD';

export const DEFAULT_LOCALE = 'ar';

export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const EMAIL_VERIFY_TTL_MINUTES = 24 * 60;
export const PASSWORD_RESET_TTL_MINUTES = 30;
