import type { Request } from "express";
import type pino from "pino";
import WebSocket, { WebSocketServer } from "ws";

export interface IFunctionReturn<d> {
  data: d;
  error: { isError: boolean; message: string };
}

export interface IRequest<P = null, B = null, Q = null> extends Request<
  P,
  null,
  B,
  Q
> {
  log: pino.Logger;
  meta?: {
    email: string;
    id: string;
  };
}

export interface SocketMeta {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface AuthedSocket extends WebSocket {
  meta?: SocketMeta;
}

export type Scope = "access" | "refresh";

export type TMessageParams = {
  chatId: string;
  receiverId: string;
  text: string;
  id: string;
};
export type TChatParams = { email: string };
export type TMessage =
  | { type: "SEND_MESSAGE"; data: TMessageParams }
  | { type: "NEW_CHAT"; data: TChatParams };

export interface WSS extends WebSocketServer {
  connections?: Map<string, AuthedSocket>;
}
