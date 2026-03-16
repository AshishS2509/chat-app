import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { createUser } from "../controller/user.controller.js";
import { login } from "../controller/auth.controller.js";

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
      .cookie("token", data?.token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      })
      .json({ user: data?.user })
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
      .cookie("token", data?.token, { httpOnly: false })
      .json({ user: data?.user })
      .end();
  },
);

auth.post("/logout", (req: IRequest, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out successfully" }).end();
});

export default auth;
