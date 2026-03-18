import { useParams } from "react-router";
import ChatArea from "../components/chat-area";

const MobileChatPage = () => {
  const { id } = useParams();
  return (
    <div className="flex h-screen w-screen overflow-hidden justify-center">
      <ChatArea currentChatId={id as string} />;
    </div>
  );
};
export default MobileChatPage;
