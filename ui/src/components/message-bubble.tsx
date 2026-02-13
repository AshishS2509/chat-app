import { type Message } from "../store/chat-slice";
import { motion } from "framer-motion";
import { Forward, CornerUpRight } from "lucide-react";
import { useState } from "react";

interface Props {
  message: Message;
  isOwn: boolean;
  onDragStart: (msg: Message) => void;
}

const MessageBubble = ({ message, isOwn, onDragStart }: Props) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 group px-12`}
    >
      <div
        className={`relative max-w-[70%] ${isOwn ? "bg-fuchsia-100" : "bg-gray-200"} rounded-2xl px-4 `}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setTimeout(() => setShowActions(false), 800)}
      >
        {/* Forward action */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isOwn ? "-left-10" : "-right-10"
            }`}
          >
            <button
              className="p-1.5 rounded-full transition-colors cursor-grab"
              draggable
              onDragStart={(e: React.DragEvent<HTMLButtonElement>) => {
                e.dataTransfer.setData("message", JSON.stringify(message));
                onDragStart(message);
              }}
              title="Drag to forward"
            >
              <CornerUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 ${
            isOwn ? " rounded-br-md" : " rounded-bl-md"
          }`}
        >
          {message.forwarded && (
            <div className={`flex items-center gap-1 text-[11px] mb-1`}>
              <Forward className="w-3 h-3" />
              Forwarded from {message.forwardedFrom}
            </div>
          )}
          {message.text && (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}

          <p className={`text-[10px] mt-1 text-right`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
