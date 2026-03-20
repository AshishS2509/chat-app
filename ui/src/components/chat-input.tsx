import { useState, useRef, useCallback, useContext } from "react";
import { Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "../api/config";
import { userQueries } from "../api/queries/user.queries";
import { createLocalMongoId } from "../lib/utils";
import { AuthContext } from "../hooks/useAuth";

const ChatInput = ({
  activeChatId,
  receiverId,
  scrollToBottom,
}: {
  activeChatId: string | null;
  receiverId: string;
  scrollToBottom: () => void;
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const context = useContext(AuthContext);

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeChatId || !receiverId) return;
    context?.socket.current?.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        data: { chatId: activeChatId, receiverId, text: text.trim() },
      }),
    );
    queryClient.setQueryData(
      userQueries.fetchMessages(activeChatId).queryKey,
      (prev) => {
        return {
          data: [
            ...(prev?.data ?? []),
            {
              _id: createLocalMongoId(),
              chatId: activeChatId,
              senderId: context?.user?._id ?? "",
              text: text.trim(),
              timestamp: Date.now(),
            },
          ],
          results: (prev?.results ?? 0) + 1,
        };
      },
    );

    setText("");
    inputRef.current?.focus();
    scrollToBottom();
  }, [text, activeChatId, receiverId, context, scrollToBottom]);

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
