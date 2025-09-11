import express from "express";
import {
  createSport,
  deleteSport,
  getActiveSports,
  getAllSports,
  getSportById,
  getSportBySlug,
  updateSport,
  updateSportIcon,
} from "../controllers/sport.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import validateFormData from "../middleware/formDataValidation.middleware.js";
import uploadImage from "../middleware/localUpload.middleware.js";
import {
  createSportSchema,
  updateSportSchema,
} from "../validators/sport.validator.js";

const router = express.Router();

router.get("/active", getActiveSports);
router.get("/slug/:slug", getSportBySlug);

router.use(authMiddleware, authorize("admin", "super_admin"));

router.get("/", getAllSports);
router.get("/:id", getSportById);
router.post(
  "/",
  uploadImage.single("icon"),
  validateFormData(createSportSchema),
  createSport
);
router.patch(
  "/:id",
  uploadImage.single("icon"),
  validateFormData(updateSportSchema),
  updateSport
);
router.patch("/:id/icon", uploadImage.single("icon"), updateSportIcon);
router.delete("/:id", deleteSport);

export default router;
