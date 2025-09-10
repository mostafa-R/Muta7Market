import mongoose from "mongoose";
import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import Sport from "../models/sport.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

/* ------------------------ helpers ------------------------ */
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const sanitizeI18n = (v = {}) => ({
  ar: isNonEmptyString(v.ar) ? v.ar.trim() : "",
  en: isNonEmptyString(v.en) ? v.en.trim() : "",
});

const sanitizePositions = (positions = []) => {
  if (!Array.isArray(positions)) return [];
  return positions
    .map((p) => ({ name: sanitizeI18n(p?.name) }))
    .filter((p) => isNonEmptyString(p.name.ar) && isNonEmptyString(p.name.en));
};

const normalizeJop = (v) => {
  if (!v) return null;
  const t = String(v).trim().toLowerCase();
  if (t === "player" || t === "لاعب") return "player";
  if (t === "coach" || t === "مدرب") return "coach";
  return null;
};

const sanitizeRoleTypes = (roleTypes = []) => {
  if (!Array.isArray(roleTypes)) return [];
  return roleTypes
    .map((r) => ({
      jop: normalizeJop(r?.jop),
      name: {
        ar: typeof r?.name?.ar === "string" ? r.name.ar.trim() : "",
        en: typeof r?.name?.en === "string" ? r.name.en.trim() : "",
      },
    }))
    .filter((r) => r.jop && r.name.ar && r.name.en);
};

const sanitizeSEO = (seo = {}) => {
  const metaTitle = seo?.metaTitle
    ? sanitizeI18n(seo.metaTitle)
    : { ar: null, en: null };
  const metaDescription = seo?.metaDescription
    ? sanitizeI18n(seo.metaDescription)
    : { ar: null, en: null };
  const keywords = Array.isArray(seo?.keywords)
    ? seo.keywords
        .map(String)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return {
    metaTitle: {
      ar: metaTitle.ar || null,
      en: metaTitle.en || null,
    },
    metaDescription: {
      ar: metaDescription.ar || null,
      en: metaDescription.en || null,
    },
    keywords,
  };
};

/* -------------------- GET /sports (list) -------------------- */
export const getAllSports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt", // default sort since displayOrder was removed
    sortOrder = "asc",
    search,
  } = req.query;

  const options = {
    page: Math.max(parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100),
  };

  // Only allow safe sort fields
  const allowedSort = new Set(["createdAt", "updatedAt", "name.en", "name.ar"]);
  const sortKey = allowedSort.has(sortBy) ? sortBy : "createdAt";
  const sort = { [sortKey]: sortOrder === "desc" ? -1 : 1 };

  const filter = {};

  if (isNonEmptyString(search)) {
    filter.$or = [
      { "name.ar": { $regex: search, $options: "i" } },
      { "name.en": { $regex: search, $options: "i" } },
    ];
  }

  const [sports, totalSports] = await Promise.all([
    Sport.find(filter)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit),
    Sport.countDocuments(filter),
  ]);

  const pagination = {
    totalDocs: totalSports,
    totalPages: Math.ceil(totalSports / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalSports / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sports, pagination },
        "تم الحصول على قائمة الألعاب الرياضية بنجاح"
      )
    );
});

/* -------------------- GET /sports/:id -------------------- */
export const getSportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم الحصول على اللعبة الرياضية بنجاح"));
});

/* -------------------- POST /sports -------------------- */
// POST /sports
export const createSport = asyncHandler(async (req, res) => {
  const { name, positions, roleTypes, seo } = req.body;

  if (!name || !isNonEmptyString(name.ar) || !isNonEmptyString(name.en)) {
    throw new ApiError(
      400,
      "يرجى توفير اسم اللعبة باللغتين العربية والإنجليزية"
    );
  }

  const existingSport = await Sport.findOne({
    $or: [{ "name.ar": name.ar.trim() }, { "name.en": name.en.trim() }],
  });
  if (existingSport)
    throw new ApiError(400, "توجد لعبة رياضية بنفس الاسم بالفعل");

  const cleanedPositions = sanitizePositions(positions);
  const cleanedRoleTypes = sanitizeRoleTypes(roleTypes);
  const cleanedSEO = sanitizeSEO(seo);

  const newSport = await Sport.create({
    name: { ar: name.ar.trim(), en: name.en.trim() },
    positions: cleanedPositions,
    roleTypes: cleanedRoleTypes, // keep valid only
    seo: cleanedSEO,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newSport, "تم إنشاء اللعبة الرياضية بنجاح"));
});

// PATCH /sports/:id
export const updateSport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, positions, roleTypes, seo } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "معرف اللعبة غير صالح");
  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  if (name && (isNonEmptyString(name.ar) || isNonEmptyString(name.en))) {
    const query = { _id: { $ne: id }, $or: [] };
    if (isNonEmptyString(name.ar))
      query.$or.push({ "name.ar": name.ar.trim() });
    if (isNonEmptyString(name.en))
      query.$or.push({ "name.en": name.en.trim() });
    if (query.$or.length && (await Sport.findOne(query))) {
      throw new ApiError(400, "توجد لعبة رياضية أخرى بنفس الاسم");
    }
  }

  if (name) {
    if (isNonEmptyString(name.ar)) sport.name.ar = name.ar.trim();
    if (isNonEmptyString(name.en)) sport.name.en = name.en.trim();
  }
  if (positions !== undefined) sport.positions = sanitizePositions(positions);
  if (roleTypes !== undefined) sport.roleTypes = sanitizeRoleTypes(roleTypes);
  if (seo !== undefined) sport.seo = { ...sport.seo, ...sanitizeSEO(seo) };

  await sport.save();
  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث اللعبة الرياضية بنجاح"));
});

/* -------------------- PATCH /sports/:id/icon -------------------- */
export const updateSportIcon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "معرف اللعبة غير صالح");

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  if (!req.file) throw new ApiError(400, "يرجى تحميل أيقونة اللعبة");

  // delete old icon (if any)
  if (sport.icon?.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  const iconUploadResult = await handleMediaUpload(req.file, req, "image");
  if (!iconUploadResult?.url)
    throw new ApiError(500, "فشل في تحميل أيقونة اللعبة");

  sport.icon = {
    url: iconUploadResult.url,
    publicId: iconUploadResult.publicId,
  };
  await sport.save();

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث أيقونة اللعبة الرياضية بنجاح"));
});

/* -------------------- DELETE /sports/:id -------------------- */
export const deleteSport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "معرف اللعبة غير صالح");

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  if (sport.icon?.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  await Sport.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "تم حذف اللعبة الرياضية بنجاح"));
});

/* -------------- Public list (kept name for compatibility) -------------- */
// Since isActive/displayOrder were removed, return all sports with useful fields.
export const getActiveSports = asyncHandler(async (_req, res) => {
  const sports = await Sport.find({})
    .select("name icon positions roleTypes")
    .sort({ "name.en": 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, sports, "تم الحصول على قائمة الألعاب الرياضية بنجاح")
    );
});

/* -------------------- Removed: slug-based lookup -------------------- */
export const getSportBySlug = asyncHandler(async (_req, _res) => {
  // If your routes still call this, it's now obsolete because slug was removed from the schema.
  throw new ApiError(410, "تم إزالة خاصية الـ slug من نموذج اللعبة.");
});
