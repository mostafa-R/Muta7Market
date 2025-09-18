import express from "express";
import {
  bulkUpdateTranslations,
  createTranslation,
  deleteTranslation,
  exportToLocaleFiles,
  exportTranslations,
  getAllTranslations,
  getTranslationGroups,
  getTranslationsByGroup,
  importTranslations,
  syncWithLocaleFiles,
  updateTranslation,
} from "../controllers/localization.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllTranslations);
router.get("/groups", getTranslationGroups);
router.get("/group/:group", getTranslationsByGroup);
router.get("/export", exportTranslations);

router.use(authMiddleware, authorize("admin", "super_admin"));

router.post("/", createTranslation);
router.patch("/:id", updateTranslation);
router.delete("/:id", deleteTranslation);
router.post("/bulk-update", bulkUpdateTranslations);
router.post("/import", importTranslations);
router.post("/sync", syncWithLocaleFiles);
router.post("/export-to-files", exportToLocaleFiles);

export default router;
