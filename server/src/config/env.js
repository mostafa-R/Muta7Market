import 'dotenv/config';

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseList = (value, fallback = []) =>
  typeof value === 'string' && value.trim() ? value.split(',').map((s) => s.trim()).filter(Boolean) : fallback;

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  trustProxy: parseBool(process.env.TRUST_PROXY),

  mongodbUri: required('MONGODB_URI'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    issuer: process.env.JWT_ISSUER || 'muta7market',
  },

  redis: {
    enabled: parseBool(process.env.REDIS_ENABLED),
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },

  elastic: {
    enabled: parseBool(process.env.ELASTIC_ENABLED),
    url: process.env.ELASTIC_URL || 'http://127.0.0.1:9200',
    indexPrefix: process.env.ELASTIC_INDEX_PREFIX || 'muta7market',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: parseBool(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Muta7 Market <no-reply@muta7market.com>',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxVideoMb: Number(process.env.MAX_VIDEO_SIZE_MB) || 200,
    maxImageMb: Number(process.env.MAX_IMAGE_SIZE_MB) || 5,
    maxDocMb: Number(process.env.MAX_DOC_SIZE_MB) || 10,
  },

  paylink: {
    baseUrl: process.env.PAYLINK_BASE_URL || 'https://restapi.paylink.sa',
    apiId: process.env.PAYLINK_API_ID || '',
    secretKey: process.env.PAYLINK_SECRET || '',
    webhookAuth: process.env.PAYLINK_WEBHOOK_AUTH || '',
    persistToken: parseBool(process.env.PAYLINK_PERSIST_TOKEN, true),
    timeoutMs: Number(process.env.PAYLINK_TIMEOUT_MS) || 15_000,
    simulationEnabled:
      process.env.NODE_ENV !== 'production' && parseBool(process.env.PAYMENT_SIMULATION_ENABLED),
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@muta7market.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    name: process.env.ADMIN_NAME || 'Platform Admin',
  },

  rateLimit: {
    windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15,
    max: Number(process.env.RATE_LIMIT_MAX) || 600,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    searchMax: Number(process.env.SEARCH_RATE_LIMIT_MAX) || 120,
  },
};
