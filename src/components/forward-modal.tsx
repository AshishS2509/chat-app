import { useAppDispatch, useAppSelector } from "../store";
import { forwardMessage, type Message } from "../store/chat-slice";
import { motion } from "framer-motion";
import { X, Forward } from "lucide-react";

interface Props {
  message: Message;
  onClose: () => void;
}

const ForwardModal = ({ message, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { chats } = useAppSelector((s) => s.chat);
  const otherChats = chats.filter((c) => c.id !== message.chatId);

  const handleForward = (toChatId: string) => {
    dispatch(forwardMessage({ message, toChatId }));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 backdrop-blur-sm z-30 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl shadow-xl border w-80 max-h-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Forward className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Forward message</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
          {otherChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleForward(chat.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold">
                {chat.avatar}
              </div>
              <span className="text-sm font-medium">{chat.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForwardModal;
