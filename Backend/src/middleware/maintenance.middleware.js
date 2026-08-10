import SiteSettings from "../models/site-settings.model.js";

let cachedSettings = null;
let cacheTime = 0;
const CACHE_MS = 30_000;

export const maintenanceMiddleware = async (req, res, next) => {
  try {
    if (Date.now() - cacheTime > CACHE_MS) {
      cachedSettings = await SiteSettings.findOne().lean();
      cacheTime = Date.now();
    }

    const isEnabled = cachedSettings?.maintenance?.isEnabled === true;

    if (isEnabled) {
      const allowlist = ["/health", "/api-docs"];
      const isAllowed =
        allowlist.some((p) => req.path.startsWith(p)) ||
        req.path.startsWith("/api/v1/admin") ||
        req.path.startsWith("/api/v1/auth/login");

      if (!isAllowed) {
        return res.status(503).json({
          success: false,
          message:
            cachedSettings.maintenance.message ||
            "We are currently undergoing scheduled maintenance. Please try again later.",
        });
      }
    }

    next();
  } catch (error) {
    next();
  }
};
