import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../middleware/auth.middleware.js";
import {
  getMyShortlists,
  createShortlist,
  getShortlist,
  updateShortlist,
  deleteShortlist,
  addPlayerToShortlist,
  removePlayerFromShortlist,
  addCoachToShortlist,
  removeCoachFromShortlist,
  getShortlistChanges,
  getScoutDashboard,
} from "../controllers/shortlist.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(authorize("scout", "coach", "club", "agent", "admin", "super_admin"));

router.get("/", getMyShortlists);
router.post("/", createShortlist);
router.get("/dashboard", getScoutDashboard);
router.get("/:id/changes", getShortlistChanges);
router.get("/:id", getShortlist);
router.put("/:id", updateShortlist);
router.delete("/:id", deleteShortlist);
router.post("/:id/players", addPlayerToShortlist);
router.delete("/:id/players/:playerId", removePlayerFromShortlist);
router.post("/:id/coaches", addCoachToShortlist);
router.delete("/:id/coaches/:coachId", removeCoachFromShortlist);

export default router;