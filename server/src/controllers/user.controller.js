import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';
import { moveUploadedFile } from '../utils/fileUtils.js';
import { publicFileUrl } from '../utils/fileUtils.js';

export const getMe = catchAsync(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.t('user.profileFetched'), req.user));
});

export const updateMe = catchAsync(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'displayName', 'lang', 'avatar'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.displayName === undefined || updates.displayName === null) {
    const firstName = updates.firstName !== undefined ? updates.firstName : req.user.firstName;
    const lastName = updates.lastName !== undefined ? updates.lastName : req.user.lastName;
    updates.displayName = `${firstName || ''} ${lastName || ''}`.trim() || req.user.displayName;
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true }).select('-password');
  res.status(200).json(new ApiResponse(200, req.t('user.profileUpdated'), user));
});

export const setLanguage = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.userId, { lang: req.body.lang }, { new: true }).select('-password');
  res.status(200).json(new ApiResponse(200, req.t('user.languageUpdated'), user));
});

export const uploadAvatar = catchAsync(async (req, res) => {
  const moved = moveUploadedFile(req, 'images');
  if (!moved) {
    return res.status(400).json({ success: false, statusCode: 400, message: req.t('validation.fieldRequired') });
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatar: moved.path },
    { new: true }
  ).select('-password');
  res.status(200).json(new ApiResponse(200, req.t('user.avatarUpdated'), { avatar: publicFileUrl(moved.path) }));
});
