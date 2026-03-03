import { useEffect } from "react";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useNavigate } from "react-router";
import { getUserData } from "../lib/user.localStorage";
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserData()

    if (!user?.isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ChatSidebar />
      <ChatArea />
    </div>
  );
};

export default Index;
