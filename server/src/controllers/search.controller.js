import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { searchPlayers, searchCoaches } from '../services/elastic.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

export const searchPlayersAdvanced = catchAsync(async (req, res) => {
  const { page, limit } = await getPagination(req.query);
  const filters = {
    q: req.query.q,
    sportCode: req.query.sportCode,
    position: req.query.position,
    heightMin: req.query.heightMin !== undefined ? Number(req.query.heightMin) : undefined,
    heightMax: req.query.heightMax !== undefined ? Number(req.query.heightMax) : undefined,
    weightMin: req.query.weightMin !== undefined ? Number(req.query.weightMin) : undefined,
    weightMax: req.query.weightMax !== undefined ? Number(req.query.weightMax) : undefined,
    preferredFoot: req.query.preferredFoot,
    physicalStatus: req.query.physicalStatus,
    contractStatus: req.query.contractStatus,
    ageMin: req.query.ageMin !== undefined ? Number(req.query.ageMin) : undefined,
    ageMax: req.query.ageMax !== undefined ? Number(req.query.ageMax) : undefined,
    country: req.query.country,
    city: req.query.city,
    minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
    featuredOnly: req.query.featuredOnly === 'true',
  };

  const { data, total } = await searchPlayers({ filters, page, limit, sort: req.query.sort });

  res.status(200).json(
    new ApiResponse(200, req.t('search.results'), data, paginateMeta(total, page, limit))
  );
});

export const searchCoachesAdvanced = catchAsync(async (req, res) => {
  const { page, limit } = await getPagination(req.query);
  const filters = {
    q: req.query.q,
    sportCode: req.query.sportCode,
    country: req.query.country,
    city: req.query.city,
    minExperience: req.query.minExperience !== undefined ? Number(req.query.minExperience) : undefined,
    minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
  };

  const { data, total } = await searchCoaches(filters, page, limit, req.query.sort);
  res.status(200).json(
    new ApiResponse(200, req.t('search.results'), data, paginateMeta(total, page, limit))
  );
});
