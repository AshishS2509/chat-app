import assert from "node:assert";
import mongoose, { Types } from "mongoose";
import { Chat } from "../db/chat.schema.js";
import { Message } from "../db/message.schema.js";

function testChatValidation() {
  const one = new Types.ObjectId();
  const two = new Types.ObjectId();

  const chat = new Chat({
    participants: [
      { userId: one, userIdLegacy: one.toString(), name: "A", email: "a@a.com" },
      { userId: two, userIdLegacy: two.toString(), name: "B", email: "b@b.com" },
    ],
    participantKey: [one.toString(), two.toString()].sort().join(":"),
    lastMessage: { sender: one, senderLegacy: one.toString(), text: "hello", at: new Date() },
    unread: 0,
  });

  const err = chat.validateSync();
  assert.equal(err, undefined);
}

function testMessageValidation() {
  const message = new Message({
    chatId: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    chatIdLegacy: new Types.ObjectId().toString(),
    senderIdLegacy: new Types.ObjectId().toString(),
    text: "hi",
  });

  const err = message.validateSync();
  assert.equal(err, undefined);
}

function testInvalidDirectChatValidation() {
  const onlyOne = new Chat({
    participants: [
      {
        userId: new Types.ObjectId(),
        userIdLegacy: new Types.ObjectId().toString(),
        name: "A",
        email: "a@a.com",
      },
    ],
    lastMessage: {
      sender: new Types.ObjectId(),
      senderLegacy: new Types.ObjectId().toString(),
      text: "hello",
      at: new Date(),
    },
    unread: 0,
  });

  const err = onlyOne.validateSync();
  assert.ok(err);
}

async function run() {
  mongoose.set("strictQuery", true);
  testChatValidation();
  testMessageValidation();
  testInvalidDirectChatValidation();
  console.log("schema-smoke-test passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
