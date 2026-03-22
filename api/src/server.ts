import express, { type Express } from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import auth from "./routes/auth.routes.js";
import { createServer } from "node:http";
import chats from "./routes/chats.routes.js";
import message from "./routes/message.router.js";
import { authMiddleWare } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { WebSocketServer } from "ws";
import type { AuthedSocket } from "./types/types.js";
import { onConnection } from "./socket/connection.handler.js";
import { onMessage } from "./socket/message.handler.js";
import helmet from "helmet";
import { pino } from "pino";

await connectDB();

// const REQUEST_ORIGIN = process.env.ORIGIN;
const PORT = process.env.PORT || 3000;

const app: Express = express();
export const server = createServer(app);
const logger = pino();

app.use(
  cors({
    origin: "*",
    // origin: REQUEST_ORIGIN
    //   ? REQUEST_ORIGIN.split(";")
    //   : ["http://localhost:5173"],
  }),
);
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pino);

app.use("/auth", auth);

app.use(authMiddleWare);

app.use("/chat", chats);
app.use("/messages", message);

app.use(errorHandler);

app.use(notFoundHandler);

server.listen(Number(PORT), () =>
  logger.info(`Server running on http://192.168.31.195:${PORT}`),
);

//====================================SOCKET====================================//

const wss = new WebSocketServer({ server, path: "/wss" });

wss.on("listening", () => {
  logger.info("Web socket server listening on path '/wss'");
});

wss.on("connection", async (socket: AuthedSocket, req) => {
  await onConnection(socket, req);

  socket.on("message", (raw) => onMessage(socket, wss.clients, raw));

  socket.on("close", () => {
    logger.info("Client disconnected: " + socket.meta?.id);
  });
});
