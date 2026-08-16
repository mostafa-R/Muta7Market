import express from "express";
import {
  confirmListingPayment,
  createListing,
  deleteListing,
  getAllListings,
  getFeaturedListings,
  getMyListings,
  getListingById,
  getListingStatistics,
  getSimilarListings,
  promoteListing,
  searchListings,
  unlockContact,
  updateListing,
} from "../controllers/listing.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createListingSchema,
  updateListingSchema,
} from "../validators/listing.validator.js";

const listingRoutes = express.Router();

listingRoutes.get("/", getAllListings);
listingRoutes.get("/featured", getFeaturedListings);
listingRoutes.get("/search", searchListings);

listingRoutes.get("/:id/similar", getSimilarListings);
listingRoutes.get("/my", authMiddleware, getMyListings);
listingRoutes.get("/:id", getListingById);

listingRoutes.use(authMiddleware);

listingRoutes.post("/", validate(createListingSchema), createListing);
listingRoutes.post("/payment/confirm/:invoiceId", confirmListingPayment);

listingRoutes.put("/:id", validate(updateListingSchema), updateListing);
listingRoutes.delete("/:id", deleteListing);
listingRoutes.post("/:id/promote", promoteListing);
listingRoutes.post("/:id/unlock-contact", unlockContact);
listingRoutes.get("/:id/stats", getListingStatistics);

export default listingRoutes;