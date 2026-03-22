import express, { type Express } from "express";
import cors from "cors";
import { connectDB, disconnect } from "./db/connection.js";
import auth from "./routes/auth.routes.js";
import { createServer } from "node:http";
import chats from "./routes/chats.routes.js";
import message from "./routes/message.router.js";
import { authMiddleWare } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { WebSocketServer } from "ws";
import helmet from "helmet";
import { logger, loggerOptions } from "./helpers/logger.helper.js";
import { pinoHttp } from "pino-http";
import { corsOptions } from "./helpers/cors.helper.js";
import { handleConnection, onListening } from "./socket/socket.js";
import type { WSS } from "./types/types.js";

await connectDB();

const PORT = Number(process.env.PORT || "3000");
const app: Express = express();
const server = createServer(app);

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp(loggerOptions));
app.use("/auth", auth);
app.use(authMiddleWare);
app.use("/chat", chats);
app.use("/messages", message);
app.use(errorHandler);
app.use(notFoundHandler);
server.listen(PORT, () => logger.info(`running on http://localhost:${PORT}`));

//====================================SOCKET====================================//

export const wss: WSS = new WebSocketServer({ server, path: "/wss" });
wss.connections = new Map();
wss.on("listening", onListening);
wss.on("connection", (s, r) => handleConnection(s, r, wss));

//====================================CLEANUP====================================//

process.on("SIGTERM", async () => {
  await disconnect();
  wss.clients.forEach((cli) => cli.close());
});

process.on("SIGINT", async () => {
  await disconnect();
  wss.clients.forEach((cli) => cli.close());
});
