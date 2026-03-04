import { useEffect } from "react";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useNavigate } from "react-router";
import { getUserData } from "../lib/user.localStorage";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../api/queries/user.queries";
import { queryClient } from "../api/config";
const Index = () => {
  const navigate = useNavigate();

  const { data } = useQuery(userQueries.getChatList(), queryClient);

  useEffect(() => {
    const user = getUserData();

    const wss = new WebSocket("ws://localhost:3000/wss");

    wss.addEventListener("message", (event) => {
      console.log(event);
    });

    wss.onmessage = (ev: MessageEvent<string>) => {
      console.log(ev);
    };

    if (!user?.isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ChatSidebar chats={data?.data || []} active="" />
      <ChatArea />
    </div>
  );
};

export default Index;
