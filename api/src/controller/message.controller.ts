import { Message } from "../db/message.schema.js";
import { getChat } from "./chat.controller.js";

export async function sendMessage({
  userId,
  chatId,
  text,
}: {
  userId: string;
  chatId: string;
  text: string;
}) {
  try {
    const chat = await getChat(chatId, userId);
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

export async function getMesages(chatId: string) {
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
