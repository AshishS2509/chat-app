import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
  createdAt: Date;
  participants: [
    {
      userId: string;
      name: string;
      email: string;
    },
  ];
  lastMessage: {
    sender: string;
    text: string;
    time: number;
  };
  unread: number;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        userId: { type: String, required: false, trim: true },
        name: { type: String, required: false, trim: true },
        email: { type: String, required: false, trim: true },
      },
    ],
    lastMessage: {
      sender: { type: String, required: false, trim: true },
      text: { type: String, required: false, trim: true },
      time: { type: Number, required: false, trim: true },
    },
    unread: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("chats", ChatSchema);
