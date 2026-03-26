import WebSocket from "ws";
import type { AuthedSocket } from "../types/types.js";

export function isSocketOpen(socket: WebSocket): boolean {
  return socket.readyState === WebSocket.OPEN;
}

export function safeSend(socket: WebSocket, payload: unknown): boolean {
  if (!isSocketOpen(socket)) return false;
  socket.send(JSON.stringify(payload));
  return true;
}

export function safeClose(
  socket: WebSocket,
  code: number,
  payload: string | unknown,
) {
  if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
    return;
  }

  const reason =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  socket.close(code, reason);
}

export function getSocketIdentity(socket: AuthedSocket): string {
  return socket.meta?.id ?? "anonymous";
}
