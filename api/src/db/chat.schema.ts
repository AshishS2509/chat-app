import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IParticipant {
  userId: Types.ObjectId;
  userIdLegacy?: string;
  name: string;
  email: string;
}

export interface ILastMessage {
  sender: Types.ObjectId;
  senderLegacy?: string;
  text: string;
  at: Date;
}

export interface IChat extends Document {
  createdAt: Date;
  updatedAt: Date;
  participants: IParticipant[];
  participantKey?: string;
  lastMessage: ILastMessage;
  unread: number;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    userIdLegacy: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false },
);

const LastMessageSchema = new Schema<ILastMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "users", required: true },
    senderLegacy: { type: String, trim: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const ChatSchema = new Schema<IChat>(
  {
    participants: {
      type: [ParticipantSchema],
      required: true,
      validate: {
        validator: (value: IParticipant[]) => value.length === 2,
        message: "Direct chats must contain exactly 2 participants",
      },
    },
    participantKey: { type: String, trim: true },
    lastMessage: { type: LastMessageSchema, required: true },
    unread: { type: Number, required: true, default: 0, min: 0 },
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

ChatSchema.index({ "participants.userId": 1, updatedAt: -1 });
ChatSchema.index(
  { participantKey: 1 },
  { unique: true, partialFilterExpression: { participantKey: { $exists: true } } },
);

export const Chat: Model<IChat> =
  (mongoose.models.chats as Model<IChat> | undefined) ||
  mongoose.model<IChat>("chats", ChatSchema);
