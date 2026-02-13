import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri, {
      dbName: "chat-app",
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

export default connectDB;
