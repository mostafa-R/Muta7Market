import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Advertisement } from '../models/Advertisement.js';
import { ROLES, AD_STATUS } from '../config/constants.js';
import { getSetting, getSettingNumber } from '../services/settings.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function assertClub(req) {
  if (req.user.role !== ROLES.CLUB && req.user.role !== ROLES.AGENT) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }
}

export const createAdvertisement = catchAsync(async (req, res) => {
  assertClub(req);
  const ad = await Advertisement.create({ ...req.body, advertiser: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('advertisement.created'), ad));
});

export const updateAdvertisement = catchAsync(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  if (ad.advertiser.toString() !== req.userId) {
    throw new ApiError(403, 'advertisement.forbidden', {}, req.t('advertisement.forbidden'));
  }

  Object.assign(ad, req.body);
  await ad.save();
  res.status(200).json(new ApiResponse(200, req.t('advertisement.updated'), ad));
});

export const listMyAdvertisements = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { advertiser: req.userId };
  const total = await Advertisement.countDocuments(filter);
  const data = await Advertisement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  res.status(200).json(new ApiResponse(200, req.t('advertisement.fetched'), data, paginateMeta(total, page, limit)));
});

export const changeStatus = catchAsync(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  if (ad.advertiser.toString() !== req.userId) {
    throw new ApiError(403, 'advertisement.forbidden', {}, req.t('advertisement.forbidden'));
  }

  ad.status = req.body.status;
  await ad.save();
  res.status(200).json(new ApiResponse(200, req.t('advertisement.statusChanged'), ad));
});

export const listActive = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {
    status: AD_STATUS.ACTIVE,
    startsAt: { $lte: new Date() },
    endsAt: { $gte: new Date() },
  };
  if (req.query.country) filter['geo.country'] = req.query.country;
  if (req.query.city) filter['geo.city'] = req.query.city;
  if (req.query.type) filter.type = req.query.type;

  const total = await Advertisement.countDocuments(filter);
  const data = await Advertisement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  if (data.length) {
    Advertisement.updateMany({ _id: { $in: data.map((d) => d._id) } }, { $inc: { impressions: 1 } }).exec().catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, req.t('advertisement.fetched'), data, paginateMeta(total, page, limit)));
});

export const getPlacements = catchAsync(async (req, res) => {
  const { placement, country } = req.query;
  const role = req.user?.role || null;
  const now = new Date();

  const filter = {
    status: AD_STATUS.ACTIVE,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  };
  if (placement) filter.placement = placement;
  if (country) filter.targetCountries = { $in: [String(country).toUpperCase()] };

  const ads = await Advertisement.find(filter).sort({ priority: -1, createdAt: -1 }).limit(20).lean();

  const served = ads.filter(
    (ad) =>
      (!ad.targetRoles || !ad.targetRoles.length || (role && ad.targetRoles.includes(role))) &&
      (!ad.maxImpressions || ad.impressions < ad.maxImpressions) &&
      (!ad.maxClicks || ad.clicks < ad.maxClicks)
  );

  if (served.length) {
    Advertisement.updateMany({ _id: { $in: served.map((a) => a._id) } }, { $inc: { impressions: 1 } }).exec().catch(() => {});
  }

  const [adsenseEnabled, adsenseClientId, adsenseScript, adsenseFormat] = await Promise.all([
    getSettingBooleanValue('ads.googleAdsenseEnabled', false),
    getSetting('ads.googleAdsenseClientId', ''),
    getSetting('ads.googleAdsenseScript', ''),
    getSetting('ads.googleAdsenseFormat', 'auto'),
  ]);

  res.status(200).json(
    new ApiResponse(200, req.t('advertisement.fetched'), {
      placement: placement || 'all',
      googleAdsense: {
        enabled: adsenseEnabled,
        clientId: adsenseClientId,
        script: adsenseScript,
        format: adsenseFormat,
      },
      ads: served,
    })
  );
});

async function getSettingBooleanValue(key, fallback) {
  const value = await getSetting(key, fallback);
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

export const recordClick = catchAsync(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  if (ad.maxClicks && ad.clicks >= ad.maxClicks) {
    throw new ApiError(409, 'advertisement.limitReached', {}, req.t('advertisement.limitReached'));
  }
  Advertisement.updateOne({ _id: ad._id }, { $inc: { clicks: 1 } }).exec().catch(() => {});
  res.status(200).json(new ApiResponse(200, req.t('advertisement.clickRecorded'), { clicks: ad.clicks + 1 }));
});