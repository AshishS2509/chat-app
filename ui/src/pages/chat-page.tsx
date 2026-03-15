import { useEffect, useRef, useState } from "react";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useNavigate } from "react-router";
import { getUserData, setUserData } from "../lib/user.localStorage";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../api/queries/user.queries";
import { queryClient } from "../api/config";
import type { IChat, Message } from "../types/data.types";
const Index = () => {
  const navigate = useNavigate();
  const socket = useRef<WebSocket | null>(null);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const { data } = useQuery(userQueries.getChatList(), queryClient);

  useEffect(() => {
    const user = getUserData();

    if (!user?.isLoggedIn) {
      navigate("/login");
      return;
    }

    if (socket.current) return;

    const ws = new WebSocket("ws://localhost:3000/wss");
    socket.current = ws;

    ws.addEventListener("message", (ev) => {
      const parsedData: { type: string; data: IChat | Message } = JSON.parse(
        ev.data,
      );
      if (parsedData.type === "NEW_CHAT") {
        const newChat = parsedData.data as IChat;
        queryClient.setQueryData(userQueries.getChatList().queryKey, (prev) => {
          if (!prev) return prev;
          return {
            data: [newChat, ...prev.data],
            results: prev.results + 1,
          };
        });
      }
      if (parsedData.type === "SEND_MESSAGE") {
        if (!currentChat?._id) return;
        const newMessage = parsedData.data as Message;
        queryClient.setQueryData(
          userQueries.fetchMessages(currentChat?._id).queryKey,
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

    ws.addEventListener("close", () => {
      setUserData({ email: "", name: "", isLoggedIn: false });
      navigate("/login");
    });
  }, [currentChat?._id, navigate]);

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
