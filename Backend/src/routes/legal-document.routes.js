import express from "express";
import {
  createLegalDocument,
  deleteLegalDocument,
  getAllLegalDocuments,
  getDefaultLegalDocumentByType,
  getLegalDocumentById,
  getLegalDocumentBySlug,
  updateLegalDocument,
} from "../controllers/legal-document.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createLegalDocumentSchema,
  updateLegalDocumentSchema,
} from "../validators/legal-document.validator.js";

const router = express.Router();


router.get("/type/:type", getDefaultLegalDocumentByType);
router.get("/slug/:slug", getLegalDocumentBySlug);


router.use(authMiddleware, authorize("admin", "super_admin"));

router.get("/", getAllLegalDocuments);
router.get("/:id", getLegalDocumentById);
router.post("/", validate(createLegalDocumentSchema), createLegalDocument);
router.patch("/:id", validate(updateLegalDocumentSchema), updateLegalDocument);
router.delete("/:id", deleteLegalDocument);

export default router;
