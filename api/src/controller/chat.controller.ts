import { Chat, type IChat } from "../db/chat.schema.js";
import type { IFunctionReturn } from "../types/types.js";

export async function getChats(
  userId: string,
): Promise<IFunctionReturn<IChat[] | null>> {
  try {
    const chats = await Chat.find({ "participants.userId": userId }, null, {
      sort: "-createdAt",
    });
    return {
      data: chats,
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

export async function getChat(
  id: string,
): Promise<IFunctionReturn<IChat | null>> {
  try {
    const data = await Chat.findById(id).lean();

    if (!data) throw Error("No record found");

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

export async function addUserToChat({
  data,
  userId,
}: {
  data: { name: string; email: string; userId: string }[];
  userId: string;
}): Promise<IFunctionReturn<IChat | null>> {
  try {
    if (data.length < 2) throw Error("2 users required for chat");
    const chat = await Chat.create({
      participants: data,
      lastMessage: {
        sender: userId,
        text: "",
        time: Date.now(),
      },
      unread: 0,
    });
    return {
      data: chat,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occured while adding user to chat",
      },
    };
  }
}
