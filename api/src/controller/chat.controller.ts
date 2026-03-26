import { Chat, type IChat } from "../db/chat.schema.js";
import type { IFunctionReturn } from "../types/types.js";
import { Types } from "mongoose";

function buildParticipantKey(userIds: string[]): string {
  return [...userIds].sort().join(":");
}

export async function getChats(
  userId: string,
): Promise<IFunctionReturn<IChat[] | null>> {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const chats = await Chat.find(
      {
        $or: [
          { "participants.userId": userObjectId },
          { "participants.userIdLegacy": userId },
        ],
      },
      null,
      {
        sort: "-updatedAt",
      },
    );
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
    if (data.length !== 2) throw Error("2 users required for chat");
    const participantIds = data.map((d) => d.userId);
    const participantKey = buildParticipantKey(participantIds);

    const existing = await Chat.findOne({ participantKey });
    if (existing) {
      return {
        data: existing,
        error: {
          isError: false,
          message: "",
        },
      };
    }

    const chat = await Chat.create({
      participants: data.map((participant) => ({
        userId: new Types.ObjectId(participant.userId),
        userIdLegacy: participant.userId,
        name: participant.name,
        email: participant.email,
      })),
      participantKey,
      lastMessage: {
        sender: new Types.ObjectId(userId),
        senderLegacy: userId,
        text: "",
        at: new Date(),
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
