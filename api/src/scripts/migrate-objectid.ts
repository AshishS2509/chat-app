import mongoose, { Types } from "mongoose";
import { connectDB, disconnect } from "../db/connection.js";
import { Chat } from "../db/chat.schema.js";
import { Message } from "../db/message.schema.js";
import { logger } from "../helpers/logger.helper.js";

function toObjectId(value: unknown): Types.ObjectId | null {
  if (value instanceof Types.ObjectId) return value;
  if (typeof value !== "string") return null;
  if (!Types.ObjectId.isValid(value)) return null;
  return new Types.ObjectId(value);
}

async function migrateChats() {
  const chats = await Chat.find({});
  let updatedCount = 0;

  for (const chat of chats) {
    let dirty = false;

    const nextParticipants = chat.participants.map((participant) => {
      const legacy = participant.userIdLegacy ?? (participant.userId as unknown as string);
      const objectId = toObjectId(participant.userId) ?? toObjectId(legacy);

      if (objectId && !participant.userId.equals(objectId)) dirty = true;
      if (!participant.userIdLegacy && legacy) dirty = true;

      return {
        ...participant,
        userId: objectId ?? participant.userId,
        userIdLegacy: legacy,
      };
    });

    const participantKey = nextParticipants
      .map((participant) => participant.userId.toString())
      .sort()
      .join(":");
    if (participantKey !== chat.participantKey) dirty = true;

    const lastMessageSenderLegacy = chat.lastMessage.senderLegacy;
    const migratedLastMessageSender =
      toObjectId(chat.lastMessage.sender) ??
      toObjectId(lastMessageSenderLegacy) ??
      chat.lastMessage.sender;

    if (!chat.lastMessage.sender.equals(migratedLastMessageSender)) dirty = true;

    if (!dirty) continue;

    chat.participants = nextParticipants;
    chat.participantKey = participantKey;
    chat.lastMessage.sender = migratedLastMessageSender;
    if (!chat.lastMessage.senderLegacy && lastMessageSenderLegacy) {
      chat.lastMessage.senderLegacy = lastMessageSenderLegacy;
    }
    await chat.save();
    updatedCount += 1;
  }

  logger.info(`migrateChats updated ${updatedCount} chat documents`);
}

async function migrateMessages() {
  const messages = await Message.find({});
  let updatedCount = 0;

  for (const message of messages) {
    const nextChatId = toObjectId(message.chatId) ?? toObjectId(message.chatIdLegacy);
    const nextSenderId =
      toObjectId(message.senderId) ?? toObjectId(message.senderIdLegacy);

    let dirty = false;
    if (nextChatId && !message.chatId.equals(nextChatId)) dirty = true;
    if (nextSenderId && !message.senderId.equals(nextSenderId)) dirty = true;
    if (!message.chatIdLegacy) dirty = true;
    if (!message.senderIdLegacy) dirty = true;
    if (!dirty) continue;

    if (nextChatId) message.chatId = nextChatId;
    if (nextSenderId) message.senderId = nextSenderId;
    if (!message.chatIdLegacy) message.chatIdLegacy = message.chatId.toString();
    if (!message.senderIdLegacy) message.senderIdLegacy = message.senderId.toString();
    await message.save();
    updatedCount += 1;
  }

  logger.info(`migrateMessages updated ${updatedCount} message documents`);
}

async function run() {
  await connectDB();
  try {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection is not initialized");
    }
    await mongoose.connection.db.command({ ping: 1 });
    await migrateChats();
    await migrateMessages();
    logger.info("ObjectId migration completed");
  } finally {
    await disconnect();
  }
}

run().catch((error) => {
  logger.error(error);
  process.exit(1);
});
