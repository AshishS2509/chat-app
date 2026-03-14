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
import user from "./routes/user.routes.js";
import { addUserToChat, getChats } from "./controller/user.controller.js";

interface SocketMeta {
  id: string;
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
    origin: "http://localhost:5173",
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
    const token = req.cookies.token;
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

app.use("/user", user);

app.use((err: Error, req: IRequest, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req: IRequest, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server, path: "/wss" });

wss.on("listening", () => {
  console.log("Web socket server listening on path '/wss'");
});

wss.on("connection", async (socket: AuthedSocket, req) => {
  try {
    const cookies: Record<string, string> = {};

    (req.headers.cookie || "").split(";").forEach((cookie) => {
      const [key, ...v] = cookie.trim().split("=");
      if (!key) return;
      cookies[key] = decodeURIComponent(v.join("="));
    });

    const token = cookies.token;

    if (!token) throw new Error("Unauthorized");

    const { data, error } = await verifyToken(token);

    if (!data || error?.isError) {
      throw new Error("Unauthorized");
    }

    socket.meta = {
      ...data,
    };

    const chats = await getChats(data.id);

    socket.send(
      JSON.stringify({
        type: "INIT_CHATS",
        data: chats,
      }),
    );
  } catch (error: any) {
    console.error(error);

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
        const text = message.data.text;

        console.log(
          `User ${socket.meta.id} sent message to chat ${chatId} : ${text}`,
        );
      } else if (message.type === "NEW_CHAT") {
        const data = await addUserToChat({
          email: message.data.email as string,
          userId: socket.meta.id,
        });
        if (data.error.isError) {
          socket.send(JSON.stringify({ error: "Error Adding user to chat." }));
        }
        socket.send(
          JSON.stringify({ type: "NEW_CHAT", data: { success: true } }),
        );
      }
    } catch (err) {
      console.error("Invalid WS message:", err);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected:", socket.meta?.id);
  });
});
