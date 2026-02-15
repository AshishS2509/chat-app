import { useNavigate } from "react-router";
import ChatArea from "../components/chat-area";
import ChatSidebar from "../components/chat-sidebar";
import { useAppSelector } from "../store";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ChatSidebar />
      <ChatArea />
    </div>
  );
};

export default Index;
