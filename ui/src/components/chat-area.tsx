import { useAppDispatch, useAppSelector } from "../store";
import { receiveMessage, type Message } from "../store/chat-slice";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import MessageBubble from "./message-bubble";
import ForwardModal from "./forward-modal";
import ChatInput from "./chat-input";

const REPLIES = [
  "That's interesting! Tell me more.",
  "I totally agree with you on that.",
  "Haha, nice one! 😄",
  "Let me think about that...",
  "Sounds like a plan! 🎉",
  "Got it, thanks for letting me know.",
  "I'll get back to you on that.",
  "That's awesome!",
];

const ChatArea = () => {
  const dispatch = useAppDispatch();
  const { chats, messages, activeChatId, currentUserId } = useAppSelector(
    (s) => s.chat,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [forwardTarget, setForwardTarget] = useState<Message | null>(null);
  const [isDragOverChat, setIsDragOverChat] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const chatMessages = useMemo(
    () => (activeChatId ? messages[activeChatId] || [] : []),
    [activeChatId, messages],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, scrollToBottom]);

  // Simulate replies
  useEffect(() => {
    if (!activeChatId || chatMessages.length === 0) return;
    const last = chatMessages[chatMessages.length - 1];
    if (last.senderId !== currentUserId) return;

    const replyTimeout = setTimeout(
      () => {
        dispatch(
          receiveMessage({
            id: `reply-${Date.now()}`,
            chatId: activeChatId,
            senderId: activeChatId,
            text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
            timestamp: Date.now(),
            type: "text",
          }),
        );
      },
      1500 + Math.random() * 1000,
    );

    return () => {
      clearTimeout(replyTimeout);
    };
  }, [
    chatMessages.length,
    activeChatId,
    currentUserId,
    dispatch,
    chatMessages,
  ]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverChat(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverChat(false);
    const msgData = e.dataTransfer.getData("message");
    if (msgData) {
      const msg = JSON.parse(msgData) as Message;
      setForwardTarget(msg);
    }
  };

  if (!activeChatId || !activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Select a conversation</h2>
          <p className="text-sm mt-1">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOverChat(false)}
      onDrop={handleDrop}
    >
      <div className="px-6 py-3.5 flex items-center justify-between bg-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-sm font-semibold">
              {activeChat.avatar}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-sm">{activeChat.name}</h2>
            <p className="text-xs">
              {activeChat.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Drop overlay */}
      <AnimatePresence>
        {isDragOverChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 border-2 border-dashed rounded-lg flex items-center justify-center pointer-events-none"
          >
            <span className="font-semibold text-lg">
              Drop to forward message
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 w-full bg-[#fffafc] relative"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(255,182,193,0.4) 6px, transparent 0),
        radial-gradient(circle at 80% 30%, rgba(173,216,230,0.4) 8px, transparent 0),
        radial-gradient(circle at 40% 70%, rgba(255,223,186,0.5) 10px, transparent 0),
        radial-gradient(circle at 70% 80%, rgba(186,255,201,0.4) 7px, transparent 0)
      `,
          }}
        />
        {chatMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            onDragStart={() => {}}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-3 rounded-full shadow-lg bg-gray-100 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatInput />

      {/* Forward modal */}
      {forwardTarget && (
        <ForwardModal
          message={forwardTarget}
          onClose={() => setForwardTarget(null)}
        />
      )}
    </div>
  );
};

export default ChatArea;
