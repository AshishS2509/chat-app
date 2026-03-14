import { useEffect, useRef, useState } from "react";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useNavigate } from "react-router";
import { getUserData, setUserData } from "../lib/user.localStorage";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../api/queries/user.queries";
import { queryClient } from "../api/config";
import type { IChat } from "../types/data.types";
const Index = () => {
  const navigate = useNavigate();
  const socket = useRef<WebSocket | null>(null);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);

  const { data } = useQuery(userQueries.getChatList(), queryClient);

  useEffect(() => {
    const user = getUserData();
    if (!user?.isLoggedIn) {
      navigate("/login");
    }

    socket.current = new WebSocket("ws://localhost:3000/wss");
    socket.current.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data);
      if (data.data.success)
        queryClient.refetchQueries({
          queryKey: userQueries.getChatList().queryKey,
        });
    });
    socket.current.addEventListener("close", () => {
      setUserData({ email: "", name: "", isLoggedIn: false });
      navigate("/login");
    });
  }, [navigate]);

  function handleCurrentChat(id: string) {
    const chat = data?.data.find((i) => i._id === id);
    if (chat) setCurrentChat(chat);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ChatSidebar
        handleCurrentChat={handleCurrentChat}
        socket={socket}
        chats={data?.data || []}
        active=""
      />
      <ChatArea socket={socket} currentChat={currentChat} />
    </div>
  );
};

export default Index;
