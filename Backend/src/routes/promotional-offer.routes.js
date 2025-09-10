import express from "express";
import {
  createPromotionalOffer,
  deletePromotionalOffer,
  getAllPromotionalOffers,
  getPromotionalOfferById,
  updatePromotionalOffer,
  updatePromotionalOfferImage,
  usePromotionalOfferCode,
  validatePromotionalOfferCode,
} from "../controllers/promotional-offer.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import uploadImage from "../middleware/localUpload.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPromotionalOfferSchema,
  updatePromotionalOfferSchema,
  validatePromotionalOfferCodeSchema,
} from "../validators/promotional-offer.validator.js";

const router = express.Router();

// مسارات تتطلب مصادقة للمستخدمين العاديين
router.use(authMiddleware);

// مسارات للمستخدمين العاديين
router.post(
  "/validate",
  validate(validatePromotionalOfferCodeSchema),
  validatePromotionalOfferCode
);
router.post(
  "/use",
  validate(validatePromotionalOfferCodeSchema),
  usePromotionalOfferCode
);

// مسارات تتطلب دور مسؤول
router.use(authorize("admin", "super_admin"));

router.get("/", getAllPromotionalOffers);
router.get("/:id", getPromotionalOfferById);
router.post(
  "/",
  validate(createPromotionalOfferSchema),
  createPromotionalOffer
);
router.patch(
  "/:id",
  validate(updatePromotionalOfferSchema),
  updatePromotionalOffer
);
router.patch(
  "/:id/image",
  uploadImage.single("image"),
  updatePromotionalOfferImage
);
router.delete("/:id", deletePromotionalOffer);

export default router;
