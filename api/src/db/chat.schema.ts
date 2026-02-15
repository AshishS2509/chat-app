import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  createdAt: Date;
  email: string;
  user: string;
  avatar: string;
}

const ChatSchema = new Schema<IChat>(
  {
    name: { type: String, required: true, trim: true },
    lastMessage: { type: String, required: false, trim: true },
    lastMessageTime: { type: Date, required: false },
    unread: { type: Number, required: true },
    email: { type: String, required: true, trim: true },
    user: { type: String, required: true, trim: true },
    avatar: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  },
);

export const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("chats", ChatSchema);
