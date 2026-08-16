import { verifyAccessToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'auth.unauthorized', {}, req.t('auth.unauthorized'));
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'auth.invalidToken', {}, req.t('auth.invalidToken') || req.t('auth.unauthorized'));
  }

  const user = await User.findById(payload.sub).select('-password').lean();
  if (!user) throw new ApiError(401, 'auth.notFound', {}, req.t('auth.notFound'));
  if (!user.isActive) throw new ApiError(403, 'auth.accountInactive', {}, req.t('auth.accountInactive'));
  if (user.bannedAt) throw new ApiError(403, 'auth.userBanned', {}, req.t('auth.userBanned'));

  req.user = { ...user, id: user._id.toString() };
  req.userId = req.user.id;
  next();
});

export const optionalAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password').lean();
    if (user && user.isActive && !user.bannedAt) {
      req.user = { ...user, id: user._id.toString() };
      req.userId = req.user.id;
    }
  } catch {
    /* optional auth - ignore invalid token */
  }
  next();
});

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'auth.unauthorized', {}, req.t('auth.unauthorized')));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden')));
    }
    next();
  };
}

export const isAdmin = restrictTo('admin');
