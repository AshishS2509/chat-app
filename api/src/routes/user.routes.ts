import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { Chat } from "../db/chat.schema.js";
import { getChats } from "../controller/user.controller.js";

const user = Router();

user.get("/chats", async (req: IRequest, res: Response) => {
  const userId = req.meta?.id;
  if (!userId) return res.status(401).end();
  const chats = await getChats(userId);
  if (chats.error?.isError) throw new Error(chats.error.message);
  res.status(200).json(chats).end();
});

export default user;
