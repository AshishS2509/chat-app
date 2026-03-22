import type { IncomingMessage } from "http";
import type { AuthedSocket, WSS } from "../types/types.js";
import { onConnection } from "./connection.socket.js";
import { logger } from "../helpers/logger.helper.js";
import { parseMessage } from "../helpers/socket.helper.js";
import { onMessage } from "./message.socket.js";

export async function handleConnection(
  socket: AuthedSocket,
  req: IncomingMessage,
  wss: WSS,
) {
  try {
    await onConnection(socket, req, wss);
    attachSocketEvents(socket, wss);
  } catch {
    logger.error("Connection setup failed");
    socket.close(1008, "Unauthorized");
  }
}

export function onListening() {
  logger.info("WebSocket server running on /wss");
}

function attachSocketEvents(socket: AuthedSocket, wss: WSS) {
  socket.on("message", (raw) => {
    const message = parseMessage(raw);
    if (message === "INVALID_DATA")
      return socket.send(JSON.stringify({ error: "Invalid message format" }));
    onMessage(socket, message, wss);
  });
  socket.on("close", () => {
    if (socket.meta) wss.connections?.delete(socket.meta.id);
    logger.info(`Client disconnected: ${socket.meta?.id}`);
  });
  socket.on("error", (err) =>
    logger.error(`Socket error (${socket.meta?.id}): ` + err.message),
  );
}
