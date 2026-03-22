import type WebSocket from "ws";
import { createMessage } from "../controller/message.controller.js";
import type {
  AuthedSocket,
  TChatParams,
  TMessage,
  TMessageParams,
} from "../types/types.js";
import type { WebSocketServer } from "ws";
import { addUserToChat } from "../controller/chat.controller.js";
import { getUserByEmail } from "../controller/user.controller.js";

async function sendMessageHandler(
  message: TMessageParams,
  userId: string,
  clients: WebSocketServer["clients"],
) {
  const chatId = message.chatId;
  const receiverId = message.receiverId;
  const text = message.text;

  const data = await createMessage({
    userId,
    chatId,
    text,
  });
  clients.forEach((cli: AuthedSocket) => {
    console.log(cli.meta?.id, receiverId);
    if (cli.meta?.id === receiverId)
      cli.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          data: data.data?.toJSON(),
        }),
      );
  });
  console.log(`User ${userId} sent message to chat ${chatId} : ${text}`);
}

async function newChatHandler(
  message: TChatParams,
  socket: AuthedSocket,
  clients: WebSocketServer["clients"],
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
      data: {
        ...data.data?.toJSON(),
        participants: data.data?.participants.filter(
          (p) => p.userId !== socket.meta?.id,
        )[0],
      },
    }),
  );
  clients.forEach((cli: AuthedSocket) => {
    if (cli.meta?.id === user.data?._id.toString()) {
      cli.send(
        JSON.stringify({
          type: "NEW_CHAT",
          data: {
            ...data.data?.toJSON(),
            participants: data.data?.participants.filter(
              (p) => p.userId === socket.meta?.id,
            )[0],
          },
        }),
      );
    }
  });
}

export async function onMessage(
  socket: AuthedSocket,
  clients: WebSocketServer["clients"],
  raw: WebSocket.RawData,
) {
  try {
    if (!socket.meta) throw Error("Unauthorized");

    const message: TMessage = JSON.parse(raw.toString());

    if (message.type === "SEND_MESSAGE") {
      await sendMessageHandler(message.data, socket.meta.id, clients);
    } else if (message.type === "NEW_CHAT") {
      await newChatHandler(message.data, socket, clients);
    }
  } catch (err: any) {
    console.error("Invalid WS message:", err.message);
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
