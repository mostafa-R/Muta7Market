let io = null;

export function setSocketServer(serverInstance) {
  io = serverInstance;
}

export function userRoom(userId) {
  return `user:${userId}`;
}

export function emitToRoom(room, event, payload) {
  if (!io) return false;
  io.to(room).emit(event, payload);
  return true;
}

export function emitToUser(userId, event, payload) {
  if (!io) return false;
  io.to(userRoom(userId)).emit(event, payload);
  return true;
}