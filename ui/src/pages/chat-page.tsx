import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";

const Index = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ChatSidebar />
      <ChatArea />
    </div>
  );
};

export default Index;
