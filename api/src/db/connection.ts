import mongoose from "mongoose";
import { logger } from "../helpers/logger.helper.js";

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri, {
      dbName: "chat-app",
    });
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    mongoose.disconnect();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error:", error);
});
