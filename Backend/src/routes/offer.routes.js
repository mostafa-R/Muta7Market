import express from "express";
import {
  confirmOfferPayment,
  createOffer,
  deleteOffer,
  getAllOffers,
  getFeaturedOffers,
  getMyOffers,
  getOfferById,
  getOfferStatistics,
  getSimilarOffers,
  promoteOffer,
  searchOffers,
  unlockContact,
  updateOffer,
} from "../controllers/offer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createOfferSchema,
  updateOfferSchema,
} from "../validators/offer.validator.js";

const offerRoutes = express.Router();

offerRoutes.get("/", getAllOffers);
offerRoutes.get("/featured", getFeaturedOffers);
offerRoutes.get("/search", searchOffers);
offerRoutes.get("/:id/similar", getSimilarOffers);
offerRoutes.get("/:id", getOfferById);

offerRoutes.use(authMiddleware);

offerRoutes.get("/my", getMyOffers);

offerRoutes.post("/", validate(createOfferSchema), createOffer);
offerRoutes.put("/:id", validate(updateOfferSchema), updateOffer);
offerRoutes.delete("/:id", deleteOffer);
offerRoutes.post("/:id/promote", promoteOffer);
offerRoutes.post("/:id/unlock-contact", unlockContact);
offerRoutes.get("/:id/stats", getOfferStatistics);
offerRoutes.post("/payment/confirm/:invoiceId", confirmOfferPayment);

export default offerRoutes;
