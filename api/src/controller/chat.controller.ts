import { Chat, type IChat } from "../db/chat.schema.js";
import type { IFunctionReturn } from "../types/types.js";

export async function getChats(userId: string) {
  try {
    const chats = await Chat.aggregate([
      { $match: { "participants.userId": userId } },
      {
        $addFields: {
          participants: {
            $filter: {
              input: "$participants",
              as: "participant",
              cond: { $ne: ["$$participant.userId", userId] },
            },
          },
        },
      },
      { $unwind: "$participants" },
      { $sort: { createdAt: -1 } },
    ]);
    return {
      data: chats,
      results: chats.length,
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

export async function getChat(id: string, userId: string) {
  try {
    const data = await Chat.findById(id).lean();

    if (!data) throw Error("No record found");

    const chat = {
      ...data,
      participants: data.participants.find((p) => p.userId !== userId),
    };

    return {
      data: chat,
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
    console.error(`Error adding user to chat for user ${userId}:`, error);
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
