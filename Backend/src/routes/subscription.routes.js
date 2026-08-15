import { Router } from "express";
import {
  authMiddleware,
  verifiedOnly,
} from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  subscribeSchema,
  subscribeToProSchema,
} from "../validators/subscription.validator.js";
import {
  getProStatus,
  getMySubscription,
  subscribeToPlan,
  subscribeToPro,
  cancelSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/status", getProStatus);
router.get("/", getMySubscription);
router.post(
  "/subscribe",
  verifiedOnly,
  validate(subscribeSchema),
  subscribeToPlan
);
router.post(
  "/subscribe/pro",
  verifiedOnly,
  validate(subscribeToProSchema),
  subscribeToPro
);
router.post("/cancel", cancelSubscription);

export default router;
