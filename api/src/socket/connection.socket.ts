import type { IncomingMessage } from "node:http";
import type { AuthedSocket, WSS } from "../types/types.js";
import { verifyToken } from "../helpers/auth.helpers.js";
import { logger } from "../helpers/logger.helper.js";

export async function onConnection(
  socket: AuthedSocket,
  req: IncomingMessage,
  wss: WSS,
) {
  try {
    const url = new URL(req.url!, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) throw new Error("Unauthorized");

    const { data, error } = await verifyToken(token);

    if (!data || error?.isError) throw new Error("Unauthorized");

    wss.connections?.set(data.id, socket);
    socket.meta = { ...data };
    logger.info("Client Connected: " + socket.meta.id);
  } catch (error: any) {
    logger.error(error.message);

    socket.close(
      1008,
      JSON.stringify({
        error: {
          isError: true,
          message: error?.message || "Unhandled Exception",
        },
      }),
    );

    return;
  }
}
