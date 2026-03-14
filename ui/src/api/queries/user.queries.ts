import { queryOptions } from "@tanstack/react-query";
import api from "../config";
import type { IChat } from "../../types/data.types";

async function getChatList() {
  const data = await api.get<{ data: IChat[]; results: number }>("/user/chats");

  return data?.data ?? null;
}

export const userQueries = {
  all: ["user"],
  getChatList: () =>
    queryOptions({
      queryKey: [...userQueries.all, "list"],
      queryFn: getChatList,
    }),
};
