import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import { createCronJobs } from "./src/cron/expiry.jobs.js";
import { isOriginAllowed } from "./src/config/allowedOrigins.js";
import app from "./src/server.js";
import logger from "./src/utils/logger.js";
import { setSocketServer } from "./src/services/socket.service.js";

const PORT = process.env.PORT ;

connectDB();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: isOriginAllowed,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const origin = socket.handshake.headers.origin;
    if (!isOriginAllowed(origin)) {
      return next(new Error("Origin not allowed"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("join", (room) => {
    if (typeof room !== "string" || !/^negotiation:[0-9a-f]{24}$/i.test(room)) {
      return;
    }
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("leave", (room) => {
    if (typeof room !== "string") return;
    socket.leave(room);
    logger.info(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

setSocketServer(io);

export { io };

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  createCronJobs();
});
