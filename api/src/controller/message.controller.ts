import { Message, type IMessage } from "../db/message.schema.js";
import { Chat } from "../db/chat.schema.js";
import type { IFunctionReturn } from "../types/types.js";
import { getChat } from "./chat.controller.js";
import mongoose, { Types } from "mongoose";

export async function createMessage({
  userId,
  chatId,
  text,
}: {
  userId: string;
  chatId: string;
  text: string;
}): Promise<IFunctionReturn<IMessage | null>> {
  const session = await mongoose.startSession();
  try {
    const chat = await getChat(chatId);
    if (chat.error.isError || !chat.data) throw Error("Chat not found");
    const sender = new Types.ObjectId(userId);
    const chatObjectId = new Types.ObjectId(chat.data._id.toString());

    let createdMessage: IMessage | null = null;

    await session.withTransaction(async () => {
      const created = await Message.create(
        [
          {
            chatId: chatObjectId,
            senderId: sender,
            chatIdLegacy: chat.data!._id.toString(),
            senderIdLegacy: userId,
            text,
          },
        ],
        { session },
      );

      createdMessage = created[0] ?? null;
      if (!createdMessage) throw new Error("Unable to create message");

      await Chat.updateOne(
        { _id: chatObjectId },
        {
          $set: {
            lastMessage: {
              sender,
              senderLegacy: userId,
              text,
              at: new Date(),
            },
            updatedAt: new Date(),
          },
        },
        { session },
      );
    });

    return {
      data: createdMessage,
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
  } finally {
    await session.endSession();
  }
}

export async function getMesages(
  chatId: string,
): Promise<IFunctionReturn<IMessage[] | null>> {
  try {
    const chatObjectId = new Types.ObjectId(chatId);
    const messages = await Message.find(
      {
        $or: [{ chatId: chatObjectId }, { chatIdLegacy: chatId }],
      },
      null,
      {
      sort: "-createdAt",
      limit: 100,
      },
    );
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
