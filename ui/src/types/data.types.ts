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
