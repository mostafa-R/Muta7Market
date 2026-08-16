import { Setting } from '../models/Setting.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

const SETTINGS_CACHE_KEY = 'settings:map';
const MEM_TTL_MS = 30_000;

let memCache = null;
let memCacheAt = 0;

async function loadSettingsMap() {
  const docs = await Setting.find().lean();
  const map = {};
  for (const doc of docs) {
    map[doc.key.toLowerCase()] = doc.value;
  }
  return map;
}

export async function getSettingsMap({ force = false } = {}) {
  if (force) {
    memCache = null;
    memCacheAt = 0;
    await cacheDel(SETTINGS_CACHE_KEY);
  }

  const now = Date.now();
  if (memCache && now - memCacheAt < MEM_TTL_MS) return memCache;

  const cached = await cacheGet(SETTINGS_CACHE_KEY);
  if (cached) {
    memCache = cached;
    memCacheAt = now;
    return cached;
  }

  const map = await loadSettingsMap();
  memCache = map;
  memCacheAt = now;
  await cacheSet(SETTINGS_CACHE_KEY, map, 60);
  return map;
}

export async function getSetting(key, fallback) {
  const map = await getSettingsMap();
  const normalized = String(key).toLowerCase();
  return map[normalized] !== undefined ? map[normalized] : fallback;
}

export async function getSettingNumber(key, fallback) {
  const value = await getSetting(key, fallback);
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export async function getSettingBoolean(key, fallback) {
  const value = await getSetting(key, fallback);
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true' ? true : fallback;
}

export async function invalidateSettingsCache() {
  memCache = null;
  memCacheAt = 0;
  await cacheDel(SETTINGS_CACHE_KEY);
}

export async function getPublicSettings() {
  const docs = await Setting.find({ isPublic: true, isSecret: false }).select('key value type group label').lean();
  const map = {};
  for (const doc of docs) {
    map[doc.key] = { value: doc.value, type: doc.type, group: doc.group, label: doc.label };
  }
  return map;
}

export async function listSettings({ group, isPublic, page = 1, limit = 100 } = {}) {
  const filter = {};
  if (group) filter.group = group;
  if (typeof isPublic === 'boolean') filter.isPublic = isPublic;

  const total = await Setting.countDocuments(filter);
  const data = await Setting.find(filter)
    .sort({ group: 1, key: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { total, data };
}

export async function upsertSetting({ key, value, type, group, label, description, isPublic, isSecret, updatedBy }) {
  const normalizedKey = String(key).toLowerCase();
  const setting = await Setting.findOneAndUpdate(
    { key: normalizedKey },
    { key: normalizedKey, value, type, group, label, description, isPublic, isSecret, updatedBy },
    { new: true, upsert: true, runValidators: true }
  );
  await invalidateSettingsCache();
  return setting;
}

export async function removeSetting(key) {
  const res = await Setting.deleteOne({ key: String(key).toLowerCase() });
  await invalidateSettingsCache();
  return res.deletedCount > 0;
}