import { useEffect, useRef, useState } from "react";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../api/queries/user.queries";
import api, { queryClient } from "../api/config";
import type { IChat } from "../types/data.types";
import { useAuth } from "../hooks/useAuth";
const Index = () => {
  const navigate = useNavigate();
  const socket = useRef<WebSocket | null>(null);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const { data } = useQuery(userQueries.getChatList(), queryClient);
  const { user, accessToken, updateUser, refreshToken, updateAccessToken } =
    useAuth();

  useEffect(() => {
    if (!user?.isLoggedIn || !accessToken) {
      navigate("/login");
      return;
    }

    if (socket.current) return;

    const connectSocket = (token: string) => {
      const ws = new WebSocket(`ws://192.168.31.195:3000/wss?token=${token}`);

      socket.current = ws;

      ws.addEventListener("message", (ev) => {
        const parsedData = JSON.parse(ev.data);

        if (parsedData.type === "NEW_CHAT") {
          const newChat = parsedData.data;

          queryClient.setQueryData(
            userQueries.getChatList().queryKey,
            (prev) => {
              if (!prev) return prev;

              return {
                data: [newChat, ...prev.data],
                results: prev.results + 1,
              };
            },
          );
        }

        if (parsedData.type === "SEND_MESSAGE") {
          const newMessage = parsedData.data;

          queryClient.setQueryData(
            userQueries.fetchMessages(newMessage.chatId).queryKey,
            (prev) => {
              if (!prev) return prev;

              return {
                data: [...prev.data, newMessage],
                results: (prev.results ?? 0) + 1,
              };
            },
          );
        }
      });

      ws.addEventListener("close", async (e) => {
        if (e.code === 1008) {
          try {
            const res = await api.post("/refresh", { refreshToken });

            const newAccessToken = res.data.token;
            updateAccessToken(newAccessToken);

            connectSocket(newAccessToken);
            return;
          } catch (err) {
            console.error("Token refresh failed:", err);
          }
        }

        updateUser({ _id: "", email: "", name: "", isLoggedIn: false });
        navigate("/login");
      });
    };

    connectSocket(accessToken);
  }, [
    user,
    navigate,
    accessToken,
    updateUser,
    refreshToken,
    updateAccessToken,
  ]);
  function handleCurrentChat(id: string) {
    const chat = data?.data.find((i) => i._id === id);
    if (chat) setCurrentChat(chat);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {data?.data && (
        <ChatSidebar
          handleCurrentChat={handleCurrentChat}
          socket={socket}
          chats={data?.data || []}
          active=""
        />
      )}
      {currentChat && <ChatArea socket={socket} currentChat={currentChat} />}
    </div>
  );
};

export default Index;
