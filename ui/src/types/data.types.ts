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

export interface IChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  createdAt: Date;
  email: string;
  userId: string;
  avatar: string;
}
