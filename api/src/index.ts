import express, {
  type Express,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { createUser } from "./controller/user.controller.js";
import { login, verifyToken } from "./controller/auth.controller.js";
import cookieParser from "cookie-parser";
import type { IRequest } from "./types/types.js";

const app: Express = express();
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

app.post(
  "/register",
  async (
    req: IRequest<null, { name: string; email: string; password: string }>,
    res: Response,
  ) => {
    const { name, email, password } = req.body;
    const { error } = await createUser({ name, email, password });
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: "User created successfully" }).end();
  },
);

app.post(
  "/login",
  async (
    req: IRequest<null, { email: string; password: string }>,
    res: Response,
  ) => {
    const { email, password } = req.body;
    const { data, error } = await login({ email, password });
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }
    res
      .status(200)
      .cookie("token", data?.token, { httpOnly: false, sameSite: "lax" })
      .json({ user: data?.user })
      .end();
  },
);

app.post("/logout", (req: IRequest, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out successfully" }).end();
});

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

    req.meta = { id: data?.id ?? "", user: data?.email ?? "" };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.use((err: Error, req: IRequest, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req: IRequest, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
