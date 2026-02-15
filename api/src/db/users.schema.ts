import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  hash: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    hash: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("users", UserSchema);
