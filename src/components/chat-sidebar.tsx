import { useAppDispatch, useAppSelector } from "../store";
import { setActiveChat } from "../store/chat-slice";
import { motion } from "framer-motion";
import { Search, MessageSquarePlus } from "lucide-react";
import { useEffect, useState } from "react";

const ChatSidebar = () => {
  const dispatch = useAppDispatch();
  const { chats, activeChatId } = useAppSelector((s) => s.chat);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="w-80 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-green-300">
        <h1 className="text-xl font-bold">Messages</h1>
        <button className="p-2 rounded-lg transition-colors">
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-gray-100 w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 transition-all"
          />
        </div>
      </div>
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin  border-b-2">
        {filtered.map((chat, i) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => dispatch(setActiveChat(chat.id))}
            data-chat-id={chat.id}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              activeChatId === chat.id
                ? "bg-gray-200 border-r-2 border-primary"
                : "hover:bg-gray-300"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-sm font-semibold">
                {chat.avatar}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">
                  {chat.name}
                </span>
                <span className="text-[11px] ml-2 shrink-0">
                  {formatTime(chat.lastMessageTime)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs truncate">{chat.lastMessage}</span>
                {chat.unread > 0 && (
                  <span className="ml-2 shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
