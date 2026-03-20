import { SignJWT } from "jose/jwt/sign";
import type { IUser } from "../db/users.schema.js";
import { config } from "dotenv";

config();
const JWT_SECRET = process.env.JWT_SECRET;

type Scope = "access" | "refresh";

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
    .setExpirationTime("5min")
    .sign(new TextEncoder().encode(JWT_SECRET!));
}
