import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { createUser } from "./controller/user.controller.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await connectDB();

app.post(
  "/register",
  async (
    req: Request<null, null, { name: string; email: string; password: string }>,
    res: Response,
  ) => {
    const { name, email, password } = req.body;
    const status = await createUser({ name, email, password });
    res
      .status(status)
      .json({
        message: status === 200 ? "User created" : "Error creating user",
      });
  },
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
