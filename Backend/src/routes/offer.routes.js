import express from "express";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  getFeaturedOffers,
  searchOffers,
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

offerRoutes.use(authMiddleware);

offerRoutes.post("/", validate(createOfferSchema), createOffer);
offerRoutes.put("/:id", validate(updateOfferSchema), updateOffer);
offerRoutes.delete("/:id", deleteOffer);

export default offerRoutes;
