import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createRoom,
  getMyRooms,
  getRoomMessages,
  sendMessage,
  closeRoom,
} from "../controllers/negotiation.controller.js";
import validate, {
  validateQuery,
} from "../middleware/validation.middleware.js";
import {
  createRoomSchema,
  sendMessageSchema,
  getRoomsQuerySchema,
} from "../validators/negotiation.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createRoomSchema), createRoom);
router.get("/mine", validateQuery(getRoomsQuerySchema), getMyRooms);
router.get("/:id/messages", getRoomMessages);
router.post("/:id/messages", validate(sendMessageSchema), sendMessage);
router.post("/:id/close", closeRoom);

export default router;
