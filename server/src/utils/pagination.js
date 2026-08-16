import { PAGINATION } from '../config/constants.js';
import { getSettingNumber } from '../services/settings.service.js';

export async function getPagination(query) {
  const [defaultLimit, maxLimit] = await Promise.all([
    getSettingNumber('pagination.defaultlimit', PAGINATION.defaultLimit),
    getSettingNumber('pagination.maxlimit', PAGINATION.maxLimit),
  ]);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, parseInt(query.limit, 10) || defaultLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function getSort(query, defaultSort = '-createdAt') {
  const field = query.sort ? String(query.sort).replace(/^[-+]/g, '') : defaultSort.replace(/^[-+]/g, '');
  const dir = query.sort ? (String(query.sort).startsWith('-') ? -1 : 1) : defaultSort.startsWith('-') ? -1 : 1;
  return { [field]: dir };
}

export function paginateMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}