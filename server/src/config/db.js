import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let connection = null;

export async function connectDB() {
  if (connection) return connection;

  const options = {
    autoIndex: config.isProduction ? false : true,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    family: 4,
  };

  logger.info('Connecting to MongoDB...');
  mongoose.connection.on('connected', () => logger.info('MongoDB connected ✅'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(config.mongodbUri, options);
  connection = mongoose.connection;
  return connection;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  }
  connection = null;
}

export function getDB() {
  return mongoose.connection.db;
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
