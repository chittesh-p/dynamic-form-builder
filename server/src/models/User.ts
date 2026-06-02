import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.model("User", userSchema);

