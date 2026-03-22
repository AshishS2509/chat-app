import type WebSocket from "ws";
import type { TMessage } from "../types/types.js";

export function parseMessage(
  raw: WebSocket.RawData,
): TMessage | "INVALID_DATA" {
  const str = raw.toString();
  try {
    return JSON.parse(str);
  } catch {
    return "INVALID_DATA";
  }
}
