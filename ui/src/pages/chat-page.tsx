import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../api/queries/user.queries";
import { queryClient } from "../api/config";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useState } from "react";
import ChatSidebar from "../components/chat-sidebar";
import ChatArea from "../components/chat-area";
const Index = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isLaptop } = useMediaQuery();
  const { data } = useQuery(userQueries.getChatList(), queryClient);

  function handleCurrentChat(id: string) {
    setCurrentChat(id);
    if (!isLaptop) navigate(`/chat/${id}`);
  }

  return (
    <div className={"flex h-screen w-screen overflow-hidden"}>
      {data?.data && (
        <ChatSidebar
          handleCurrentChat={handleCurrentChat}
          chats={data?.data || []}
          active={currentChat}
        />
      )}
      {currentChat && isLaptop && <ChatArea currentChatId={currentChat} />}
    </div>
  );
};

export default Index;
