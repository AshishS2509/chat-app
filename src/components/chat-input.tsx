import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store";
import { sendMessage, updateDraft } from "../store/chat-slice";

const ChatInput = () => {
  const dispatch = useAppDispatch();
  const { activeChatId, drafts } = useAppSelector((s) => s.chat);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeChatId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(drafts[activeChatId] || "");
    }
  }, [activeChatId, drafts]);

  useEffect(() => {
    if (activeChatId) {
      const timeout = setTimeout(() => {
        dispatch(updateDraft({ chatId: activeChatId, text }));
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [text, activeChatId, dispatch]);

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeChatId) return;
    dispatch(sendMessage({ chatId: activeChatId, text: text.trim() }));
    setText("");
    inputRef.current?.focus();
  }, [text, activeChatId, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeChatId) return null;

  return (
    <div className="p-4 ">
      <div className="pl-6 flex items-end gap-2 rounded-2xl border border-gray-600 p-2 transition-all focus-within:ring-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 text-sm outline-none max-h-32 py-2"
        />

        <button className="p-2 rounded-xl transition-colors text-gray-400">
          <Smile className="w-5 h-5" />
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 rounded-xl disabled:opacity-40 transition-all hover:brightness-110"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;
