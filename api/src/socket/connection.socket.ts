import type { IncomingMessage } from "node:http";
import type { AuthedSocket, WSS } from "../types/types.js";
import { verifyToken } from "../helpers/auth.helpers.js";
import { logger } from "../helpers/logger.helper.js";
import { registerConnection } from "./registry.socket.js";
import { safeClose } from "./ws.utils.js";

export async function onConnection(
  socket: AuthedSocket,
  req: IncomingMessage,
  wss: WSS,
) {
  const url = new URL(req.url ?? "", "http://localhost");
  const token = url.searchParams.get("token");

  if (!token) {
    logger.error("Socket connection denied: missing token");
    safeClose(socket, 1008, "Unauthorized");
    throw new Error("Unauthorized");
  }

  const { data, error } = await verifyToken(token);

  if (!data || error?.isError) {
    logger.error("Socket connection denied: invalid token");
    safeClose(socket, 1008, "Unauthorized");
    throw new Error("Unauthorized");
  }

  socket.meta = { ...data };
  registerConnection(data.id, socket, wss);
  logger.info("Client connected: " + socket.meta.id);
}
