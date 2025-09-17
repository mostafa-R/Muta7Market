import SiteSettings from "../models/site-settings.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Simple in-memory cache for settings
let settingsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get the current ad settings
export const getAdSettings = asyncHandler(async (req, res) => {
  const now = Date.now();

  // Check cache first
  if (settingsCache && now - cacheTimestamp < CACHE_DURATION) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settingsCache,
          "تم الحصول على إعدادات الإعلانات بنجاح (من الذاكرة المؤقتة)"
        )
      );
  }

  // Fetch from database
  const settings = await SiteSettings.findOneOrCreate();
  settingsCache = settings.ads;
  cacheTimestamp = now;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.ads,
        "تم الحصول على إعدادات الإعلانات بنجاح"
      )
    );
});

// Update ad settings
export const updateAdSettings = asyncHandler(async (req, res) => {
  const { googleAds, internalAdsRatio } = req.body;

  if (googleAds === undefined && internalAdsRatio === undefined) {
    throw new ApiError(400, "البيانات المرسلة غير كافية");
  }

  const settings = await SiteSettings.findOneOrCreate();

  if (googleAds !== undefined) {
    settings.ads.googleAds.enabled = googleAds.enabled;
  }

  if (internalAdsRatio !== undefined) {
    if (internalAdsRatio < 0 || internalAdsRatio > 100) {
      throw new ApiError(
        400,
        "نسبة الإعلانات الداخلية يجب أن تكون بين 0 و 100"
      );
    }
    settings.ads.internalAdsRatio = internalAdsRatio;
  }

  await settings.save();

  // Clear cache when settings are updated
  settingsCache = settings.ads;
  cacheTimestamp = Date.now();

  return res
    .status(200)
    .json(
      new ApiResponse(200, settings.ads, "تم تحديث إعدادات الإعلانات بنجاح")
    );
});
