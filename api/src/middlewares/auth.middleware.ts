import type { NextFunction, Response } from "express";
import type { IFunctionReturn, IRequest } from "../types/types.js";
import { jwtVerify } from "jose/jwt/verify";
import { config } from "dotenv";
import { SignJWT } from "jose/jwt/sign";
import { createJWT } from "../helpers/auth.helpers.js";
import type { IUser } from "../db/users.schema.js";

config();
const JWT_SECRET = process.env.JWT_SECRET;

export async function authMiddleWare(
  req: IRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

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
}

export async function verifyToken(
  token: string,
): Promise<
  IFunctionReturn<{ name: string; email: string; id: string } | null>
> {
  try {
    const {
      payload,
    }: { payload: { name: string; email: string; id: string } } =
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET!));
    return {
      data: payload,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during token verification",
      },
    };
  }
}

export async function refresh(token: string): Promise<
  IFunctionReturn<{
    access: string;
  } | null>
> {
  try {
    const {
      payload,
    }: {
      payload: {
        name: string;
        email: string;
        id: string;
        scope: "access" | "refresh";
      };
    } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET!));
    const access = await createJWT(
      { ...payload, _id: payload.id },
      "access",
      "5min",
    );
    return {
      data: {
        access,
      },
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during refresh",
      },
    };
  }
}
