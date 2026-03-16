import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { createUser } from "../controller/user.controller.js";
import { login, refresh } from "../controller/auth.controller.js";

const auth = Router();

auth.post(
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

    const { data, error: loginError } = await login({ email, password });
    if (loginError.isError) {
      return res.status(400).json({ error: error.message });
    }

    res
      .status(200)
      .json({ ...data })
      .end();
  },
);

auth.post(
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
      .json({ ...data })
      .end();
  },
);

auth.post(
  "/refresh",
  async (req: IRequest<null, { refreshToken: string }>, res: Response) => {
    const { refreshToken } = req.body;
    // Assuming you have a refreshToken function in auth.controller
    const { data, error } = await refresh(refreshToken);
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }
    res
      .status(200)
      .json({ ...data })
      .end();
  },
);
export default auth;
