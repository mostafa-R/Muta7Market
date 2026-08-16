import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  registerUser,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  verifyEmailToken,
  generateEmailVerification,
  generatePasswordReset,
  resetPassword as serviceResetPassword,
  authenticate,
  changeUserPassword,
  getClientIp,
} from '../services/auth.service.js';
import { User } from '../models/User.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../services/email.service.js';
import { config } from '../config/env.js';

const REFRESH_COOKIE = 'muta7_refresh';
const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions(7 * 24 * 60 * 60 * 1000));
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

export const register = catchAsync(async (req, res) => {
  const { user, verificationToken } = await registerUser({
    ...req.body,
    ip: getClientIp(req),
  });

  sendVerificationEmail({
    to: user.email,
    lang: user.lang,
    name: user.displayName,
    token: verificationToken,
  }).catch(() => {});

  res.status(201).json(new ApiResponse(201, req.t('auth.registerSuccess'), { email: user.email }));
});

export const login = catchAsync(async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user.isEmailVerified) {
    throw new ApiError(403, 'auth.emailNotVerified');
  }

  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || null;
  const { accessToken, refreshToken } = await issueTokenPair(user, { ip, userAgent });

  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.status(200).json(
    new ApiResponse(200, req.t('auth.loginSuccess'), {
      accessToken,
      refreshToken,
      user: user.toSafeJSON(),
    })
  );
});

export const refresh = catchAsync(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'auth.invalidRefreshToken');

  const { user, accessToken, refreshToken } = await rotateRefreshToken(token, {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
  });

  setRefreshCookie(res, refreshToken);
  res.status(200).json(
    new ApiResponse(200, req.t('auth.refreshSuccess'), {
      accessToken,
      refreshToken,
      user: user.toSafeJSON(),
    })
  );
});

export const logout = catchAsync(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE];
  if (token) await revokeRefreshToken(token);
  clearRefreshCookie(res);
  res.status(200).json(new ApiResponse(200, req.t('auth.logoutSuccess')));
});

export const verifyEmail = catchAsync(async (req, res) => {
  await verifyEmailToken(req.body.token);
  res.status(200).json(new ApiResponse(200, req.t('auth.emailVerified')));
});

export const resendVerification = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (!user) throw new ApiError(404, 'auth.notFound');
  if (user.isEmailVerified) throw new ApiError(409, 'auth.emailVerified');

  const token = await generateEmailVerification(user);
  sendVerificationEmail({ to: user.email, lang: user.lang, name: user.displayName, token }).catch(() => {});
  res.status(200).json(new ApiResponse(200, req.t('auth.verificationSent')));
});

export const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (user) {
    const token = await generatePasswordReset(user);
    sendResetPasswordEmail({ to: user.email, lang: user.lang, token }).catch(() => {});
  }
  res.status(200).json(new ApiResponse(200, req.t('auth.passwordResetSent')));
});

export const resetPassword = catchAsync(async (req, res) => {
  await serviceResetPassword(req.body.token, req.body.password);
  res.status(200).json(new ApiResponse(200, req.t('auth.passwordResetSuccess')));
});

export const changePassword = catchAsync(async (req, res) => {
  await changeUserPassword(req.userId, req.body.currentPassword, req.body.newPassword);
  res.status(200).json(new ApiResponse(200, req.t('auth.passwordChanged')));
});
