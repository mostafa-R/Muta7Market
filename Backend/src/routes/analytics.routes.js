import { Router } from "express";
import {
  getAnalyticsOverview,
  getRealTimeAnalytics,
} from "../controllers/analytics.controller.js";
import {
  authorize,
  authMiddleware as verifyJWT,
} from "../middleware/auth.middleware.js";
import { validateTimeRange } from "../validators/analytics.validator.js";

const router = Router();

router.use(verifyJWT, authorize("admin"));

router.get("/overview", validateTimeRange, getAnalyticsOverview);
router.get("/realtime", getRealTimeAnalytics);

export default router;
