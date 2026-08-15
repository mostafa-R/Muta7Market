import "dotenv/config";
import { createServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import mongoose from "mongoose";
import redis from "redis";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import { createCronJobs } from "./src/cron/expiry.jobs.js";
import { isOriginAllowed } from "./src/config/allowedOrigins.js";
import NegotiationRoom from "./src/models/negotiationRoom.model.js";
import User from "./src/models/user.model.js";
import app from "./src/server.js";
import logger from "./src/utils/logger.js";
import { setSocketServer, userRoom } from "./src/services/socket.service.js";
import {
  canConnect,
  eventAllowed,
  releaseConnection,
  releaseSocket,
  trackConnection,
} from "./src/middleware/socketRateLimit.middleware.js";

const PORT = process.env.PORT;

connectDB();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: isOriginAllowed,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const redisUrl = process.env.REDIS_URL || "";

if (redisUrl) {
  try {
    const pubClient = redis.createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.io Redis adapter enabled");
  } catch (error) {
    logger.error("Socket.io Redis adapter failed, falling back to in-memory:", error);
  }
}

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.auth?.accessToken ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }

    const user = await User.findById(decoded.id)
      .select("name email phone role isActive verifiedBadge")
      .lean();

    if (!user || !user.isActive) {
      return next(new Error("User not found or inactive"));
    }

    socket.data.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verifiedBadge: Boolean(user.verifiedBadge),
    };

    const ip =
      socket.handshake.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      socket.handshake.address;

    if (!canConnect(ip, String(user._id))) {
      return next(new Error("Too many connections, try again later"));
    }

    socket.data.connectionId = ip;
    trackConnection(ip, String(user._id));

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.use(([eventName], next) => {
    const isRoomOp = eventName === "join" || eventName === "leave";
    if (!eventAllowed(socket.id, isRoomOp)) {
      return next(new Error("Rate limit exceeded"));
    }
    next();
  });

  socket.join(userRoom(socket.data.user.id));

  socket.on("join", async (room, ack) => {
    try {
      if (typeof room !== "string" || !/^negotiation:[0-9a-f]{24}$/i.test(room)) {
        if (typeof ack === "function") {
          ack({ success: false, error: "Invalid room" });
        }
        return;
      }

      const roomId = room.split(":")[1];
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        if (typeof ack === "function") {
          ack({ success: false, error: "Invalid room" });
        }
        return;
      }

      const membership = await NegotiationRoom.exists({
        _id: roomId,
        participants: socket.data.user.id,
      });

      if (!membership) {
        if (typeof ack === "function") {
          ack({ success: false, error: "Not a participant of this room" });
        }
        return;
      }

      socket.join(room);
      logger.info(`Socket ${socket.id} joined room: ${room}`);
      if (typeof ack === "function") {
        ack({ success: true });
      }
    } catch (error) {
      logger.error("Socket join error:", error);
      if (typeof ack === "function") {
        ack({ success: false, error: "Server error" });
      }
    }
  });

  socket.on("leave", (room) => {
    if (typeof room !== "string") return;
    socket.leave(room);
    logger.info(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    releaseSocket(socket.id);
    releaseConnection(
      socket.data.connectionId,
      socket.data.user?.id
    );
  });
});

setSocketServer(io);

export { io };

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  createCronJobs();
});