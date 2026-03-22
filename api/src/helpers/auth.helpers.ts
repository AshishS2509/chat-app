import { SignJWT } from "jose/jwt/sign";
import type { IUser } from "../db/users.schema.js";
import type { IFunctionReturn, Scope } from "../types/types.js";
import { jwtVerify } from "jose/jwt/verify";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw Error("Missing JWT Secret");

export async function createJWT(
  user: Pick<IUser, "name" | "email"> & { _id: string },
  scope: Scope,
  exp: string,
) {
  return await new SignJWT({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    scope: scope,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(JWT_SECRET!));
}

export async function verifyToken(
  token: string,
): Promise<
  IFunctionReturn<{ name: string; email: string; id: string } | null>
> {
  try {
    const {
      payload,
    }: { payload: { name: string; email: string; id: string; scope: Scope } } =
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

    if (payload.scope !== "refresh") throw Error("Unauthorized");

    const access = await createJWT(
      { ...payload, _id: payload.id },
      "access",
      "10min",
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
