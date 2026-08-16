import { getElastic, isElasticReady, searchIndexName, ensureSearchIndex } from '../config/elastic.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function buildPlayerDoc(player, user) {
  return {
    playerId: player._id.toString(),
    userId: user._id.toString(),
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    sportCode: player.sportCode,
    positions: [player.primaryPosition, ...(player.secondaryPositions || [])],
    heightCm: player.heightCm || 0,
    weightKg: player.weightKg || 0,
    preferredFoot: player.preferredFoot,
    physicalStatus: player.physicalStatus,
    contractStatus: player.contractStatus,
    birthDate: player.birthDate,
    country: player.country || '',
    city: player.city || '',
    ratingAvg: player.ratingAvg || 0,
    ratingCount: player.ratingCount || 0,
    isFeatured: player.isFeatured || false,
    isPublic: player.isPublic !== false,
    views: player.views || 0,
    updatedAt: new Date(),
  };
}

export async function indexPlayer(player) {
  if (!isElasticReady()) return;
  try {
    await ensureSearchIndex();
    const user = await User.findById(player.user).select('displayName firstName lastName').lean();
    if (!user) return;
    await getElastic().index({
      index: searchIndexName(),
      id: player._id.toString(),
      document: buildPlayerDoc(player, user),
    });
  } catch (err) {
    logger.warn('Failed indexing player in Elasticsearch:', err.message);
  }
}

export async function removePlayerFromIndex(playerId) {
  if (!isElasticReady()) return;
  try {
    await getElastic().delete({ index: searchIndexName(), id: playerId.toString() }).catch(() => {});
  } catch {
    /* index may not exist */
  }
}

export async function searchPlayersWithElastic(filters, page, limit, sort) {
  const must = [];
  if (filters.q) must.push({ multi_match: { query: filters.q, fields: ['name^3', 'city'] } });
  if (filters.sportCode) must.push({ term: { sportCode: filters.sportCode } });
  if (filters.position) must.push({ term: { positions: filters.position } });
  if (filters.preferredFoot) must.push({ term: { preferredFoot: filters.preferredFoot } });
  if (filters.physicalStatus) must.push({ term: { physicalStatus: filters.physicalStatus } });
  if (filters.contractStatus) must.push({ term: { contractStatus: filters.contractStatus } });
  if (filters.country) must.push({ term: { country: filters.country } });
  if (filters.city) must.push({ match: { city: filters.city } });
  if (filters.minRating) must.push({ range: { ratingAvg: { gte: filters.minRating } } });
  if (filters.featuredOnly) must.push({ term: { isFeatured: true } });
  if (filters.heightMin !== undefined) must.push({ range: { heightCm: { gte: filters.heightMin } } });
  if (filters.heightMax !== undefined) must.push({ range: { heightCm: { lte: filters.heightMax } } });
  if (filters.weightMin !== undefined) must.push({ range: { weightKg: { gte: filters.weightMin } } });
  if (filters.weightMax !== undefined) must.push({ range: { weightKg: { lte: filters.weightMax } } });
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    const now = Date.now();
    const range = {};
    if (filters.ageMax !== undefined) range.gte = new Date(now - filters.ageMax * 365.25 * 24 * 3600 * 1000);
    if (filters.ageMin !== undefined) range.lte = new Date(now - filters.ageMin * 365.25 * 24 * 3600 * 1000);
    must.push({ range: { birthDate: range } });
  }
  must.push({ term: { isPublic: true } });

  const sortBy = {
    rating: { ratingAvg: { order: 'desc' } },
    views: { views: { order: 'desc' } },
    newest: { updatedAt: { order: 'desc' } },
    featured: [{ isFeatured: { order: 'desc' } }, { ratingAvg: { order: 'desc' } }],
    height: { heightCm: { order: 'desc' } },
  }[sort] || { ratingAvg: { order: 'desc' } };

  const result = await getElastic().search({
    index: searchIndexName(),
    from: (page - 1) * limit,
    size: limit,
    query: { bool: { must } },
    sort: sortBy,
  });

  const ids = result.hits.hits.map((h) => h._id);
  const players = ids.length
    ? await PlayerProfile.find({ _id: { $in: ids } })
        .populate('user', 'displayName firstName lastName avatar isEmailVerified')
        .lean()
    : [];
  const byId = new Map(players.map((p) => [p._id.toString(), p]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  return {
    data: ordered,
    total: typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total || 0,
  };
}

export async function searchPlayersWithMongo(filters, page, limit, sort) {
  const match = { isPublic: true };

  if (filters.q) {
    const userMatches = await User.find({ $or: [{ displayName: { $regex: filters.q, $options: 'i' } }, { firstName: { $regex: filters.q, $options: 'i' } }, { lastName: { $regex: filters.q, $options: 'i' } }] }).select('_id').lean();
    const userIds = userMatches.map((u) => u._id);
    const cityMatch = { city: { $regex: filters.q, $options: 'i' } };
    match.$or = [{ user: { $in: userIds } }, cityMatch];
  }
  if (filters.sportCode) match.sportCode = filters.sportCode;
  if (filters.position) match.$or = [...(match.$or || []), { primaryPosition: filters.position }, { secondaryPositions: filters.position }];
  if (filters.preferredFoot) match.preferredFoot = filters.preferredFoot;
  if (filters.physicalStatus) match.physicalStatus = filters.physicalStatus;
  if (filters.contractStatus) match.contractStatus = filters.contractStatus;
  if (filters.country) match.country = filters.country;
  if (filters.city) match.city = filters.city;
  if (filters.minRating) match.ratingAvg = { $gte: filters.minRating };
  if (filters.featuredOnly) match.isFeatured = true;
  if (filters.heightMin !== undefined || filters.heightMax !== undefined) {
    match.heightCm = {};
    if (filters.heightMin !== undefined) match.heightCm.$gte = filters.heightMin;
    if (filters.heightMax !== undefined) match.heightCm.$lte = filters.heightMax;
  }
  if (filters.weightMin !== undefined || filters.weightMax !== undefined) {
    match.weightKg = {};
    if (filters.weightMin !== undefined) match.weightKg.$gte = filters.weightMin;
    if (filters.weightMax !== undefined) match.weightKg.$lte = filters.weightMax;
  }
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    const now = Date.now();
    match.birthDate = {};
    if (filters.ageMax !== undefined) match.birthDate.$gte = new Date(now - filters.ageMax * 365.25 * 24 * 3600 * 1000);
    if (filters.ageMin !== undefined) match.birthDate.$lte = new Date(now - filters.ageMin * 365.25 * 24 * 3600 * 1000);
  }

  const sortMap = {
    rating: { ratingAvg: -1 },
    views: { views: -1 },
    newest: { createdAt: -1 },
    featured: { isFeatured: -1, ratingAvg: -1 },
    height: { heightCm: -1 },
  };
  const mongoSort = sortMap[sort] || { ratingAvg: -1 };

  const total = await PlayerProfile.countDocuments(match);
  const data = await PlayerProfile.find(match)
    .sort(mongoSort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'displayName firstName lastName avatar isEmailVerified')
    .lean();

  return { data, total };
}

export async function searchCoaches(filters, page, limit, sort) {
  const match = { isPublic: true };
  if (filters.q) {
    const userMatches = await User.find({ $or: [{ displayName: { $regex: filters.q, $options: 'i' } }, { firstName: { $regex: filters.q, $options: 'i' } }, { lastName: { $regex: filters.q, $options: 'i' } }] }).select('_id').lean();
    match.user = { $in: userMatches.map((u) => u._id) };
  }
  if (filters.sportCode) match.sportCode = filters.sportCode;
  if (filters.country) match.country = filters.country;
  if (filters.city) match.city = filters.city;
  if (filters.minExperience !== undefined) match.experienceYears = { $gte: filters.minExperience };
  if (filters.minRating) match.ratingAvg = { $gte: filters.minRating };

  const sortMap = {
    rating: { ratingAvg: -1 },
    experience: { experienceYears: -1 },
    newest: { createdAt: -1 },
  };

  const total = await CoachProfile.countDocuments(match);
  const data = await CoachProfile.find(match)
    .sort(sortMap[sort] || { ratingAvg: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'displayName firstName lastName avatar isEmailVerified')
    .lean();

  return { data, total };
}

export async function searchPlayers({ filters, page, limit, sort }) {
  if (isElasticReady()) {
    try {
      return await searchPlayersWithElastic(filters, page, limit, sort);
    } catch (err) {
      logger.warn('Elasticsearch query failed, falling back to MongoDB:', err.message);
    }
  }
  return searchPlayersWithMongo(filters, page, limit, sort);
}
