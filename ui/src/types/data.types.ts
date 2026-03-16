export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  type?: "text" | "image" | "video";
  forwarded?: boolean;
  forwardedFrom?: string;
}

export interface IChat {
  _id: string;
  createdAt: Date;
  participants: {
    userId: string;
    name: string;
    email: string;
  };
  lastMessage: {
    sender: string;
    text: string;
    time: number;
  };
  unread: number;
}
