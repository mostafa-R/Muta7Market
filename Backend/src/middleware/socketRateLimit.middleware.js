const WINDOW_MS = Number(process.env.SOCKET_EVENT_WINDOW_MS || 10_000);
const MAX_EVENTS_PER_WINDOW = Number(process.env.SOCKET_MAX_EVENTS_PER_WINDOW || 40);
const MAX_ROOM_OPS_PER_WINDOW = Number(
  process.env.SOCKET_MAX_ROOM_OPS_PER_WINDOW || 10
);
const MAX_CONNECTIONS_PER_IP = Number(
  process.env.SOCKET_MAX_CONNECTIONS_PER_IP || 10
);
const MAX_CONNECTIONS_PER_USER = Number(
  process.env.SOCKET_MAX_CONNECTIONS_PER_USER || 5
);

const ipConnections = new Map();
const userConnections = new Map();
const socketBuckets = new Map();

function pruneTimestamps(timestamps) {
  const cutoff = Date.now() - WINDOW_MS;
  while (timestamps.length && timestamps[0] < cutoff) timestamps.shift();
  return timestamps;
}

export function canConnect(ip, userId) {
  if (ip && (ipConnections.get(ip) || 0) >= MAX_CONNECTIONS_PER_IP) return false;
  if (userId && (userConnections.get(userId) || 0) >= MAX_CONNECTIONS_PER_USER) return false;
  return true;
}

export function trackConnection(ip, userId) {
  if (ip) ipConnections.set(ip, (ipConnections.get(ip) || 0) + 1);
  if (userId) userConnections.set(userId, (userConnections.get(userId) || 0) + 1);
}

export function releaseConnection(ip, userId) {
  if (ip) {
    const count = ipConnections.get(ip) || 0;
    if (count <= 1) ipConnections.delete(ip);
    else ipConnections.set(ip, count - 1);
  }
  if (userId) {
    const count = userConnections.get(userId) || 0;
    if (count <= 1) userConnections.delete(userId);
    else userConnections.set(userId, count - 1);
  }
}

export function eventAllowed(socketId, isRoomOp) {
  const now = Date.now();
  let bucket = socketBuckets.get(socketId);
  if (!bucket) {
    bucket = { events: [], roomOps: [] };
    socketBuckets.set(socketId, bucket);
  }

  pruneTimestamps(bucket.events);
  if (bucket.events.length >= MAX_EVENTS_PER_WINDOW) return false;

  if (isRoomOp) {
    pruneTimestamps(bucket.roomOps);
    if (bucket.roomOps.length >= MAX_ROOM_OPS_PER_WINDOW) return false;
    bucket.roomOps.push(now);
  }

  bucket.events.push(now);
  return true;
}

export function releaseSocket(socketId) {
  socketBuckets.delete(socketId);
}