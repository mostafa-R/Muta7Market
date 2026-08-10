import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createRoom,
  getMyRooms,
  getRoomMessages,
  sendMessage,
  closeRoom,
} from "../controllers/negotiation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createRoom);
router.get("/mine", getMyRooms);
router.get("/:id/messages", getRoomMessages);
router.post("/:id/messages", sendMessage);
router.post("/:id/close", closeRoom);

export default router;
