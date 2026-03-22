import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { getMesages } from "../controller/message.controller.js";

const message = Router();

message.get("/:id", async (req: IRequest<{ id: string }>, res: Response) => {
  const chatId = req.params.id;

  const data = await getMesages(chatId);

  if (data.error.isError) return res.status(400).json(data).end();
  return res.json(data).end();
});

export default message;
