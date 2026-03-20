import express, {
  type Express,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import type { AuthedSocket, IRequest } from "./types/types.js";
import auth from "./routes/auth.routes.js";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import chats from "./routes/chats.routes.js";
import message from "./routes/message.router.js";
import { onConnection } from "./socket/connection.handler.js";
import { onMessage } from "./socket/message.handler.js";
import { authMiddleWare } from "./middlewares/auth.middleware.js";

await connectDB();
const app: Express = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

dotenv.config({ quiet: true });

const REQUEST_ORIGIN = process.env.ORIGIN;

app.use(
  cors({
    origin: REQUEST_ORIGIN
      ? REQUEST_ORIGIN.split(";")
      : ["http://localhost:5173"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", auth);

app.use(authMiddleWare);

app.use("/chat", chats);
app.use("/messages", message);

app.use((err: Error, _req: IRequest, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((_req: IRequest, res: Response) => {
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
  onConnection(socket, req);

  console.log("===>", socket.meta);

  socket.on("message", (raw) => onMessage(socket, wss.clients, raw));

  socket.on("close", () => {
    console.log("Client disconnected:", socket.meta?.id);
  });
});
