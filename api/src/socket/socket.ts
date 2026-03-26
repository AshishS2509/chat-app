import type { IncomingMessage } from "http";
import type { AuthedSocket, WSS } from "../types/types.js";
import { onConnection } from "./connection.socket.js";
import { logger } from "../helpers/logger.helper.js";
import { parseMessage } from "../helpers/socket.helper.js";
import { onMessage } from "./message.socket.js";
import { unregisterConnection, closeAllConnections } from "./registry.socket.js";
import { getSocketIdentity, safeClose, safeSend } from "./ws.utils.js";
import { WebSocketServer } from "ws";
import type { Server } from "node:http";

export async function handleConnection(
  socket: AuthedSocket,
  req: IncomingMessage,
  wss: WSS,
) {
  try {
    await onConnection(socket, req, wss);
    attachSocketEvents(socket, wss);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection setup failed";
    logger.error(message);
    safeClose(socket, 1008, "Unauthorized");
  }
}

export function onListening() {
  logger.info("WebSocket server running on /wss");
}

function attachSocketEvents(socket: AuthedSocket, wss: WSS) {
  socket.on("message", (raw) => {
    const message = parseMessage(raw);
    if (message === "INVALID_DATA")
      return safeSend(socket, { error: "Invalid message format" });
    onMessage(socket, message, wss);
  });

  socket.on("close", () => {
    unregisterConnection(socket, wss);
    logger.info(`Client disconnected: ${getSocketIdentity(socket)}`);
  });

  socket.on("error", (err) =>
    logger.error(`Socket error (${getSocketIdentity(socket)}): ${err.message}`),
  );
}

export function createSocketServer(server: Server): WSS {
  const baseWss = new WebSocketServer({ server, path: "/wss" });
  const wss = Object.assign(baseWss, {
    connections: new Map<string, AuthedSocket>(),
  }) as WSS;
  wss.on("listening", onListening);
  wss.on("connection", (socket, req) => {
    handleConnection(socket as AuthedSocket, req, wss);
  });
  return wss;
}

export function shutdownSocketServer(wss: WSS) {
  closeAllConnections(wss);
}
