import mongoose from "mongoose";

export interface IChatMessage {
  _id?: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: "user" | "deliveryBoy" | "admin";
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatMessageSchema = new mongoose.Schema<IChatMessage>(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ room: 1, createdAt: 1 });

const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

export default ChatMessage;
