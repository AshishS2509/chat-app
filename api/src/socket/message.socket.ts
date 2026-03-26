import { createMessage } from "../controller/message.controller.js";
import type { AuthedSocket, WSS } from "../types/types.js";
import { addUserToChat } from "../controller/chat.controller.js";
import { getUserByEmail } from "../controller/user.controller.js";
import { logger } from "../helpers/logger.helper.js";
import type {
  TChatParams,
  TMessage,
  TMessageParams,
} from "../types/socket.types.js";
import { safeClose, safeSend } from "./ws.utils.js";

async function sendMessageHandler(
  message: TMessageParams,
  userId: string,
  wss: WSS,
) {
  const chatId = message.chatId;
  const receiverId = message.receiverId;
  const text = message.text;

  const data = await createMessage({
    userId,
    chatId,
    text,
  });

  const receiverSocket = wss.connections.get(receiverId);
  if (!receiverSocket) return;

  safeSend(receiverSocket, {
    type: "SEND_MESSAGE",
    data: data.data,
  });
}

async function newChatHandler(
  message: TChatParams,
  socket: AuthedSocket,
  wss: WSS,
) {
  const user = await getUserByEmail(message.email);
  if (!user.data) throw Error("No user found!");

  const data = await addUserToChat({
    data: [
      {
        email: socket.meta?.email ?? "",
        name: socket.meta?.name ?? "",
        userId: socket.meta?.id ?? "",
      },
      {
        userId: user.data._id.toString(),
        email: user.data.email,
        name: user.data.name,
      },
    ],
    userId: socket.meta?.id ?? "",
  });
  if (data.error.isError) {
    safeSend(socket, { error: "Error Adding user to chat." });
    return;
  }

  safeSend(socket, {
    type: "NEW_CHAT",
    data: data.data,
  });

  const invitedUserSocket = wss.connections.get(user.data._id.toString());
  if (!invitedUserSocket) return;

  safeSend(invitedUserSocket, {
    type: "NEW_CHAT",
    data: data.data,
  });
}

export async function onMessage(
  socket: AuthedSocket,
  message: TMessage,
  wss: WSS,
) {
  try {
    if (!socket.meta) throw new Error("Unauthorized");

    switch (message.type) {
      case "SEND_MESSAGE":
        await sendMessageHandler(message.data, socket.meta.id, wss);
        break;
      case "NEW_CHAT":
        await newChatHandler(message.data, socket, wss);
        break;
      default: {
        const unreachable: never = message;
        throw new Error(`Unsupported message type: ${String(unreachable)}`);
      }
    }
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Unhandled Exception";
    logger.error(messageText);
    safeClose(socket, 1008, {
      error: {
        isError: true,
        message: messageText,
      },
    });
  }
}
