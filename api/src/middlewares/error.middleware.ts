import type { NextFunction, Response } from "express";
import type { IRequest } from "../types/types.js";

export function errorHandler(
  _err: Error,
  _req: IRequest,
  res: Response,
  _next: NextFunction,
) {
  res.status(500).json({ error: "Internal Server Error" });
}
