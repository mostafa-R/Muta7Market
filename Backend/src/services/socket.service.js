let io = null;

export function setSocketServer(serverInstance) {
  io = serverInstance;
}

export function emitToRoom(room, event, payload) {
  if (!io) return false;
  io.to(room).emit(event, payload);
  return true;
}
