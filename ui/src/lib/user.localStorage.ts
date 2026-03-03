import type { TUser } from "../types/auth.types";

export const getUserData = () => {
  return JSON.parse(localStorage.getItem("user") as string) as TUser;
};

export const setUserData = (data: TUser) => {
  localStorage.setItem("user", JSON.stringify(data));
};

export const clearUserData = () => {
  localStorage.removeItem("user");
};
