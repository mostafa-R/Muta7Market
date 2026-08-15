import { Router } from "express";
import {
  authMiddleware,
  verifiedOnly,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { subscribeToProSchema } from "../validators/subscription.validator.js";
import {
  getProStatus,
  getMySubscription,
  subscribeToPro,
  cancelSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/status", getProStatus);
router.get("/", getMySubscription);
router.post("/subscribe", verifiedOnly, validate(subscribeToProSchema), subscribeToPro);
router.post("/cancel", cancelSubscription);

export default router;
