import { timingSafeEqual } from "crypto";
import { getUser } from "./user.controller.js";
import bcrypt from "bcrypt";
import { jwtVerify, SignJWT } from "jose";
import { config } from "dotenv";
import type { IFunctionReturn } from "../types/types.js";

config();
const JWT_SECRET = process.env.JWT_SECRET;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  IFunctionReturn<{
    token: string;
    user: { name: string; email: string };
  } | null>
> {
  try {
    const user = await getUser({ email });
    if (user.error.isError || !user.data) {
      throw new Error(user.error.message || "User not found");
    }
    const salt = user.data?.salt;
    const hash = await bcrypt.hash(password, salt!);
    const isValid = timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(user.data.hash),
    );
    if (!isValid) {
      throw new Error("Invalid email or password");
    }
    const token = await new SignJWT({
      email: user.data.email,
      name: user.data.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(new TextEncoder().encode(JWT_SECRET!));
    return {
      data: { token, user: { name: user.data.name, email: user.data.email } },
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
            : "An error occurred during login",
      },
    };
  }
}

export async function verifyToken(
  token: string,
): Promise<IFunctionReturn<{ name: string; email: string } | null>> {
  try {
    const { payload }: { payload: { name: string; email: string } } =
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
