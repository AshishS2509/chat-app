import type { AuthedSocket, WSS } from "../types/types.js";
import { logger } from "../helpers/logger.helper.js";
import { safeClose } from "./ws.utils.js";

export function registerConnection(
  userId: string,
  socket: AuthedSocket,
  wss: WSS,
) {
  const existing = wss.connections.get(userId);

  // Keep only one active socket per user to avoid stale duplicates.
  if (existing && existing !== socket) {
    safeClose(existing, 1000, "Replaced by new connection");
  }

  wss.connections.set(userId, socket);
}

export function unregisterConnection(socket: AuthedSocket, wss: WSS) {
  const userId = socket.meta?.id;
  if (!userId) return;

  const current = wss.connections.get(userId);
  if (current !== socket) return;

  wss.connections.delete(userId);
}

export function closeAllConnections(wss: WSS) {
  for (const socket of wss.clients) {
    safeClose(socket, 1001, "Server shutdown");
  }
  logger.info("All websocket connections were closed");
}
