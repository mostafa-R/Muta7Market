import { Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import {
  getManagedPlayers,
  assignAgent,
  removeAgent,
  generateAgentLinkCode,
  redeemAgentCode,
} from "../controllers/agent.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/players", authorize("agent"), getManagedPlayers);
router.post("/redeem", authorize("agent"), redeemAgentCode);
router.put("/players/:playerId/agent", assignAgent);
router.delete("/players/:playerId/agent", removeAgent);
router.post("/players/:playerId/agent-code", generateAgentLinkCode);

export default router;
