import { Message, type IMessage } from "../db/message.schema.js";
import type { IFunctionReturn } from "../types/types.js";
import { getChat } from "./chat.controller.js";

export async function createMessage({
  userId,
  chatId,
  text,
}: {
  userId: string;
  chatId: string;
  text: string;
}): Promise<IFunctionReturn<IMessage | null>> {
  try {
    const chat = await getChat(chatId);
    if (chat.error.isError || !chat.data) throw Error("Chat not found");
    const sender = userId;

    const data = await Message.create({
      chatId: chat.data._id.toString(),
      senderId: sender,
      text,
      timestamp: Date.now(),
    });

    return {
      data,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        isError: true,
        message: "message" in error ? error.message : "DB Error",
      },
    };
  }
}

export async function getMesages(
  chatId: string,
): Promise<IFunctionReturn<IMessage[] | null>> {
  try {
    const messages = await Message.find({ chatId }, null, {
      sort: "timestamp",
      limit: 100,
    });
    return {
      data: messages,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        isError: true,
        message: "message" in error ? error.message : "DB Error",
      },
    };
  }
}
