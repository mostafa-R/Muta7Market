import { Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import { createRateLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  getManagedPlayers,
  assignAgent,
  removeAgent,
  generateAgentLinkCode,
  redeemAgentCode,
} from "../controllers/agent.controller.js";

const router = Router();

router.use(authMiddleware);

const redeemLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many code redemption attempts. Please try again later.",
});

router.get("/players", authorize("agent"), getManagedPlayers);
router.post("/redeem", authorize("agent"), redeemLimiter, redeemAgentCode);
router.put("/players/:playerId/agent", assignAgent);
router.delete("/players/:playerId/agent", removeAgent);
router.post("/players/:playerId/agent-code", generateAgentLinkCode);

export default router;
