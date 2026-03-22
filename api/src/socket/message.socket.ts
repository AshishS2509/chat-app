import { createMessage } from "../controller/message.controller.js";
import type {
  AuthedSocket,
  TChatParams,
  TMessage,
  TMessageParams,
  WSS,
} from "../types/types.js";
import { addUserToChat } from "../controller/chat.controller.js";
import { getUserByEmail } from "../controller/user.controller.js";
import { logger } from "../helpers/logger.helper.js";

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
  wss.connections?.get(receiverId)?.send(
    JSON.stringify({
      type: "SEND_MESSAGE",
      data: data.data,
    }),
  );
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
    socket.send(JSON.stringify({ error: "Error Adding user to chat." }));
  }
  socket.send(
    JSON.stringify({
      type: "NEW_CHAT",
      data: data.data,
    }),
  );
  wss.connections?.get(user.data?._id.toString())?.send(
    JSON.stringify({
      type: "NEW_CHAT",
      data: data.data,
    }),
  );
}

export async function onMessage(
  socket: AuthedSocket,
  message: TMessage,
  wss: WSS,
) {
  try {
    if (!socket.meta) throw Error("Unauthorized");

    if (message.type === "SEND_MESSAGE") {
      await sendMessageHandler(message.data, socket.meta.id, wss);
    } else if (message.type === "NEW_CHAT") {
      await newChatHandler(message.data, socket, wss);
    }
  } catch (err: any) {
    logger.error(err.message);
    socket.close(
      1008,
      JSON.stringify({
        error: {
          isError: true,
          message: err?.message || "Unhandled Exception",
        },
      }),
    );
  }
}
