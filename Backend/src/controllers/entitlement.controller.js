import Entitlement from '../models/entitlement.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMyEntitlements = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const ents = await Entitlement.find({ user: userId, active: true })
    .select('-__v')
    .sort({ activatedAt: -1, createdAt: -1 })
    .lean();
  return res
    .status(200)
    .json(new ApiResponse(200, { entitlements: ents }, 'Entitlements fetched'));
});

export const checkEntitlement = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { type } = req.query || {};
  if (!type || !['unlock_contacts', 'publish_profile'].includes(String(type))) {
    throw new ApiError(400, 'Invalid or missing entitlement type');
  }
  const ent = await Entitlement.findOne({ user: userId, type, active: true }).lean();
  return res
    .status(200)
    .json(new ApiResponse(200, { type, active: Boolean(ent) }, 'Entitlement status'));
});


