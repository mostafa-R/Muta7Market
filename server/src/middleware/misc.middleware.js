import mongoose from 'mongoose';
import { PLAN_CODES, SUBSCRIPTION_STATUS } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';

export function isMongoId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function requireMongoId(id, field = 'id') {
  if (!isMongoId(id)) {
    throw new ApiError(400, 'validation.invalidId', { field });
  }
}

export function assertPlayerExists(player) {
  if (!player) throw new ApiError(404, 'player.notFound');
}
