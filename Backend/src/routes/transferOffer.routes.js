import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../middleware/auth.middleware.js";
import {
  createTransferOffer,
  getTransferOffers,
  getMyTransferOffers,
  getTransferOfferById,
  respondToTransferOffer,
  confirmTransferOfferPayment,
} from "../controllers/transferOffer.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("club", "agent", "admin", "super_admin"),
  getTransferOffers
);
router.get("/my", authMiddleware, getMyTransferOffers);
router.get("/:id", authMiddleware, getTransferOfferById);
router.post(
  "/",
  authMiddleware,
  authorize("club", "agent", "admin", "super_admin"),
  createTransferOffer
);
router.post("/:id/:action", authMiddleware, respondToTransferOffer);
router.post(
  "/payment/confirm/:invoiceId",
  authMiddleware,
  confirmTransferOfferPayment
);

export default router;
