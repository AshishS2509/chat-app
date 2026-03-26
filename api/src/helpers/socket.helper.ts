import type WebSocket from "ws";
import { MessageSchema, type TMessage } from "../types/socket.types.js";

export function parseMessage(
  raw: WebSocket.RawData,
): TMessage | "INVALID_DATA" {
  try {
    const str = raw.toString();
    const data = JSON.parse(str);
    const result = MessageSchema.parse(data);
    return result;
  } catch {
    return "INVALID_DATA";
  }
}
