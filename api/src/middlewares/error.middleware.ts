import type { NextFunction, Response } from "express";
import type { IRequest } from "../types/types.js";

export function errorHandler(
  err: Error,
  _req: IRequest,
  res: Response,
  _next: NextFunction,
) {
  console.error(err.message);
  res.status(500).json({ error: "Internal Server Error" });
}
