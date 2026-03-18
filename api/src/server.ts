import express, {
  type Express,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { verifyToken } from "./controller/auth.controller.js";
import cookieParser from "cookie-parser";
import type { IRequest } from "./types/types.js";
import auth from "./routes/auth.routes.js";
import { createServer } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import chats from "./routes/chats.routes.js";
import { addUserToChat, getChats } from "./controller/chat.controller.js";
import { sendMessage } from "./controller/message.controller.js";
import { getUser } from "./controller/user.controller.js";
import message from "./routes/message.router.js";

interface SocketMeta {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthedSocket extends WebSocket {
  meta?: SocketMeta;
}

const app: Express = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

dotenv.config({ quiet: true });

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.31.195:5173"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await connectDB();

app.use("/", auth);

app.use(async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { data, error } = await verifyToken(token);

    if (error.isError) {
      return res.status(401).json({ error: error.message });
    }

    req.meta = { id: data?.id ?? "", email: data?.email ?? "" };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.use("/chat", chats);
app.use("/messages", message);

app.use((err: Error, req: IRequest, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req: IRequest, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

server.listen(Number(PORT), "192.168.31.195", () => {
  console.log(`Server running on http://192.168.31.195:${PORT}`);
});

const wss = new WebSocketServer({ server, path: "/wss" });

wss.on("listening", () => {
  console.log("Web socket server listening on path '/wss'");
});

wss.on("connection", async (socket: AuthedSocket, req) => {
  try {
    const url = new URL(req.url!, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) throw new Error("Unauthorized");

    const { data, error } = await verifyToken(token);

    if (!data || error?.isError) {
      throw new Error("Unauthorized");
    }

    socket.meta = {
      ...data,
    };
    console.log("Client Connected: ", socket.meta.id);

    const chats = await getChats(data.id);

    socket.send(
      JSON.stringify({
        type: "INIT_CHATS",
        data: chats,
      }),
    );
  } catch (error: any) {
    console.error(error.message);

    socket.close(
      1008,
      JSON.stringify({
        error: {
          isError: true,
          message: error?.message || "Unhandled Exception",
        },
      }),
    );

    return;
  }

  socket.on("message", async (raw) => {
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
        wss.clients.forEach((cli: AuthedSocket) => {
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
        const user = await getUser({ email: message.data.email });
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
        wss.clients.forEach((cli: AuthedSocket) => {
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
  });

  socket.on("close", () => {
    console.log("Client disconnected:", socket.meta?.id);
  });
});
