import { User, type IUser } from "../db/users.schema.js";
import bcrypt from "bcrypt";
import type { IFunctionReturn } from "../types/types.js";

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<IFunctionReturn<null>> {
  try {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    await User.create({ name, email, hash, salt });
    return {
      data: null,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the user",
      },
    };
  }
}

export async function getUser({
  email,
}: {
  email: string;
}): Promise<IFunctionReturn<IUser | null>> {
  try {
    const user = await User.findOne({ email }).select("+hash +salt");
    return {
      data: user,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while retrieving the user",
      },
    };
  }
}

export async function getUserById({
  id,
}: {
  id: string;
}): Promise<IFunctionReturn<IUser | null>> {
  try {
    const user = await User.findById(id);
    return {
      data: user,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while retrieving the user",
      },
    };
  }
}
