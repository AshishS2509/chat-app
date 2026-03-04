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
import { getChats } from "./controller/user.controller.js";

const app: Express = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

dotenv.config();

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

wss.on("connection", async (socket, req) => {
  try {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...rest] = c.split("=");
        return [k?.trim(), rest.join("=").trim()];
      }),
    );
    const token = cookies.token;
    if (!token) throw new Error("Unauthorized", { cause: 401 });
    const { data, error } = await verifyToken(token);
    if (!data || error.isError) throw new Error("Unauthorized", { cause: 401 });
    const chats = await getChats(data.id);
    socket.send(JSON.stringify(chats));
  } catch (error: any) {
    console.log(error);
    return socket.close(
      error.cause ?? 401,
      JSON.stringify({
        error: {
          isError: true,
          message: "message" in error ? error.message : "Unhandled Exception",
        },
      }),
    );
  }
});
