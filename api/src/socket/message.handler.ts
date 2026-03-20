import type WebSocket from "ws";
import { sendMessage } from "../controller/message.controller.js";
import type { AuthedSocket } from "../types/types.js";
import type { WebSocketServer } from "ws";
import { addUserToChat } from "../controller/chat.controller.js";
import { getUserByEmail } from "../controller/user.controller.js";

export async function onMessage(
  socket: AuthedSocket,
  clients: WebSocketServer["clients"],
  raw: any,
) {
  try {
    if (!socket.meta) {
      socket.close(1008, "Unauthorized");
      return;
    }

    const message = JSON.parse(raw.toString());

    console.log("User:", socket.meta.id);
    console.log("Message:", message);

    if (message.type === "SEND_MESSAGE") {
      const chatId = message.data.chatId;
      const receiverId = message.data.receiverId;
      const text = message.data.text;

      const data = await sendMessage({
        userId: socket.meta.id,
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
      console.log(
        `User ${socket.meta.id} sent message to chat ${chatId} : ${text}`,
      );
    } else if (message.type === "NEW_CHAT") {
      const user = await getUserByEmail(message.data.email);
      if (!user.data) throw Error("No user found!");

      const data = await addUserToChat({
        data: [
          { ...socket.meta, userId: socket.meta.id },
          {
            userId: user.data._id.toString(),
            email: user.data.email,
            name: user.data.name,
          },
        ],
        userId: socket.meta.id,
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
  } catch (err) {
    console.error("Invalid WS message:", err);
  }
}
