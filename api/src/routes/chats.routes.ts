import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { getChat, getChats } from "../controller/chat.controller.js";

const chats = Router();

chats.get("/list", async (req: IRequest, res: Response) => {
  const userId = req.meta?.id;
  if (!userId) return res.status(401).end();
  const chats = await getChats(userId);
  if (chats.error?.isError) throw new Error(chats.error.message);
  res.status(200).json(chats).end();
});

chats.get("/:id", async (req: IRequest<{ id: string }>, res: Response) => {
  const userId = req.meta?.id;
  const chatId = req.params.id;
  if (!userId || !chatId) return res.status(401).end();
  const chat = await getChat(chatId, userId);
  if (chat.error.isError)
    return res.status(404).json({ error: chat.error }).end();
  res.json({ data: chat.data }).end();
});

export default chats;
