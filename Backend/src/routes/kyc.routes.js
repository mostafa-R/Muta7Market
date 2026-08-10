import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { verifyLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  getMyKyc,
  submitKyc,
  listPendingKyc,
  reviewKyc,
} from "../controllers/kyc.controller.js";

const router = Router();

router.get("/status", authMiddleware, getMyKyc);
router.post("/request", authMiddleware, verifyLimiter, submitKyc);

router.get(
  "/pending",
  authMiddleware,
  reviewAuthGuard,
  listPendingKyc
);
router.post("/:id/:action", authMiddleware, reviewAuthGuard, reviewKyc);

function reviewAuthGuard(req, res, next) {
  const role = req.user?.role;
  if (role !== "admin" && role !== "super_admin") {
    return res.status(403).json({ success: false, message: "forbidden" });
  }
  next();
}

export default router;
