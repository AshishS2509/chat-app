import { User } from "../db/users.schema.js";

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await User.create({ name, email, password });
    return 200;
  } catch (error) {
    return 500;
  }
}
