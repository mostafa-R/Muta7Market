import express from "express";
import {
  addTranslation,
  deleteTranslation,
  getLegalSettings,
  getPricingSettings,
  getSiteSettings,
  getTranslations,
  restorePricingDefaults,
  restoreSeoDefaults,
  restoreTranslationsDefaults,
  updateCustomTranslations,
  updateMaintenanceMode,
  updatePricingSettings,
  updatePrivacyPolicy,
  updateSeoSettings,
  updateSiteFavicon,
  updateSiteLogo,
  updateSiteSettings,
  updateTermsAndConditions,
} from "../controllers/settings.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import uploadImage from "../middleware/localUpload.middleware.js";

const router = express.Router();

router.get("/", getSiteSettings);
router.get("/translations", getTranslations);

router.use(authMiddleware, authorize("admin", "super_admin"));

router.patch("/", updateSiteSettings);
router.patch("/logo", uploadImage.single("logo"), updateSiteLogo);
router.patch("/favicon", uploadImage.single("favicon"), updateSiteFavicon);

router.get("/pricing", getPricingSettings);
router.patch("/pricing", updatePricingSettings);
router.post("/pricing/restore", restorePricingDefaults);

router.get("/legal", getLegalSettings);
router.patch("/terms", updateTermsAndConditions);
router.patch("/privacy", updatePrivacyPolicy);

router.patch("/seo", updateSeoSettings);
router.post("/seo/restore", restoreSeoDefaults);

router.patch("/maintenance", updateMaintenanceMode);

router.patch("/translations", updateCustomTranslations);
router.post("/translations", addTranslation);
router.delete("/translations/:key", deleteTranslation);
router.post("/translations/restore", restoreTranslationsDefaults);

export default router;
