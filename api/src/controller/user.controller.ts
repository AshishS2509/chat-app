import { User, type IUser } from "../db/users.schema.js";
import bcrypt from "bcrypt";
import type { IFunctionReturn } from "../types/types.js";
import { Chat, type IChat } from "../db/chat.schema.js";

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

export async function addUserToChat({
  email,
  user,
}: {
  email: string;
  user: string;
}): Promise<IFunctionReturn<IChat | null>> {
  try {
    const chatUser = await User.findOne({ email });

    if (!chatUser) {
      throw new Error("User not found");
    }
    const avatar = chatUser.name.charAt(0).toUpperCase();
    const chat = await Chat.create({
      name: chatUser.name,
      email: chatUser.email,
      user,
      avatar,
      unread: 0,
    });
    console.log(`Chat created with id ${chat._id} for user ${user}`);
    return {
      data: chat,
      error: {
        isError: false,
        message: "",
      },
    };
  } catch (error) {
    console.error(
      `Error adding user ${email} to chat for user ${user}:`,
      error,
    );
    return {
      data: null,
      error: {
        isError: true,
        message:
          error instanceof Error
            ? error.message
            : "An error occured while adding user to chat",
      },
    };
  }
}
