import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: "text" | "image" | "video";
  forwarded?: boolean;
  forwardedFrom?: string;
}

export interface Chat {
  email: string;
  user: string;
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: number;
  online: boolean;
  unread: number;
}

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  currentUserId: string;
}

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      chatId: "1",
      senderId: "1",
      text: "Hey! How are you?",
      timestamp: Date.now() - 120000,
      type: "text",
    },
    {
      id: "m2",
      chatId: "1",
      senderId: "me",
      text: "Doing great! Working on the new chat app.",
      timestamp: Date.now() - 90000,
      type: "text",
    },
    {
      id: "m3",
      chatId: "1",
      senderId: "1",
      text: "Hey, check this out!",
      timestamp: Date.now() - 60000,
      type: "text",
    },
  ],
  "2": [
    {
      id: "m4",
      chatId: "2",
      senderId: "me",
      text: "Want to grab lunch?",
      timestamp: Date.now() - 360000,
      type: "text",
    },
    {
      id: "m5",
      chatId: "2",
      senderId: "2",
      text: "Sounds good 👍",
      timestamp: Date.now() - 300000,
      type: "text",
    },
  ],
  "3": [
    {
      id: "m6",
      chatId: "3",
      senderId: "3",
      text: "Meeting at 3pm?",
      timestamp: Date.now() - 7200000,
      type: "text",
    },
    {
      id: "m7",
      chatId: "3",
      senderId: "me",
      text: "Works for me!",
      timestamp: Date.now() - 3700000,
      type: "text",
    },
    {
      id: "m8",
      chatId: "3",
      senderId: "3",
      text: "See you tomorrow!",
      timestamp: Date.now() - 3600000,
      type: "text",
    },
  ],
};

const initialState: ChatState = {
  chats: [],
  messages: MOCK_MESSAGES,
  activeChatId: null,
  currentUserId: "me",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addChat(state, action: PayloadAction<Chat>) {
      state.chats.push(action.payload);
    },
    setActiveChat(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload;
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) chat.unread = 0;
    },
    sendMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        text: string;
        type?: "text" | "image" | "video";
      }>,
    ) {
      const { chatId, text, type = "text" } = action.payload;
      const msg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        chatId,
        senderId: "me",
        text,
        timestamp: Date.now(),
        type,
      };
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(msg);
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = type === "text" ? text : `📎 ${type}`;
        chat.lastMessageTime = msg.timestamp;
      }
    },
    receiveMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      if (!state.messages[msg.chatId]) state.messages[msg.chatId] = [];
      state.messages[msg.chatId].push(msg);
      const chat = state.chats.find((c) => c.id === msg.chatId);
      if (chat) {
        chat.lastMessage = msg.type === "text" ? msg.text : `📎 ${msg.type}`;
        chat.lastMessageTime = msg.timestamp;
        if (state.activeChatId !== msg.chatId) chat.unread += 1;
      }
    },
    forwardMessage(
      state,
      action: PayloadAction<{ message: Message; toChatId: string }>,
    ) {
      const { message, toChatId } = action.payload;
      const forwarded: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        chatId: toChatId,
        senderId: "me",
        text: message.text,
        timestamp: Date.now(),
        type: message.type,
        forwarded: true,
        forwardedFrom:
          state.chats.find((c) => c.id === message.chatId)?.name || "Unknown",
      };
      if (!state.messages[toChatId]) state.messages[toChatId] = [];
      state.messages[toChatId].push(forwarded);
      const chat = state.chats.find((c) => c.id === toChatId);
      if (chat) {
        chat.lastMessage = `↗️ Forwarded: ${message.type === "text" ? message.text : message.type}`;
        chat.lastMessageTime = forwarded.timestamp;
      }
    },
  },
});

export const {
  setActiveChat,
  addChat,
  sendMessage,
  receiveMessage,
  forwardMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
