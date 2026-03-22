import { timingSafeEqual } from "crypto";
import { getUserByEmail } from "./user.controller.js";
import bcrypt from "bcrypt";
import type { IFunctionReturn } from "../types/types.js";
import { createJWT } from "../helpers/auth.helpers.js";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  IFunctionReturn<{
    access: string;
    refresh: string;
    user: { name: string; email: string; id: string };
  } | null>
> {
  try {
    const user = await getUserByEmail(email);
    if (user.error.isError || !user.data) {
      throw new Error(user.error.message || "Invalid email or password");
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
    const acc = createJWT(user.data.toJSON(), "access", "10min");
    const ref = createJWT(user.data.toJSON(), "refresh", "7d");

    const [access, refresh] = await Promise.all([acc, ref]);

    return {
      data: {
        access,
        refresh,
        user: {
          name: user.data.name,
          email: user.data.email,
          id: user.data._id.toString(),
        },
      },
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error) {
    console.log(error);
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
