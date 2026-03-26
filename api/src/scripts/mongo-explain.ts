import { connectDB, disconnect } from "../db/connection.js";
import { Chat } from "../db/chat.schema.js";
import { Message } from "../db/message.schema.js";
import { User } from "../db/users.schema.js";
import { logger } from "../helpers/logger.helper.js";
import { Types } from "mongoose";

async function run() {
  await connectDB();
  try {
    await Promise.all([Chat.syncIndexes(), Message.syncIndexes(), User.syncIndexes()]);

    const sampleId = new Types.ObjectId();

    const chatPlan = (await Chat.find({
      "participants.userId": sampleId,
    })
      .sort({ updatedAt: -1 })
      .explain("executionStats")) as any;

    const messagePlan = (await Message.find({
      chatId: sampleId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .explain("executionStats")) as any;

    const userPlan = (await User.find({ email: "test@example.com" })
      .limit(1)
      .explain("executionStats")) as any;

    logger.info({
      chatWinningPlan: chatPlan.queryPlanner.winningPlan,
      messageWinningPlan: messagePlan.queryPlanner.winningPlan,
      userWinningPlan: userPlan.queryPlanner.winningPlan,
    });
  } finally {
    await disconnect();
  }
}

run().catch((error) => {
  logger.error(error);
  process.exit(1);
});
