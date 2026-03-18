import { queryOptions } from "@tanstack/react-query";
import api from "../config";
import type { IChat, Message } from "../../types/data.types";

async function getChatList() {
  const data = await api.get<{ data: IChat[]; results: number }>("/chat/list");
  return data?.data ?? null;
}

async function getChat(id: string) {
  const data = await api.get<{
    data: IChat;
    error: { isError: boolean; message: string };
  }>(`chat/${id}`);
  return data.data;
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
  getChat: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all, id],
      queryFn: () => getChat(id),
      enabled: !!id,
    }),
  fetchMessages: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all, "message", id],
      queryFn: () => getChatMessages(id),
      enabled: !!id,
    }),
};
