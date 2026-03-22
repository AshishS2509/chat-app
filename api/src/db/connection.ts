import mongoose from "mongoose";
import pino from "pino";

const mongodbUri = process.env.MONGODB_URI;
const logger = pino();
if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri, {
      dbName: "chat-app",
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error:", error);
});

export default connectDB;
