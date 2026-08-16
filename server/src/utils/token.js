import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from '../config/constants.js';

export function signAccessToken(userId, role) {
  return jwt.sign({ sub: userId, role, type: 'access' }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
    issuer: config.jwt.issuer,
  });
}

export function signRefreshToken(userId, jti) {
  return jwt.sign({ sub: userId, type: 'refresh', jti }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
    issuer: config.jwt.issuer,
  });
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.jwt.accessSecret, { issuer: config.jwt.issuer });
  if (payload.type !== 'access') throw new Error('INVALID_TOKEN_TYPE');
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, config.jwt.refreshSecret, { issuer: config.jwt.issuer });
  if (payload.type !== 'refresh') throw new Error('INVALID_TOKEN_TYPE');
  return payload;
}

export function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[crypto.randomInt(0, digits.length)];
  return otp;
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getAccessTokenTtl() {
  return ACCESS_TOKEN_TTL_SECONDS;
}

export function getRefreshTokenTtl() {
  return REFRESH_TOKEN_TTL_SECONDS;
}
