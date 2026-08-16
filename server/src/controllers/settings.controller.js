import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getPublicSettings,
  listSettings,
  upsertSetting,
  removeSetting,
  getSettingsMap,
} from '../services/settings.service.js';
import { Setting } from '../models/Setting.js';

export const getPublicConfig = catchAsync(async (req, res) => {
  const settings = await getPublicSettings();
  res.status(200).json(new ApiResponse(200, req.t('settings.fetched'), settings));
});

export const getAppConfig = catchAsync(async (req, res) => {
  const map = await getSettingsMap();
  res.status(200).json(new ApiResponse(200, req.t('settings.fetched'), map));
});

export const listAllSettings = catchAsync(async (req, res) => {
  const { group, isPublic, page, limit } = req.query;
  const { total, data } = await listSettings({
    group,
    isPublic: isPublic === undefined ? undefined : isPublic === 'true',
    page,
    limit,
  });
  res.status(200).json(new ApiResponse(200, req.t('settings.fetched'), data, { total, page, limit }));
});

export const createSetting = catchAsync(async (req, res) => {
  const exists = await Setting.exists({ key: req.body.key });
  if (exists) throw new ApiError(409, 'settings.keyExists', {}, req.t('settings.keyExists'));

  const setting = await upsertSetting({ ...req.body, updatedBy: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('settings.created'), setting));
});

export const updateSetting = catchAsync(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  if (!setting) throw new ApiError(404, 'settings.notFound', {}, req.t('settings.notFound'));

  const updated = await upsertSetting({
    key: setting.key,
    value: req.body.value !== undefined ? req.body.value : setting.value,
    type: req.body.type || setting.type,
    group: req.body.group || setting.group,
    label: req.body.label || setting.label,
    description: req.body.description || setting.description,
    isPublic: req.body.isPublic !== undefined ? req.body.isPublic : setting.isPublic,
    isSecret: req.body.isSecret !== undefined ? req.body.isSecret : setting.isSecret,
    updatedBy: req.userId,
  });
  res.status(200).json(new ApiResponse(200, req.t('settings.updated'), updated));
});

export const deleteSetting = catchAsync(async (req, res) => {
  const deleted = await removeSetting(req.params.key);
  if (!deleted) throw new ApiError(404, 'settings.notFound', {}, req.t('settings.notFound'));
  res.status(200).json(new ApiResponse(200, req.t('settings.deleted')));
});

export const refreshSettingsCache = catchAsync(async (req, res) => {
  await getSettingsMap({ force: true });
  res.status(200).json(new ApiResponse(200, req.t('settings.cacheRefreshed')));
});