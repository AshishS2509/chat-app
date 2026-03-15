import { queryOptions } from "@tanstack/react-query";
import api from "../config";
import type { IChat, Message } from "../../types/data.types";

async function getChatList() {
  const data = await api.get<{ data: IChat[]; results: number }>("/user/chats");
  return data?.data ?? null;
}

async function getChatMessages(chatId: string) {
  const data = await api.get<{ data: Message[]; results: number }>(
    `messages/${chatId}`,
  );
  return data?.data ?? null;
}

export const userQueries = {
  all: ["user"] as const,
  getChatList: () =>
    queryOptions({
      queryKey: [...userQueries.all, "list"] as const,
      queryFn: getChatList,
    }),
  fetchMessages: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all, id],
      queryFn: () => getChatMessages(id),
    }),
};
