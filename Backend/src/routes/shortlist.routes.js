import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getMyShortlists,
  createShortlist,
  getShortlist,
  updateShortlist,
  deleteShortlist,
  addPlayerToShortlist,
  removePlayerFromShortlist,
} from "../controllers/shortlist.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyShortlists);
router.post("/", createShortlist);
router.get("/:id", getShortlist);
router.put("/:id", updateShortlist);
router.delete("/:id", deleteShortlist);
router.post("/:id/players", addPlayerToShortlist);
router.delete("/:id/players/:playerId", removePlayerFromShortlist);

export default router;
