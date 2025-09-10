import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import { createCronJobs } from "./src/cron/expiry.jobs.js";
import app from "./src/server.js";
import logger from "./src/utils/logger.js";

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء متغير للبورت
const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة البيانات
connectDB();

// إنشاء خادم HTTP
const server = createServer(app);

// إنشاء خادم Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// تعريف أحداث Socket.IO
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // الاستماع لأحداث من العميل
  socket.on("join", (room) => {
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
    logger.info(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// تصدير كائن io للاستخدام في أماكن أخرى
export { io };

// بدء الخادم
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // بدء مهام cron
  createCronJobs();
});
