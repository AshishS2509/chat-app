import { Router, type Response } from "express";
import type { IRequest } from "../types/types.js";
import { createUser } from "../controller/user.controller.js";
import { login } from "../controller/auth.controller.js";
import { refresh } from "../helpers/auth.helpers.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type TLogin,
  type TRefresh,
  type TRegister,
} from "../types/auth.types.js";
import { validator } from "../middlewares/validator.middleware.js";

const auth = Router();

auth.post(
  "/register",
  validator({ body: registerSchema }),
  async (req: IRequest<null, TRegister>, res: Response) => {
    const { name, email, password } = req.body;

    const { error } = await createUser({ name, email, password });
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }

    const { data, error: loginError } = await login({ email, password });
    if (loginError.isError) {
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(200)
      .json({ ...data })
      .end();
  },
);

auth.post(
  "/login",
  validator({ body: loginSchema }),
  async (req: IRequest<null, TLogin>, res: Response) => {
    const { email, password } = req.body;
    const { data, error } = await login({ email, password });
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }
    return res
      .status(200)
      .json({ ...data })
      .end();
  },
);

auth.post(
  "/refresh",
  validator({ body: refreshSchema }),
  async (req: IRequest<null, TRefresh>, res: Response) => {
    const { refreshToken } = req.body;
    const { data, error } = await refresh(refreshToken);
    if (error.isError) {
      return res.status(400).json({ error: error.message });
    }
    return res
      .status(200)
      .json({ ...data })
      .end();
  },
);

export default auth;
