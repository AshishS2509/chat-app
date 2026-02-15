import { useAppDispatch, useAppSelector } from "../store";
import { addChat, setActiveChat } from "../store/chat-slice";
import { motion } from "framer-motion";
import { Search, MessageSquarePlus, EllipsisVertical, X } from "lucide-react";
import { useEffect, useState } from "react";
import { addUserToChat } from "../api/chat";
import { logout as logoutApi } from "../api/auth";
import { logout } from "../store/auth-slice";

const ChatSidebar = () => {
  const dispatch = useAppDispatch();
  const { chats, activeChatId } = useAppSelector((s) => s.chat);
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
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

  async function addToChat(email: string) {
    if (!email.trim()) return;
    const chat = await addUserToChat(email.trim());
    if (chat) dispatch(addChat(chat));
  }

  function onLogout() {
    logoutApi();
    dispatch(logout());
  }

  return (
    <div className="w-80 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Messages</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-200 text-black transition"
          >
            <EllipsisVertical className="w-5 h-5" />
          </button>
          <div className="relative">
            {showMenu && (
              <div
                className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-lg shadow-lg z-50"
                onClick={() => setShowMenu(false)}
              >
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t"
                  onClick={() => onLogout()}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
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
      {showModal && (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">Start New Chat</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="email"
              placeholder="Search users..."
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.currentTarget.value)
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4 focus:ring-2 transition"
            />
            <button
              onClick={() => {
                addToChat(email);
                setShowModal(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
            >
              Start Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
