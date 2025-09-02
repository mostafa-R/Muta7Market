import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/server.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

if (!process.env.BASE_URL) {
  process.env.BASE_URL = `http://localhost:${PORT}`;
}

const startServer = async () => {
  try {
   
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
      logger.error(`${err.name}: ${err.message}`);
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err);

      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
      logger.error(`${err.name}: ${err.message}`);
      console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
      console.error(err);

      process.exit(1);
    });

    process.on("SIGTERM", () => {
      logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
      console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");

      server.close(() => {
        logger.info("💥 Process terminated!");
        console.log("💥 Process terminated!");
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
