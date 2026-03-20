import type { Request } from "express";
import WebSocket from "ws";

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
