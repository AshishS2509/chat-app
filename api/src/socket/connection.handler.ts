import type { IncomingMessage } from "node:http";
import { verifyToken } from "../controller/auth.controller.js";
import { getChats } from "../controller/chat.controller.js";
import type { AuthedSocket, IRequest } from "../types/types.js";

export async function onConnection(socket: AuthedSocket, req: IncomingMessage) {
  try {
    const url = new URL(req.url!, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) throw new Error("Unauthorized");

    const { data, error } = await verifyToken(token);

    if (!data || error?.isError) {
      throw new Error("Unauthorized");
    }

    socket.meta = {
      ...data,
    };
    console.log("Client Connected: ", socket.meta.id);
  } catch (error: any) {
    console.error(error.message);

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
