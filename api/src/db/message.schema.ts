import mongoose, { Model, Schema, Types, type Document } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  chatIdLegacy?: string;
  senderIdLegacy?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "chats", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    chatIdLegacy: { type: String, trim: true },
    senderIdLegacy: { type: String, trim: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
      },
    },
  },
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  (mongoose.models.messages as Model<IMessage> | undefined) ||
  mongoose.model<IMessage>("messages", MessageSchema);
