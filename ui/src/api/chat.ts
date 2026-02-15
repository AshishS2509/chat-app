import type { Chat } from "../store/chat-slice";
import api from "./api";

export async function addUserToChat(email: string) {
  try {
    const resp = await api.post<{ data: Chat }>("/add-to-chat", { email });
    return resp.data.data;
  } catch {
    alert("Failed to add user to chat");
  }
}
