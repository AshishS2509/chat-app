import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { getMesages } from "../controller/message.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  messagesByIdSchema,
  type TMessagesById,
} from "../types/message.types.js";

const message = Router();

message.get(
  "/:id",
  validator({ params: messagesByIdSchema }),
  async (req: IRequest<TMessagesById>, res: Response, next) => {
    const chatId = req.params.id;
    const data = await getMesages(chatId);
    if (data.error.isError) return next(new Error(data.error.message));
    return res.json(data).end();
  },
);

export default message;
