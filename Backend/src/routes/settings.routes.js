import express from "express";
import {
  getLegalSettings,
  getPricingSettings,
  getSiteSettings,
  restorePricingDefaults,
  restoreSeoDefaults,
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

// جميع المسارات تتطلب مصادقة ودور مسؤول
router.use(authMiddleware, authorize("admin", "super_admin"));

// مسارات الإعدادات العامة
router.patch("/", updateSiteSettings);
router.patch("/logo", uploadImage.single("logo"), updateSiteLogo);
router.patch("/favicon", uploadImage.single("favicon"), updateSiteFavicon);

// مسارات إعدادات الرسوم والاشتراكات
router.get("/pricing", getPricingSettings);
router.patch("/pricing", updatePricingSettings);
router.post("/pricing/restore", restorePricingDefaults);

// مسارات الشروط والأحكام وسياسة الخصوصية
router.get("/legal", getLegalSettings);
router.patch("/terms", updateTermsAndConditions);
router.patch("/privacy", updatePrivacyPolicy);

// مسارات إعدادات SEO
router.patch("/seo", updateSeoSettings);
router.post("/seo/restore", restoreSeoDefaults);

// مسارات وضع الصيانة
router.patch("/maintenance", updateMaintenanceMode);

// مسارات الترجمات المخصصة
router.patch("/translations", updateCustomTranslations);

export default router;
