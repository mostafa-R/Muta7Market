import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import { config } from './env.js';
import { getRedis } from './redis.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins.length ? config.corsOrigins : true,
      credentials: true,
    },
    maxHttpBufferSize: 1e6,
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  const pubClient = getRedis();
  if (pubClient) {
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io using Redis adapter ✅');
  } else {
    logger.info('Socket.io using in-memory adapter');
  }

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('UNAUTHORIZED'));
      const payload = jwt.verify(token, config.jwt.accessSecret, { issuer: config.jwt.issuer });
      if (payload.type !== 'access') return next(new Error('UNAUTHORIZED'));
      const user = await User.findById(payload.sub).select('_id role isActive lang').lean();
      if (!user || !user.isActive) return next(new Error('UNAUTHORIZED'));
      socket.user = { id: user._id.toString(), role: user.role, lang: user.lang };
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    socket.emit('connected', { userId });

    socket.on('negotiation:join', (roomId) => {
      socket.join(`negotiation:${roomId}`);
    });

    socket.on('negotiation:leave', (roomId) => {
      socket.leave(`negotiation:${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToNegotiation(roomId, event, payload) {
  if (!io) return;
  io.to(`negotiation:${roomId}`).emit(event, payload);
}
