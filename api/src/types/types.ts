import type { Request } from "express";

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
    user: string;
  };
}
