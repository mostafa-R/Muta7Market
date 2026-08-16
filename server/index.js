import 'dotenv/config';
import { logger } from './src/utils/logger.js';
import { config } from './src/config/env.js';

let server;

async function bootstrap() {
  const { connectDB } = await import('./src/config/db.js');
  await connectDB();

  const { initRedis } = await import('./src/config/redis.js');
  await initRedis();

  const { initElastic } = await import('./src/config/elastic.js');
  await initElastic();

  const { initSocket } = await import('./src/config/socket.js');
  const { createApp } = await import('./src/app.js');
  const app = createApp();

  const httpServer = app.listen(config.port, () => {
    logger.info(`🚀 Server listening on port ${config.port} (${config.nodeEnv})`);
    logger.info(`📚 Health check: http://localhost:${config.port}/health`);
  });

  initSocket(httpServer);

  const { initCronJobs } = await import('./src/jobs/index.js');
  initCronJobs();

  server = httpServer;
}

bootstrap().catch((err) => {
  logger.error('Fatal error during server bootstrap:', err);
  process.exit(1);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    const { disconnectDB } = await import('./src/config/db.js');
    const { closeRedis } = await import('./src/config/redis.js');
    await disconnectDB();
    await closeRedis();
    logger.info('Shutdown complete. Bye 👋');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
});
