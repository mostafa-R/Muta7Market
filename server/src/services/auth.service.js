import crypto from 'crypto';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  hashToken,
} from '../utils/token.js';
import { comparePassword, validatePasswordStrength } from '../utils/password.js';
import { config } from '../config/env.js';
import {
  EMAIL_VERIFY_TTL_MINUTES,
  PASSWORD_RESET_TTL_MINUTES,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../config/constants.js';
import { logger } from '../utils/logger.js';

const ttlMs = (ttl) => ttl * 60 * 1000;

export async function registerUser({ email, password, role, firstName, lastName, displayName, lang, termsAccepted, ip }) {
  if (!termsAccepted) throw new ApiError(400, 'auth.termsRequired');
  const strength = validatePasswordStrength(password);
  if (!strength.valid) throw new ApiError(400, 'auth.passwordTooWeak');

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'auth.emailExists');

  const verificationToken = generateVerificationToken();

  const user = await User.create({
    email: email.toLowerCase(),
    password,
    role,
    firstName,
    lastName,
    displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
    lang,
    termsAcceptedAt: new Date(),
    registeredIp: ip,
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpiresAt: new Date(Date.now() + ttlMs(EMAIL_VERIFY_TTL_MINUTES)),
  });

  return { user, verificationToken };
}

export async function issueTokenPair(user, { ip = null, userAgent = null } = {}) {
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken(user._id.toString(), jti);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    ip,
    userAgent,
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(refreshToken, { ip = null, userAgent = null } = {}) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'auth.invalidRefreshToken');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash, revokedAt: null }).populate('user', '+password');
  if (!stored) throw new ApiError(401, 'auth.invalidRefreshToken');
  if (stored.expiresAt < new Date()) {
    stored.revokedAt = new Date();
    await stored.save();
    throw new ApiError(401, 'auth.invalidRefreshToken');
  }
  const user = stored.user;
  if (!user || !user.isActive) throw new ApiError(401, 'auth.accountInactive');
  if (user.bannedAt) throw new ApiError(403, 'auth.userBanned');

  const { accessToken, refreshToken: newRefresh } = await issueTokenPair(user, { ip, userAgent });

  stored.revokedAt = new Date();
  stored.replacedByTokenHash = hashToken(newRefresh);
  await stored.save();

  return { user, accessToken, refreshToken: newRefresh };
}

export async function revokeRefreshToken(refreshToken) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
    return payload;
  } catch {
    return null;
  }
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export async function verifyEmailToken(token) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, 'auth.invalidVerificationToken');

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
  return user;
}

export async function generateEmailVerification(user) {
  const now = Date.now();
  if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt.getTime() > now) {
    const remainingMinutes = Math.ceil((user.emailVerificationExpiresAt.getTime() - now) / 60000);
    if (remainingMinutes > 20) {
      throw new ApiError(429, 'auth.emailResendCooldown', { minutes: remainingMinutes });
    }
  }
  const token = generateVerificationToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = new Date(now + ttlMs(EMAIL_VERIFY_TTL_MINUTES));
  await user.save();
  return token;
}

export async function generatePasswordReset(user) {
  const token = generateVerificationToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + ttlMs(PASSWORD_RESET_TTL_MINUTES));
  await user.save();
  return token;
}

export async function resetPassword(token, newPassword) {
  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) throw new ApiError(400, 'auth.passwordTooWeak');

  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+password');
  if (!user) throw new ApiError(400, 'auth.invalidResetToken');

  user.password = newPassword;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  await revokeAllUserTokens(user._id);
  return user;
}

export async function authenticate(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'auth.invalidCredentials');
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new ApiError(401, 'auth.invalidCredentials');
  if (user.bannedAt) throw new ApiError(403, 'auth.userBanned');
  if (!user.isActive) throw new ApiError(403, 'auth.accountInactive');
  return user;
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'auth.notFound');

  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw new ApiError(401, 'auth.wrongPassword');

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) throw new ApiError(400, 'auth.passwordTooWeak');

  user.password = newPassword;
  await user.save();
  await revokeAllUserTokens(userId);
  return user;
}

export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
}
