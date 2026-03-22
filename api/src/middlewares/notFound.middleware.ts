import type { Response } from "express";
import type { IRequest } from "../types/types.js";

export function notFoundHandler(_req: IRequest, res: Response) {
  res.status(404).json({ error: "Not Found" });
}
