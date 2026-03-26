import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { getChat, getChats } from "../controller/chat.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
import { chatByIdSchema, type TChatById } from "../types/chat.types.js";

const chats = Router();

chats.get("/list", async (req: IRequest, res: Response, next) => {
  const userId = req.meta?.id;
  if (!userId) return next(new Error("Unauthorized"));
  const chats = await getChats(userId);
  if (chats.error?.isError) return next(new Error(chats.error.message));
  res.status(200).json(chats).end();
});

chats.get(
  "/:id",
  validator({ params: chatByIdSchema }),
  async (req: IRequest<TChatById>, res: Response, next) => {
    const userId = req.meta?.id;
    const chatId = req.params.id;
    if (!userId || !chatId) return next(new Error("id is required"));
    const chat = await getChat(chatId);
    if (chat.error.isError) return next(new Error(chat.error.message));
    return res.json({ data: chat.data }).end();
  },
);

export default chats;
