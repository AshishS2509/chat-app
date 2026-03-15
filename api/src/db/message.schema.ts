import mongoose, { Model, Schema, type Document } from "mongoose";

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true, trim: true },
  senderId: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  timestamp: { type: Number, required: true, trim: true },
});

export const Message: Model<IMessage> = mongoose.model<IMessage>(
  "messages",
  MessageSchema,
);
